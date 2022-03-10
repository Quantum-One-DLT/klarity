// @flow
import { Given, When, Then } from 'cucumber';
import { waitUntilTextInSelector } from '../../../common/e2e/steps/helpers';
import type { Klarity } from '../../../types';

declare var klarity: Klarity;
const BCC_NODE_STATE = '.bccNodeState .KlarityDiagnostics_layoutData';

Given(/^I open the "Diagnostic" screen$/, async function() {
  this.client.execute(() => klarity.actions.app.openKlarityDiagnosticsDialog.trigger());
  return this.client.waitForVisible('.KlarityDiagnostics_component');
});

Then(/^I should see the Bcc Node state is "([^"]*)"$/, async function(
  message
) {
  await waitUntilTextInSelector(this.client, {
    selector: BCC_NODE_STATE,
    text: message,
  });
});

When(/^I click on the "Restart Bcc Node" button$/, function() {
  return this.client.click('.KlarityDiagnostics_bccNodeStatusBtn');
});
