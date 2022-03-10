// @flow
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents';
import AppBcc, { utils } from '@bcc-foundation/ledgerjs-hw-app-bcc';
import { BrowserWindow } from 'electron';
import TrezorConnect, {
  DEVICE_EVENT,
  TRANSPORT_EVENT,
  TRANSPORT,
  UI_EVENT,
  UI,
  DEVICE,
  // $FlowFixMe
} from 'trezor-connect';
import { get, omit, last, find, includes } from 'lodash';
import { derivePublic as deriveChildXpub } from 'bcc-crypto.js';
import { MainIpcChannel } from './lib/MainIpcChannel';
import {
  GET_HARDWARE_WALLET_TRANSPORT_CHANNEL,
  GET_EXTENDED_PUBLIC_KEY_CHANNEL,
  GET_BCC_BCC_APP_CHANNEL,
  GET_HARDWARE_WALLET_CONNECTION_CHANNEL,
  SIGN_TRANSACTION_LEDGER_CHANNEL,
  SIGN_TRANSACTION_TREZOR_CHANNEL,
  GET_INIT_TREZOR_CONNECT_CHANNEL,
  GET_INIT_LEDGER_CONNECT_CHANNEL,
  DERIVE_XPUB_CHANNEL,
  RESET_ACTION_TREZOR_CHANNEL,
  DERIVE_ADDRESS_CHANNEL,
  SHOW_ADDRESS_CHANNEL,
} from '../../common/ipc/api';

import { logger } from '../utils/logging';

import type {
  getHardwareWalletTransportRendererRequest,
  getHardwareWalletTransportMainResponse,
  getExtendedPublicKeyRendererRequest,
  getExtendedPublicKeyMainResponse,
  getBccBccAppRendererRequest,
  getBccBccAppMainResponse,
  getHardwareWalletConnectiontMainRequest,
  getHardwareWalletConnectiontRendererResponse,
  signTransactionLedgerRendererRequest,
  signTransactionLedgerMainResponse,
  signTransactionTrezorRendererRequest,
  signTransactionTrezorMainResponse,
  handleInitTrezorConnectRendererRequest,
  handleInitTrezorConnectMainResponse,
  handleInitLedgerConnectRendererRequest,
  handleInitLedgerConnectMainResponse,
  resetTrezorActionRendererRequest,
  resetTrezorActionMainResponse,
  deriveXpubRendererRequest,
  deriveXpubMainResponse,
  deriveAddressRendererRequest,
  deriveAddressMainResponse,
  showAddressRendererRequest,
  showAddressMainResponse,
} from '../../common/ipc/api';

const getHardwareWalletTransportChannel: MainIpcChannel<
  getHardwareWalletTransportRendererRequest,
  getHardwareWalletTransportMainResponse
> = new MainIpcChannel(GET_HARDWARE_WALLET_TRANSPORT_CHANNEL);

const getExtendedPublicKeyChannel: MainIpcChannel<
  getExtendedPublicKeyRendererRequest,
  getExtendedPublicKeyMainResponse
> = new MainIpcChannel(GET_EXTENDED_PUBLIC_KEY_CHANNEL);

const getBccBccAppChannel: MainIpcChannel<
  getBccBccAppRendererRequest,
  getBccBccAppMainResponse
> = new MainIpcChannel(GET_BCC_BCC_APP_CHANNEL);

const getHardwareWalletConnectionChannel: MainIpcChannel<
  getHardwareWalletConnectiontMainRequest,
  getHardwareWalletConnectiontRendererResponse
> = new MainIpcChannel(GET_HARDWARE_WALLET_CONNECTION_CHANNEL);

const signTransactionLedgerChannel: MainIpcChannel<
  signTransactionLedgerRendererRequest,
  signTransactionLedgerMainResponse
> = new MainIpcChannel(SIGN_TRANSACTION_LEDGER_CHANNEL);

const signTransactionTrezorChannel: MainIpcChannel<
  signTransactionTrezorRendererRequest,
  signTransactionTrezorMainResponse
> = new MainIpcChannel(SIGN_TRANSACTION_TREZOR_CHANNEL);

const resetTrezorActionChannel: MainIpcChannel<
  resetTrezorActionRendererRequest,
  resetTrezorActionMainResponse
