// @flow
import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';
import { waitUntilTextInSelector } from '../../../common/e2e/steps/helpers';
import { refreshClient, waitForBccNodeToExit, waitForKlarityToExit } from './helpers';
import type { Klarity } from '../../../types';

declare var klarity: Klarity;
const CONNECTING_TITLE = '.SyncingConnectingStatus_headline';

Given(/^Klarity is running$/, function() {
  expect(this.app.isRunning()).to.equal(true);
});

Given('I am on the connecting screen', async function() {
  this.client.executeAsync(done => {
    // Simulate that there is no connection to bcc node
    klarity.api.bcc.setSyncProgress(0);
    klarity.stores.networkStatus._updateNetworkStatus().then(done);
  });
  await this.client.waitForVisible('.SyncingConnectingStatus_connecting');
});

When(/^I refresh the main window$/, async function() {
  await refreshClient(this.client);
});

When(/^I close the main window$/, async function() {
  await this.client.execute(() => klarity.stores.window.closeWindow());
});

Then(/^Klarity process is not running$/, async function() {
  await waitForKlarityToExit(this.client);
});

Then(/^Klarity should quit$/, { timeout: 70000 }, async function() {
  await waitForBccNodeToExit(this.client);
  await waitForKlarityToExit(this.client);
});

Then(/^I should see the loading screen with "([^"]*)"$/, async function(
  message
) {
  await waitUntilTextInSelector(this.client, {
    selector: CONNECTING_TITLE,
    text: message,
  });
});

Then(/^I should see the main UI/, function() {
  return this.client.waitForVisible('.SidebarLayout_component');
});

Given('I set the syncing progress to {int} percent', async function(percentage) {
  this.client.executeAsync((percentage, done) => {
    klarity.api.bcc.setSyncProgress(percentage);
    klarity.stores.networkStatus._updateNetworkStatus().then(done);
  }, percentage);
});

When('I reset the syncing progress', async function() {
  this.client.executeAsync(done => {
    klarity.api.bcc.setSyncProgress(null);
    klarity.stores.networkStatus._updateNetworkStatus().then(done);
  });
});

When(/^I disconnect app$/, function() {
  this.client.execute(() => {
    klarity.stores.networkStatus._setDisconnected(true);
  });
});