// @flow
import { spawn } from 'child_process';
import find from 'find-process';
import tcpPortUsed from 'tcp-port-used';
import type { ChildProcess } from 'child_process';
import type { Process } from '../utils/processes';
import type { BccNodeProcessNames } from '../../common/types/bcc-node.types';
import { environment } from '../environment';
import { logger } from '../utils/logging';

export type SelfnodeOptions = {
  selfnodeBin: string,
  mockTokenMetadataServerBin: string,
  processName: BccNodeProcessNames,
  onStop: Function,
};

export type Selfnode = {
  pid: number,
  wpid: number,
  stop: Function,
  connected: boolean,
};

let mockTokenMetadataServer = null;
const platform = String(environment.platform);

const BCC_WALLET_PORT = 8088;
const BCC_WALLET_START_TIMEOUT = 60 * 1000; // 60 seconds | unit: milliseconds
const BCC_WALLET_START_CHECK_INTERVAL = 500; // 500 ms | unit: milliseconds
const SOPHIE_TEST_DATA = '../../utils/bcc/selfnode';
const TOKEN_METADATA_REGISTRY = './utils/bcc/selfnode/token-metadata.json';
const TOKEN_METADATA_SERVER_PORT = 65432;
const TOKEN_METADATA_SERVER = `http://localhost:${TOKEN_METADATA_SERVER_PORT}/`;
const TOKEN_METADATA_SERVER_PROCESS_NAME =
  platform === 'win32'
    ? 'mock-token-metadata-server.exe'
    : 'mock-token-metadata-server';

export async function BccSelfnodeLauncher(
  selfnodeOptions: SelfnodeOptions
): Promise<{
  node: Selfnode,
  replyPort: number,
}> {
  return new Promise(async (resolve, reject) => {
    const {
      selfnodeBin,
      mockTokenMetadataServerBin,
      processName,
      onStop,
    } = selfnodeOptions;
    setupMockTokenMetadataServer(mockTokenMetadataServerBin);
    const processList: Array<Process> = await find('port', BCC_WALLET_PORT);
    const isSelfnodeRunning =
      processList.length && processList[0].name === processName;
    if (isSelfnodeRunning) {
      logger.info('Bcc-node is already running...', {
        selfnodeBin,
        BCC_WALLET_PORT,
        SOPHIE_TEST_DATA,
        TOKEN_METADATA_SERVER,
      });
      const nodeProcess: Process = processList[0];
      const node: Selfnode = setupSelfnode({
        processName,
        nodeProcess,
        onStop,
        connected: true,
      });
      resolve({ node, replyPort: BCC_WALLET_PORT });
    } else {
      logger.info('Starting bcc-node now...', {
        selfnodeBin,
        BCC_WALLET_PORT,
        SOPHIE_TEST_DATA,
        TOKEN_METADATA_SERVER,
      });
      const nodeProcess: ChildProcess = spawn(selfnodeBin, [], {
        env: {
          ...process.env,
          BCC_WALLET_PORT,
          SOPHIE_TEST_DATA,
          TOKEN_METADATA_SERVER,
        },
        detached: true, // allows Klarity to exit independently of selfnode (1/3)
        stdio: 'ignore', // allows Klarity to exit independently of selfnode (2/3)
      });
      nodeProcess.unref(); // allows Klarity to exit independently of selfnode (3/3)
      const node: Selfnode = setupSelfnode({
        processName,
        nodeProcess,
        onStop,
        connected: false, // selfnode is kept in disconnected state until it starts responding
      });
      tcpPortUsed
        .waitUntilUsed(
          BCC_WALLET_PORT,
          BCC_WALLET_START_CHECK_INTERVAL,
          BCC_WALLET_START_TIMEOUT
        )
        .then(() => {
          node.connected = true;
          resolve({ node, replyPort: BCC_WALLET_PORT });
        })
        .catch((exitStatus) => {
          reject(exitStatus);
        });
    }
  });
}

const setupSelfnode = ({
  processName,
  nodeProcess,
  onStop,
  connected,
}: {
  processName: BccNodeProcessNames,
  nodeProcess: ChildProcess | Process,
  onStop: Function,
  connected: boolean,
}): Selfnode =>
  Object.assign({}, nodeProcess, {
    wpid: nodeProcess.pid,
    stop: async () => {
      if (mockTokenMetadataServer !== null) {
        await onStop(
          mockTokenMetadataServer.pid,
          TOKEN_METADATA_SERVER_PROCESS_NAME
        );
      }
      await onStop(nodeProcess.pid, processName);
    },
    connected,
  });

const setupMockTokenMetadataServer = async (
  mockTokenMetadataServerBin: string
) => {
  const processList: Array<Process> = await find(
    'port',
    TOKEN_METADATA_SERVER_PORT
  );
  const isMockTokenMetadataServerRunning =
    processList.length &&
    processList[0].name === TOKEN_METADATA_SERVER_PROCESS_NAME;
  if (isMockTokenMetadataServerRunning) {
    logger.info('Mock-token-metadata-server is already running...', {
      mockTokenMetadataServerBin,
      TOKEN_METADATA_SERVER_PORT,
      TOKEN_METADATA_REGISTRY,
      TOKEN_METADATA_SERVER,
    });
    mockTokenMetadataServer = Object.assign({}, processList[0]);
  } else {
    logger.info('Starting mock-token-metadata-server now...', {
      mockTokenMetadataServerBin,
      TOKEN_METADATA_SERVER_PORT,
      TOKEN_METADATA_REGISTRY,
      TOKEN_METADATA_SERVER,
    });
    const mockTokenMetadataServerProcess = spawn(
      mockTokenMetadataServerBin,
      [
        '--port',
        TOKEN_METADATA_SERVER_PORT.toString(),
        TOKEN_METADATA_REGISTRY,
      ],
      {
        env: { ...process.env },
        detached: true,
        stdio: 'ignore',
      }
    );
    mockTokenMetadataServerProcess.unref();
    mockTokenMetadataServer = mockTokenMetadataServerProcess;
  }
};
