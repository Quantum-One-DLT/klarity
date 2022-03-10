// @flow
import { BrowserWindow } from 'electron';
import { createWriteStream, readFileSync } from 'fs';
import { exec, spawn } from 'child_process';
import { BccNode } from './BccNode';
import { exportWallets } from './utils';
import {
  NODE_KILL_TIMEOUT,
  NODE_SHUTDOWN_TIMEOUT,
  NODE_STARTUP_MAX_RETRIES,
  NODE_STARTUP_TIMEOUT,
  NODE_UPDATE_TIMEOUT,
} from '../config';
import { logger } from '../utils/logging';
import type { LauncherConfig } from '../config';
import type {
  BccNodeState,
  BccStatus,
  TlsConfig,
} from '../../common/types/bcc-node.types';
import type { ExportWalletsRendererRequest } from '../../common/ipc/api';
import {
  bccAwaitUpdateChannel,
  bccFaultInjectionChannel,
  bccRestartChannel,
  bccStateChangeChannel,
  getCachedBccStatusChannel,
  bccTlsConfigChannel,
  setCachedBccStatusChannel,
  exportWalletsChannel,
} from '../ipc/bcc.ipc';
import { safeExitWithCode } from '../utils/safeExitWithCode';

const startBccNode = (
  node: BccNode,
  launcherConfig: LauncherConfig
) => {
  const {
    logsPrefix,
    nodeImplementation,
    nodeConfig,
    tlsPath,
    stateDir,
    cluster,
    configPath,
    syncTolerance,
    cliBin,
    isStaging,
    metadataUrl,
  } = launcherConfig;
  const logFilePath = `${logsPrefix}/pub/`;
  const config = {
    logFilePath,
    nodeImplementation,
    nodeConfig,
    tlsPath,
    stateDir,
    cluster,
    configPath,
    syncTolerance,
    cliBin,
    isStaging,
    metadataUrl,
    startupTimeout: NODE_STARTUP_TIMEOUT,
    startupMaxRetries: NODE_STARTUP_MAX_RETRIES,
    shutdownTimeout: NODE_SHUTDOWN_TIMEOUT,
    killTimeout: NODE_KILL_TIMEOUT,
    updateTimeout: NODE_UPDATE_TIMEOUT,
  };
  return node.start(config);
};

const restartBccNode = async (node: BccNode) => {
  try {
    await node.restart();
  } catch (error) {
    logger.error('Could not restart BccNode', { error });
  }
};

/**
 * Configures, starts and manages the BccNode responding to node
 * state changes, app events and IPC messages coming from the renderer.
 *
 * @param launcherConfig {LauncherConfig}
 * @param mainWindow
 */
export const setupBccNode = (
  launcherConfig: LauncherConfig,
  mainWindow: BrowserWindow
): BccNode => {
  const bccNode = new BccNode(
    logger,
    {
      // Dependencies on node.js apis are passed as props to ease testing
      spawn,
      exec,
      readFileSync,
      createWriteStream,
      broadcastTlsConfig: (config: ?TlsConfig) => {
        if (!mainWindow.isDestroyed())
          bccTlsConfigChannel.send(config, mainWindow);
      },
      broadcastStateChange: (state: BccNodeState) => {
        if (!mainWindow.isDestroyed())
          bccStateChangeChannel.send(state, mainWindow);
      },
    },
    {
      // BccNode lifecycle hooks
      onStarting: () => {},
      onRunning: () => {},
      onStopping: () => {},
      onStopped: () => {},
      onUpdating: () => {},
      onUpdated: () => {},
      onCrashed: (code) => {
        const restartTimeout = bccNode.startupTries > 0 ? 30000 : 1000;
        logger.info(
          `BccNode crashed with code ${code}. Restarting in ${restartTimeout}ms...`,
          { code, restartTimeout }
        );
        setTimeout(() => restartBccNode(bccNode), restartTimeout);
      },
      onError: () => {},
      onUnrecoverable: () => {},
    }
  );

  startBccNode(bccNode, launcherConfig);

  getCachedBccStatusChannel.onRequest(() => {
    logger.info('ipcMain: Received request from renderer for bcc status', {
      status: bccNode.status,
    });
    return Promise.resolve(bccNode.status);
  });

  setCachedBccStatusChannel.onReceive((status: ?BccStatus) => {
    logger.info(
      'ipcMain: Received request from renderer to cache bcc status',
      { status }
    );
    bccNode.saveStatus(status);
    return Promise.resolve();
  });

  bccStateChangeChannel.onRequest(() => {
    logger.info('ipcMain: Received request from renderer for node state', {
      state: bccNode.state,
    });
    return Promise.resolve(bccNode.state);
  });

  bccTlsConfigChannel.onRequest(() => {
    logger.info('ipcMain: Received request from renderer for tls config');
    return Promise.resolve(bccNode.tlsConfig);
  });

  bccAwaitUpdateChannel.onReceive(() => {
    logger.info('ipcMain: Received request from renderer to await update');
    setTimeout(async () => {
      await bccNode.expectNodeUpdate();
      logger.info(
        'BccNode applied an update. Exiting Klarity with code 20.'
      );
      safeExitWithCode(20);
    });
    return Promise.resolve();
  });

  bccRestartChannel.onReceive(() => {
    logger.info('ipcMain: Received request from renderer to restart node');
    return bccNode.restart(true); // forced restart
  });

  bccFaultInjectionChannel.onReceive((fault) => {
    logger.info(
      'ipcMain: Received request to inject a fault into bcc node',
      { fault }
    );
    return bccNode.setFault(fault);
  });

  exportWalletsChannel.onRequest(
    ({ exportSourcePath, locale }: ExportWalletsRendererRequest) => {
      logger.info('ipcMain: Received request from renderer to export wallets', {
        exportSourcePath,
      });
      return Promise.resolve(
        exportWallets(exportSourcePath, launcherConfig, mainWindow, locale)
      );
    }
  );

  return bccNode;
};
