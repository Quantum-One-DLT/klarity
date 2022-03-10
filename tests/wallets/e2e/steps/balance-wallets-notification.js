// @flow
import { Then } from 'cucumber';
import { expect } from 'chai';
import type { Klarity } from '../../../types';

declare var klarity: Klarity;

Then(
  /^"Cole" wallet "([^"]*)" action should be visible in the top bar notification$/,
  async function(action) {
    const notificationAction = await this.waitAndGetText('.LegacyNotification_actions button:nth-child(2)');
    expect(notificationAction).to.equal(action);
  }
);

Then(
  /^"Cole" wallet notification should not be displayed in the wallet top bar$/,
  async function() {
    return this.client.waitForVisible('.LegacyNotification_component', null, true);
  }
);
