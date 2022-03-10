// @flow
import { merge } from 'lodash';
import path from 'path';
import * as fs from 'fs-extra';
import type { WriteStream } from 'fs';
import * as bccLauncher from 'bcc-launcher';
import type { Launcher } from 'bcc-launcher';
import type { NodeConfig } from '../config';
import { environment } from '../environment';
import {
  FALLBACK_TOKEN_METADATA_SERVER_URL,
  MOCK_TOKEN_METADATA_SERVER_URL,
  MOCK_TOKEN_METADATA_SERVER_PORT,
} from '../config';
import {
  MAINNET,
  STAGING,
  TESTNET,
  SELFNODE,
} from '../../common/types/environment.types';
import { BccNodeImplementationOptions } from '../../common/types/bcc-node.types';
import { createSelfnodeConfig } from './utils';
import { logger } from '../utils/logging';
import type { BccNodeImplementations } from '../../common/types/bcc-node.types';

export type WalletOptions = {
  nodeImplementation: BccNodeImplementations,
  nodeConfig: NodeConfig,
  cluster: string,
  stateDir: string,
  tlsPath: string,
  configPath: string,
  syncTolerance: string,
  nodeLogFile: WriteStream,
  walletLogFile: WriteStream,
  cliBin: string,
  isStaging: boolean,
  metadataUrl?: string,
};

export async function BccWalletLauncher(
  walletOptions: WalletOptions
): Launcher {
  const {
    nodeImplementation,
    nodeConfig, // For bcc-node / cole only!
    cluster,
    stateDir,
    tlsPath,
    configPath,
    syncTolerance,
    nodeLogFile,
    walletLogFile,
    cliBin,
    isStaging,
    metadataUrl,
  } = walletOptions;
  // TODO: Update launcher config to pass number
  const syncToleranceSeconds = parseInt(syncTolerance.replace('s', ''), 10);

  // Shared launcher config (node implementations agnostic)
  const launcherConfig = {
    networkName: cluster,
    stateDir,
    nodeConfig: {
      kind: nodeImplementation,
      configurationDir: '',
      network: {
        configFile: configPath,
      },
    },
    syncToleranceSeconds,
    childProcessLogWriteStreams: {
      node: nodeLogFile,
      wallet: walletLogFile,
    },
    installSignalHandlers: false,
  };

  // TLS configuration used only for bcc-node
  const tlsConfiguration = {
    caCert: path.join(tlsPath, 'server/ca.crt'),
    svCert: path.join(tlsPath, 'server/server.crt'),
    svKey: path.join(tlsPath, 'server/server.key'),
  };

  // Prepare development TLS files
  const { isProduction } = environment;
  if (
    !isProduction &&
    nodeImplementation === BccNodeImplementationOptions.BCC
  ) {
    await fs.copy('tls', tlsPath);
  }

  let tokenMetadataServer;

  // This switch statement handles any node specific
  // configuration, prior to spawning the child process
  logger.info('Node implementation', { nodeImplementation });
  switch (nodeImplementation) {
    case BccNodeImplementationOptions.BCC:
      if (cluster === SELFNODE) {
        const { configFile, genesisFile } = nodeConfig.network;
        const {
          configPath: selfnodeConfigPath,
          genesisPath: selfnodeGenesisPath,
          genesisHash: selfnodeGenesisHash,
        } = await createSelfnodeConfig(
          configFile,
          genesisFile,
          stateDir,
          cliBin
        );
        nodeConfig.network.configFile = selfnodeConfigPath;
        nodeConfig.network.genesisFile = selfnodeGenesisPath;
        nodeConfig.network.genesisHash = selfnodeGenesisHash;
        merge(launcherConfig, { apiPort: 8088 });
      }
      if (cluster === MAINNET) {
        launcherConfig.networkName = MAINNET;
        logger.info('Launching Wallet with --mainnet flag');
      } else if (isStaging) {
        launcherConfig.networkName = STAGING;
        logger.info('Launching Wallet with --staging flag');
      } else {
        // All clusters not flagged as staging except for Mainnet are treated as "Testnets"
        launcherConfig.networkName = TESTNET;
        logger.info('Launching Wallet with --testnet flag');
      }
      if (MOCK_TOKEN_METADATA_SERVER_PORT) {
        tokenMetadataServer = `${MOCK_TOKEN_METADATA_SERVER_URL}:${MOCK_TOKEN_METADATA_SERVER_PORT}`;
      } else if (metadataUrl) {
        tokenMetadataServer = metadataUrl;
      } else {
        tokenMetadataServer = FALLBACK_TOKEN_METADATA_SERVER_URL;
      }
      logger.info('Launching Wallet with --token-metadata-server flag', {
        tokenMetadataServer,
      });
      merge(launcherConfig, {
        nodeConfig,
        tlsConfiguration,
        tokenMetadataServer,
      });
      break;
    default:
      break;
  }

  logger.info('Setting up BccLauncher now...', {
    walletOptions,
    launcherConfig,
  });

  return new bccLauncher.Launcher(launcherConfig, logger);
}