> = new MainIpcChannel(RESET_ACTION_TREZOR_CHANNEL);

const handleInitTrezorConnectChannel: MainIpcChannel<
  handleInitTrezorConnectRendererRequest,
  handleInitTrezorConnectMainResponse
> = new MainIpcChannel(GET_INIT_TREZOR_CONNECT_CHANNEL);

const handleInitLedgerConnectChannel: MainIpcChannel<
  handleInitLedgerConnectRendererRequest,
  handleInitLedgerConnectMainResponse
> = new MainIpcChannel(GET_INIT_LEDGER_CONNECT_CHANNEL);

const deriveXpubChannel: MainIpcChannel<
  deriveXpubRendererRequest,
  deriveXpubMainResponse
> = new MainIpcChannel(DERIVE_XPUB_CHANNEL);

const deriveAddressChannel: MainIpcChannel<
  deriveAddressRendererRequest,
  deriveAddressMainResponse
> = new MainIpcChannel(DERIVE_ADDRESS_CHANNEL);

const showAddressChannel: MainIpcChannel<
  showAddressRendererRequest,
  showAddressMainResponse
> = new MainIpcChannel(SHOW_ADDRESS_CHANNEL);

let devicesMemo = {};
class EventObserver {
  constructor(props) {
    // $FlowFixMe
    this.mainWindow = props;
  }
  next = async (event) => {
    const transportList = await TransportNodeHid.list();
    logger.info('[HW-DEBUG] Ledger NEXT: ', transportList);
    const connectionChanged = event.type === 'add' || event.type === 'remove';
    if (connectionChanged) {
      logger.info('[HW-DEBUG] Ledger NEXT - connection changed');
      const device = get(event, 'device', {});
      const deviceModel = get(event, 'deviceModel', {});

      if (event.type === 'add') {
        if (!devicesMemo[device.path]) {
          logger.info('[HW-DEBUG] CONSTRUCTOR ADD');
          try {
            // $FlowFixMe
            const transport = await TransportNodeHid.open(device.path);
            const BccConnection = new AppBcc(transport);
            devicesMemo[device.path] = {
              device,
              transport,
              BccConnection,
            };
            getHardwareWalletConnectionChannel.send(
              {
                disconnected: false,
                deviceType: 'ledger',
                deviceId: null, // Available only when Bcc APP opened
                deviceModel: deviceModel.id, // e.g. nanoS
                deviceName: deviceModel.productName, // e.g. Test Name
                path: device.path,
              },
              // $FlowFixMe
              this.mainWindow
            );
          } catch (e) {
            logger.info('[HW-DEBUG] CONSTRUCTOR error');
          }
        }
      } else {
        logger.info('[HW-DEBUG] CONSTRUCTOR REMOVE');
        devicesMemo = omit(devicesMemo, [device.path]);
        getHardwareWalletConnectionChannel.send(
          {
            disconnected: true,
            deviceType: 'ledger',
            deviceId: null, // Available only when Bcc APP opened
            deviceModel: deviceModel.id, // e.g. nanoS
            deviceName: deviceModel.productName, // e.g. Test Name
            path: device.path,
          },
          // $FlowFixMe
          this.mainWindow
        );
      }
      logger.info('[HW-DEBUG] CONSTRUCTOR Memo');
    } else {
      logger.info('[HW-DEBUG] Ledger NEXT - connection NOT changed');
    }
  };
  error(e) {
    logger.info('[HW-DEBUG] Ledger NEXT error');
    throw e;
  }
  complete() {
    logger.info('[HW-DEBUG] Ledger NEXT complete');
  }
}

