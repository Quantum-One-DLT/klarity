// @flow
import BccApi from './api';
import LocalStorageApi from './utils/localStorage';

export type Api = {
  bcc: BccApi,
  localStorage: LocalStorageApi,
  setFaultyNodeSettingsApi?: boolean,
};

export const setupApi = (isTest: boolean): Api => ({
  bcc: new BccApi(isTest, {
    hostname: 'localhost',
    port: 8090,
    ca: Uint8Array.from([]),
    key: Uint8Array.from([]),
    cert: Uint8Array.from([]),
  }),
  localStorage: new LocalStorageApi(),
});
