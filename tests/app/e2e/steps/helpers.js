// @flow
import { When } from 'cucumber';
import { getProcessesByName } from '../../../../source/main/utils/processes';
import type { Klarity } from '../../../types';

declare var klarity: Klarity;

const ACTIVE_RESTORE_NOTIFICATION = '.ActiveRestoreNotification';

export const getBccNodeState = async (client: Object) =>
  (await client.execute(() => klarity.stores.networkStatus.bccNodeState)).value;

export const refreshClient = async (client: Object) => {
  await client.url(`file://${__dirname}/../../../../dist/renderer/index.html`);
};

const oneHour = 60 * 60 * 1000;
// Helper step to pause execution for up to an hour ;)
When(/^I freeze$/, { timeout: oneHour }, callback => {
  setTimeout(callback, oneHour);
});

export const waitForActiveRestoreNotification = (
  client: Object,
  { isHidden } : { isHidden: boolean } = {}
) =>
  client.waitForVisible(
    ACTIVE_RESTORE_NOTIFICATION,
    null,
    isHidden
  );

export const waitForBccNodeToExit = async (client: Object) =>
  client.waitUntil(
    async () => (await getProcessesByName('bcc-node')).length === 0,
    61000
  );

export const waitForKlarityToExit = async (
  client: Object,
  timeout: number = 61000
) => {
  const klarityProcessName =
    process.platform === 'linux' ? 'electron' : 'Electron';
  return client.waitUntil(
    async () => (await getProcessesByName(klarityProcessName)).length === 0,
    timeout
  );
};