export const handleHardwareWalletRequests = async (
  mainWindow: BrowserWindow
) => {
  let deviceConnection = null;
  let observer;

  const resetTrezorListeners = () => {
    // Remove all listeners if exist - e.g. on app refresh
    TrezorConnect.removeAllListeners();
    // Initialize new device listeners
    TrezorConnect.on(UI_EVENT, (event) => {
      if (event.type === UI.REQUEST_PASSPHRASE) {
        // ui-request_passphrase
        if (event.payload && event.payload.device) {
          TrezorConnect.uiResponse({
            type: UI.RECEIVE_PASSPHRASE,
            payload: { value: '', passphraseOnDevice: true },
          });
        }
      }
    });
    TrezorConnect.on(TRANSPORT_EVENT, (event) => {
      if (event.type === TRANSPORT.ERROR) {
        // Send Transport error to Renderer
        getHardwareWalletConnectionChannel.send(
          {
            error: {
              payload: event.payload,
            },
          },
          // $FlowFixMe
          mainWindow
        );
      }
    });
    TrezorConnect.on(DEVICE_EVENT, (event) => {
      const connectionChanged =
        event.type === DEVICE.CONNECT ||
        event.type === DEVICE.DISCONNECT ||
        event.type === DEVICE.CHANGED;
      const isAcquired = get(event, ['payload', 'type'], '') === 'acquired';
      const deviceError = get(event, ['payload', 'error']);

      if (deviceError) {
        throw new Error(deviceError);
      }

      if (connectionChanged && isAcquired) {
        getHardwareWalletConnectionChannel.send(
          {
            disconnected: event.type === DEVICE.DISCONNECT,
            deviceType: 'trezor',
            deviceId: event.payload.id, // 123456ABCDEF
            deviceModel: event.payload.features.model, // e.g. T
            deviceName: event.payload.label, // e.g. Test Name
            path: event.payload.path,
            eventType: event.type,
          },
          // $FlowFixMe
          mainWindow
        );
      }
    });
  };

  getHardwareWalletTransportChannel.onRequest(async (request) => {
    logger.info('[HW-DEBUG] getHardwareWalletTransportChannel');
    const { isTrezor, devicePath } = request;
    // Connected Trezor device info
    let deviceFeatures;
    if (isTrezor) {
      logger.info('[HW-DEBUG] getHardwareWalletTransportChannel::TREZOR ');
      try {
        deviceFeatures = await TrezorConnect.getFeatures({
          device: { path: devicePath },
        });
        logger.info('[HW-DEBUG] Trezor connect success');
        if (deviceFeatures && deviceFeatures.success) {
          const {
            major_version: majorVersion,
            minor_version: minorVersion,
            patch_version: patchVersion,
            device_id: deviceId,
            model,
            label,
          } = deviceFeatures.payload;
          const firmwareVersion = `${majorVersion}.${minorVersion}.${patchVersion}`;
          return Promise.resolve({
            deviceId,
            deviceType: 'trezor',
            deviceModel: model, // e.g. "1" or "T"
            deviceName: label,
            path: devicePath,
            firmwareVersion,
          });
        }
        throw deviceFeatures.payload; // Error is in payload
      } catch (e) {
        logger.info('[HW-DEBUG] Trezor connect error');
        throw e;
      }
    }

    try {
      logger.info('[HW-DEBUG] getHardwareWalletTransportChannel:: LEDGER');
      let transportList = await TransportNodeHid.list();
      let hw;
      let lastConnectedPath;

      // $FlowFixMe
      if (transportList && !transportList.length) {
        // Establish connection with last device
        try {
          logger.info('[HW-DEBUG] INIT NEW transport');
          hw = await TransportNodeHid.create();
          transportList = await TransportNodeHid.list();
          lastConnectedPath = last(transportList);
          const deviceList = getDevices();
          const device = find(deviceList, ['path', lastConnectedPath]);
          logger.info('[HW-DEBUG] INIT NEW transport - DONE');

          // $FlowFixMe
          deviceConnection = new AppBcc(hw);
          devicesMemo[lastConnectedPath] = {
            device,
            transport: hw,
            BccConnection: deviceConnection,
          };
        } catch (e) {
          logger.info('[HW-DEBUG] INIT NEW transport - ERROR');
          throw e;
        }
      } else if (!devicePath || !devicesMemo[devicePath]) {
        // Use first like native usb nodeHID
        logger.info('[HW-DEBUG] USE First');
        // $FlowFixMe
        lastConnectedPath = transportList[0]; // eslint-disable-line
        if (devicesMemo[lastConnectedPath]) {
          hw = devicesMemo[lastConnectedPath].transport;
          deviceConnection = devicesMemo[lastConnectedPath].BccConnection;
        } else {
          throw new Error('Device not connected!');
        }
      } else {
        logger.info('[HW-DEBUG] USE CURRENT CONNECTION');
        hw = devicesMemo[devicePath].transport;
        deviceConnection = get(devicesMemo, [devicePath, 'BccConnection']);
      }

      // $FlowFixMe
      const { deviceModel } = hw;
      if (deviceModel) {
        logger.info(
          '[HW-DEBUG] getHardwareWalletTransportChannel:: LEDGER case RESPONSE'
        );
        const { id, productName } = deviceModel;
        return Promise.resolve({
          deviceId: null, // @TODO - to be defined
          deviceType: 'ledger',
          deviceModel: id, // e.g. nanoS
          deviceName: productName, // e.g. Ledger Nano S
          path: lastConnectedPath || devicePath,
          firmwareVersion: null,
        });
      }
      throw new Error('Missing device info');
    } catch (error) {
      logger.info('[HW-DEBUG] ERROR on getHardwareWalletTransportChannel');
      throw error;
    }
  });

  handleInitTrezorConnectChannel.onRequest(async () => {
    logger.info('[HW-DEBUG] INIT TREZOR');
    resetTrezorListeners();
    TrezorConnect.manifest({
      email: 'email@developer.com',
      appUrl: 'http://your.application.com',
    });
    TrezorConnect.init({
      popup: false, // render your own UI
      webusb: false, // webusb is not supported in electron
      debug: true, // see what's going on inside connect
      // lazyLoad: true, // set to "false" (default) if you want to start communication with bridge on application start (and detect connected device right away)
      // set it to "true", then trezor-connect will not be initialized until you call some TrezorConnect.method()
      // this is useful when you don't know if you are dealing with Trezor user
      manifest: {
        email: 'email@developer.com', // @TODO
        appUrl: 'http://your.application.com', // @TODO
      },
    })
      .then(() => {})
      .catch((error) => {
        throw error;
      });
  });

  handleInitLedgerConnectChannel.onRequest(async () => {
    logger.info('[HW-DEBUG] INIT LEDGER');
    observer = new EventObserver(mainWindow);
    try {
      logger.info('[HW-DEBUG] OBSERVER INIT');
      TransportNodeHid.setListenDevicesDebounce(1000); // Defaults to 500ms
      await TransportNodeHid.listen(observer);
      logger.info('[HW-DEBUG] OBSERVER INIT - listener started');
    } catch (e) {
      logger.info('[HW-DEBUG] OBSERVER INIT FAILED');
    }
  });

  deriveXpubChannel.onRequest(async (params) => {
    const { parentXpubHex, lastIndex, derivationScheme } = params;
    const parentXpub = utils.hex_to_buf(parentXpubHex);
    try {
      const xpub = deriveChildXpub(parentXpub, lastIndex, derivationScheme);
      return utils.buf_to_hex(xpub);
    } catch (e) {
      throw e;
    }
  });

  deriveAddressChannel.onRequest(async (params) => {
    const {
      addressType,
      spendingPathStr,
      stakingPathStr,
      devicePath,
      isTrezor,
      networkId,
      protocolMagic,
    } = params;
    const spendingPath = utils.str_to_path(spendingPathStr);
    const stakingPath = stakingPathStr
      ? utils.str_to_path(stakingPathStr)
      : null;

    try {
      deviceConnection = get(devicesMemo, [devicePath, 'BccConnection']);
      logger.info('[HW-DEBUG] DERIVE ADDRESS');
      if (isTrezor) {
        const result = await TrezorConnect.bccGetAddress({
          device: {
            path: devicePath,
            showOnTrezor: true,
          },
          addressParameters: {
            addressType,
            path: `m/${spendingPathStr}`,
            stakingPath: stakingPathStr ? `m/${stakingPathStr}` : null,
          },
          protocolMagic,
          networkId,
        });
        return result.payload.address;
      }

      // Check if Ledger instantiated
      if (!deviceConnection) {
        throw new Error('Ledger device not connected');
      }

      const { addressHex } = await deviceConnection.deriveAddress({
        network: {
          networkId,
          protocolMagic,
        },
        address: {
          type: addressType,
          params: {
            spendingPath,
            stakingPath,
          },
        },
      });

      const encodedAddress = utils.bech32_encodeAddress(
        utils.hex_to_buf(addressHex)
      );
      return encodedAddress;
    } catch (e) {
      throw e;
    }
  });

  showAddressChannel.onRequest(async (params) => {
    const {
      addressType,
      spendingPathStr,
      stakingPathStr,
      devicePath,
      isTrezor,
      networkId,
      protocolMagic,
    } = params;
    const spendingPath = utils.str_to_path(spendingPathStr);
    const stakingPath = stakingPathStr
      ? utils.str_to_path(stakingPathStr)
      : null;

    try {
      deviceConnection = get(devicesMemo, [devicePath, 'BccConnection']);
      logger.info('[HW-DEBUG] SHOW ADDRESS');

      if (isTrezor) {
        throw new Error('Address verification not supported on Trezor devices');
      }

      // Check if Ledger instantiated
      if (!deviceConnection) {
        throw new Error('Ledger device not connected');
      }

      await deviceConnection.showAddress({
        network: {
          networkId,
          protocolMagic,
        },
        address: {
          type: addressType,
          params: {
            spendingPath,
            stakingPath,
          },
        },
      });
      return;
    } catch (e) {
      throw e;
    }
  });

  getBccBccAppChannel.onRequest(async (request) => {
    const { path } = request;
    try {
      if (!path || !devicesMemo[path]) {
        logger.info('[HW-DEBUG] Device not instantiated!');
        // eslint-disable-next-line
        throw { code: 'DEVICE_NOT_CONNECTED' };
      }
      logger.info('[HW-DEBUG] GET BCC APP');
      deviceConnection = devicesMemo[path].BccConnection;
      const { version } = await deviceConnection.getVersion();
      logger.info('[HW-DEBUG] getBccBccAppChannel:: appVersion');
      const { serial } = await deviceConnection.getSerial();
      logger.info('[HW-DEBUG] getBccBccAppChannel:: deviceSerial');
      const { minor, major, patch } = version;
      return Promise.resolve({
        minor,
        major,
        patch,
        deviceId: serial,
      });
    } catch (error) {
      const errorCode = error.code || '';
      const errorName = error.name || 'UknownErrorName';
      const errorMessage = error.message || 'UknownErrorMessage';
      const isDeviceDisconnected = errorCode === 'DEVICE_NOT_CONNECTED';
      const isDisconnectError = errorName === 'DisconnectedDevice';
      //  errorMessage.toLowerCase().includes('cannot open device with path') ||
      //  errorMessage.toLowerCase().includes('cannot write to hid device') ||
      //  errorMessage.toLowerCase().includes('cannot write to closed device');
      logger.info('[HW-DEBUG] ERROR in Bcc App', {
        path,
        errorName,
        errorMessage,
        isDisconnectError,
        isDeviceDisconnected,
      });
      if (path && !isDeviceDisconnected && isDisconnectError) {
        // $FlowFixMe
        const oldPath = path;
        const deviceMemo = devicesMemo[oldPath];
        const devicePaths = await TransportNodeHid.list();
        const hasPathChanged = !includes(devicePaths, oldPath);
        const newPath = hasPathChanged ? last(devicePaths) : oldPath;

        if (!newPath) {
          logger.info(
            '[HW-DEBUG] ERROR in Bcc App (Device paths list is empty)',
            {
              devicePaths,
              oldPath,
              newPath,
              deviceList: getDevices(),
            }
          );
          // eslint-disable-next-line
          throw { code: 'NO_DEVICE_PATHS', errorCode, errorName };
        }

        const { device: oldDevice } = deviceMemo;

        // $FlowFixMe
        const newTransport = await TransportNodeHid.open(newPath);
        const newDeviceConnection = new AppBcc(newTransport);

        const deviceList = getDevices();
        const newDevice = find(deviceList, ['path', newPath]);
        const hasDeviceChanged = newDevice.productId !== oldDevice.productId;

        // TODO: remove
        deviceConnection = newDeviceConnection;

        // Purge old device memo
        devicesMemo = omit(devicesMemo, [oldPath]);

        logger.info(
          '[HW-DEBUG] ERROR in Bcc App (Re-establish Connection)',
          {
            hasPathChanged,
            hasDeviceChanged,
            oldPath: oldPath || 'UNKNOWN_PATH',
            newPath: newPath || 'UNKNOWN_PATH',
            oldDevice: oldDevice || 'NOT_FOUND',
            newDevice: newDevice || 'NOT_FOUND',
          }
        );

        // Update devicesMemo
        devicesMemo[newPath] = {
          device: newDevice,
          transport: newTransport,
          BccConnection: newDeviceConnection,
        };

        if (hasPathChanged) {
          // eslint-disable-next-line
          throw { code: 'DEVICE_PATH_CHANGED', path: newPath };
        }
      }
      throw error;
    }
  });

  getExtendedPublicKeyChannel.onRequest(async (params) => {
    // Params example:
    // { path: "1852'/1815'/0'", isTrezor: false, devicePath: null }
    logger.info('[HW-DEBUG] getExtendedPublicKeyChannel');
    const { path, isTrezor, devicePath } = params;
    try {
      if (isTrezor) {
        // Check if Trezor instantiated
        const deviceFeatures = await TrezorConnect.getFeatures({
          device: { path: devicePath },
        });
        if (deviceFeatures.success) {
          const extendedPublicKeyResponse = await TrezorConnect.bccGetPublicKey(
            {
              path: `m/${path}`,
              showOnTrezor: true,
            }
          );
          if (!extendedPublicKeyResponse.success) {
            throw extendedPublicKeyResponse.payload;
          }
          const extendedPublicKey = get(
            extendedPublicKeyResponse,
            ['payload', 'node'],
            {}
          );
          return Promise.resolve({
            publicKeyHex: extendedPublicKey.public_key,
            chainCodeHex: extendedPublicKey.chain_code,
          });
        }
        throw new Error('Trezor device not connected');
      }

      deviceConnection = get(devicesMemo, [devicePath, 'BccConnection']);
      logger.info('[HW-DEBUG] EXPORT KEY');

      // Check if Ledger instantiated
      if (!deviceConnection) {
        throw new Error('Ledger device not connected');
      }

      const extendedPublicKey = await deviceConnection.getExtendedPublicKey({
        path: utils.str_to_path(path),
      });
      const deviceSerial = await deviceConnection.getSerial();
      return Promise.resolve({
        publicKeyHex: extendedPublicKey.publicKeyHex,
        chainCodeHex: extendedPublicKey.chainCodeHex,
        deviceId: deviceSerial.serial,
      });
    } catch (error) {
      throw error;
    }
  });

  // @TODO - validityIntervalStart is not working with Bcc App 2.1.0
  signTransactionLedgerChannel.onRequest(async (params) => {
    const {
      inputs,
      outputs,
      protocolMagic,
      fee,
      ttl,
      networkId,
      certificates,
      withdrawals,
      auxiliaryData,
      devicePath,
      signingMode,
    } = params;
    logger.info('[HW-DEBUG] SIGN Ledger transaction');
    deviceConnection = devicePath
      ? devicesMemo[devicePath].BccConnection
      : null;

    try {
      if (!deviceConnection) {
        throw new Error('Device not connected!');
      }
      const signedTransaction = await deviceConnection.signTransaction({
        signingMode,
        tx: {
          network: {
            networkId,
            protocolMagic,
          },
          inputs,
          outputs,
          fee,
          ttl,
          certificates,
          withdrawals,
          auxiliaryData,
        },
      });
      return Promise.resolve(signedTransaction);
    } catch (e) {
      throw e;
    }
  });

  signTransactionTrezorChannel.onRequest(async (params) => {
    const {
      inputs,
      outputs,
      protocolMagic,
      fee,
      ttl,
      networkId,
      certificates,
      devicePath,
      validityIntervalStartStr,
      withdrawals,
      auxiliaryData,
      signingMode,
    } = params;

    if (!TrezorConnect) {
      throw new Error('Device not connected!');
    }

    try {
      const dataToSign = {
        inputs,
        outputs,
        fee,
        ttl,
        protocolMagic,
        networkId,
        certificates,
        withdrawals,
        validityIntervalStartStr,
        auxiliaryData,
        signingMode,
      };
      const signedTransaction = await TrezorConnect.bccSignTransaction({
        device: { path: devicePath },
        ...dataToSign,
      });
      return Promise.resolve(signedTransaction);
    } catch (e) {
      throw e;
    }
  });

  resetTrezorActionChannel.onRequest(async () => {
    TrezorConnect.cancel('Method_Cancel');
  });
};
