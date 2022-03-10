// @flow
import os from 'os';
import path from 'path';
import { app, dialog, BrowserWindow, screen, shell } from 'electron';
import { client } from 'electron-connect';
import EventEmitter from 'events';
import { requestElectronStore } from './ipc/electronStoreConversation';
import { logger } from './utils/logging';
import {
  setupLogging,
  logSystemInfo,
  logStateSnapshot,
  generateWalletMigrationReport,
} from './utils/setupLogging';
import { handleDiskSpace } from './utils/handleDiskSpace';
import { handleCheckBlockReplayProgress } from './utils/handleCheckBlockReplayProgress';
import { createMainWindow } from './windows/main';
import { installChromeExtensions } from './utils/installChromeExtensions';
import { environment } from './environment';
import mainErrorHandler from './utils/mainErrorHandler';
import {
  launcherConfig,
  pubLogsFolderPath,
  stateDirectoryPath,
} from './config';
import { setupBccNode } from './bcc/setup';
import { BccNode } from './bcc/BccNode';
import { safeExitWithCode } from './utils/safeExitWithCode';
import { buildAppMenus } from './utils/buildAppMenus';
import { getLocale } from './utils/getLocale';
import { detectSystemLocale } from './utils/detectSystemLocale';
import { ensureXDGDataIsSet } from './bcc/config';
import { rebuildApplicationMenu } from './ipc/rebuild-application-menu';
import { getStateDirectoryPathChannel } from './ipc/getStateDirectoryPathChannel';
import { getDesktopDirectoryPathChannel } from './ipc/getDesktopDirectoryPathChannel';
import { getSystemLocaleChannel } from './ipc/getSystemLocaleChannel';
import { BccNodeStates } from '../common/types/bcc-node.types';
import type { CheckDiskSpaceResponse } from '../common/types/no-disk-space.types';
import { logUsedVersion } from './utils/logUsedVersion';
import { setStateSnapshotLogChannel } from './ipc/set-log-state-snapshot';
import { generateWalletMigrationReportChannel } from './ipc/generateWalletMigrationReportChannel';
import { enableApplicationMenuNavigationChannel } from './ipc/enableApplicationMenuNavigationChannel';
import { pauseActiveDownloads } from './ipc/downloadManagerChannel';
import {
  restoreSavedWindowBounds,
  saveWindowBoundsOnSizeAndPositionChange,
} from './windows/windowBounds';

/* eslint-disable consistent-return */

// Global references to windows to prevent them from being garbage collected
let mainWindow: BrowserWindow;
let bccNode: ?BccNode;

const {
  isDev,
  isTest,
  isWatchMode,
  isBlankScreenFixActive,
  isSelfnode,
  network,
  os: osName,
  version: klarityVersion,
  nodeVersion: bccNodeVersion,
  apiVersion: bccWalletVersion,
  keepLocalClusterRunning,
} = environment;

if (isBlankScreenFixActive) {
  // Run "location.assign('chrome://gpu')" in JavaScript console to see if the flag is active
  app.disableHardwareAcceleration();
}

// Increase maximum event listeners to avoid IPC channel stalling
// (1/2) this line increases the limit for the main process
EventEmitter.defaultMaxListeners = 100; // Default: 10

app.allowRendererProcessReuse = true;
const safeExit = async () => {
  pauseActiveDownloads();
  if (!bccNode || bccNode.state === BccNodeStates.STOPPED) {
    logger.info('Klarity:safeExit: exiting Klarity with code 0', { code: 0 });
    return safeExitWithCode(0);
  }
  if (bccNode.state === BccNodeStates.STOPPING) {
    logger.info('Klarity:safeExit: waiting for bcc-node to stop...');
    bccNode.exitOnStop();
    return;
  }
  try {
    const pid = bccNode.pid || 'null';
    logger.info(`Klarity:safeExit: stopping bcc-node with PID: ${pid}`, {
      pid,
    });
    await bccNode.stop();
    logger.info('Klarity:safeExit: exiting Klarity with code 0', { code: 0 });
    safeExitWithCode(0);
  } catch (error) {
    logger.error('Klarity:safeExit: bcc-node did not exit correctly', {
      error,
    });
    safeExitWithCode(0);
  }
};

