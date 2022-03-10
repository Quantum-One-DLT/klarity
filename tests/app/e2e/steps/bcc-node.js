// @flow
import { Given, Then } from 'cucumber';
import { BccNodeStates } from '../../../../source/common/types/bcc-node.types';
import { getBccNodeState, waitForBccNodeToExit } from './helpers';

Given(/^bcc-node is running$/, async function() {
  await this.client.waitUntil(
    async () =>
      (await getBccNodeState(this.client)) === BccNodeStates.RUNNING
  );
});

Then(
  /^bcc-node process is not running$/,
  { timeout: 61000 },
  async function() {
    await waitForBccNodeToExit(this.client);
  }
);