const onAppReady = async () => {
  setupLogging();
  logUsedVersion(
    environment.version,
    path.join(pubLogsFolderPath, 'Klarity-versions.json')
  );

  const cpu = os.cpus();
  const platformVersion = os.release();
  const ram = JSON.stringify(os.totalmem(), null, 2);
  const startTime = new Date().toISOString();
  // first checks for japanese locale, otherwise returns english
  const systemLocale = detectSystemLocale();

  const systemInfo = logSystemInfo({
    bccNodeVersion,
    bccWalletVersion,
    cpu,
    klarityVersion,
    isBlankScreenFixActive,
    network,
    osName,
    platformVersion,
    ram,
    startTime,
  });

  // We need KLARITY_INSTALL_DIRECTORY in PATH in order for the
  // bcc-launcher to find bcc-wallet and bcc-node executables
  process.env.PATH = [
    process.env.PATH,
    process.env.KLARITY_INSTALL_DIRECTORY,
  ].join(path.delimiter);

  logger.info(`Klarity is starting at ${startTime}`, { startTime });

  logger.info('Updating System-info.json file', { ...systemInfo.data });

  logger.info(`Current working directory is: ${process.cwd()}`, {
    cwd: process.cwd(),
  });

  ensureXDGDataIsSet();
  await installChromeExtensions(isDev);

  // Detect locale
  let locale = getLocale(network);
  mainWindow = createMainWindow(
    locale,
    restoreSavedWindowBounds(screen, requestElectronStore)
  );
  saveWindowBoundsOnSizeAndPositionChange(mainWindow, requestElectronStore);

  const onCheckDiskSpace = ({
    isNotEnoughDiskSpace,
  }: CheckDiskSpaceResponse) => {
    if (bccNode) {
      if (isNotEnoughDiskSpace) {
        if (
          bccNode.state !== BccNodeStates.STOPPING &&
          bccNode.state !== BccNodeStates.STOPPED
        ) {
          try {
            bccNode.stop();
          } catch (e) {} // eslint-disable-line
        }
      } else if (
        bccNode.state !== BccNodeStates.STARTING &&
        bccNode.state !== BccNodeStates.RUNNING
      ) {
        bccNode.restart();
      }
    }
  };
  const handleCheckDiskSpace = handleDiskSpace(mainWindow, onCheckDiskSpace);
  const onMainError = (error: string) => {
    if (error.indexOf('ENOSPC') > -1) {
      handleCheckDiskSpace();
      return false;
    }
  };
  mainErrorHandler(onMainError);
  await handleCheckDiskSpace();

  await handleCheckBlockReplayProgress(mainWindow, launcherConfig.logsPrefix);

  bccNode = setupBccNode(launcherConfig, mainWindow);

  if (isWatchMode) {
    // Connect to electron-connect server which restarts / reloads windows on file changes
    client.create(mainWindow);
  }

  setStateSnapshotLogChannel.onReceive((data) => {
    return Promise.resolve(logStateSnapshot(data));
  });

  generateWalletMigrationReportChannel.onReceive((data) => {
    return Promise.resolve(generateWalletMigrationReport(data));
  });

  getStateDirectoryPathChannel.onRequest(() =>
    Promise.resolve(stateDirectoryPath)
  );

  getDesktopDirectoryPathChannel.onRequest(() =>
    Promise.resolve(app.getPath('desktop'))
  );

  getSystemLocaleChannel.onRequest(() => Promise.resolve(systemLocale));

  mainWindow.on('close', async (event) => {
    logger.info(
      'mainWindow received <close> event. Safe exiting Klarity now.'
    );
    event.preventDefault();
    await safeExit();
  });

  buildAppMenus(mainWindow, bccNode, locale, {
    isNavigationEnabled: false,
  });

  await enableApplicationMenuNavigationChannel.onReceive(
    () =>
      new Promise((resolve) => {
        buildAppMenus(mainWindow, bccNode, locale, {
          isNavigationEnabled: true,
        });
        resolve();
      })
  );

  await rebuildApplicationMenu.onReceive(
    (data) =>
      new Promise((resolve) => {
        locale = getLocale(network);
        buildAppMenus(mainWindow, bccNode, locale, {
          isNavigationEnabled: data.isNavigationEnabled,
        });
        mainWindow.updateTitle(locale);
        resolve();
      })
  );

  // Security feature: Prevent creation of new browser windows
  // https://github.com/electron/electron/blob/master/docs/tutorial/security.md#14-disable-or-limit-creation-of-new-windows
  app.on('web-contents-created', (_, contents) => {
    contents.on('new-window', (event, url) => {
      // Prevent creation of new BrowserWindows via links / window.open
      event.preventDefault();
      logger.info('Prevented creation of new browser window', { url });
      // Open these links with the default browser
      shell.openExternal(url);
    });
  });

  // Wait for controlled bcc-node shutdown before quitting the app
  app.on('before-quit', async (event) => {
    logger.info('app received <before-quit> event. Safe exiting Klarity now.');
    event.preventDefault(); // prevent Klarity from quitting immediately

    if (isSelfnode) {
      if (keepLocalClusterRunning || isTest) {
        logger.info(
          'ipcMain: Keeping the local cluster running while exiting Klarity',
          {
            keepLocalClusterRunning,
          }
        );
        return safeExitWithCode(0);
      }

      const exitSelfnodeDialogOptions = {
        buttons: ['Yes', 'No'],
        type: 'warning',
        title: 'Klarity is about to close',
        message: 'Do you want to keep the local cluster running?',
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      };
      const { response } = await dialog.showMessageBox(
        mainWindow,
        exitSelfnodeDialogOptions
      );
      if (response === 0) {
        logger.info(
          'ipcMain: Keeping the local cluster running while exiting Klarity'
        );
        return safeExitWithCode(0);
      }
      logger.info('ipcMain: Exiting local cluster together with Klarity');
    }

    await safeExit();
  });
};

// Make sure this is the only Klarity instance running per cluster before doing anything else
const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.on('ready', onAppReady);
}
