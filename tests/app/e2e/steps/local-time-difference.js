// @flow
import { Given, Then } from 'cucumber';
import { expectTextInSelector } from '../../../common/e2e/steps/helpers';
import type { Klarity } from '../../../types';

declare var klarity: Klarity;
const SELECTORS = {
  ERROR_COMPONENT: '.SystemTimeError_component',
  TIME_OFF: '.time-off',
};

Given('I set the local time difference to be {int} seconds', async function(
  seconds
) {
  const differenceTime = seconds * 1000000; // unit: microseconds
  await this.client.executeAsync((timeDifference, done) => {
    klarity.api.bcc
      .setLocalTimeDifference(timeDifference)
      .then(() => klarity.stores.networkStatus._updateNetworkStatus())
      .then(() => klarity.stores.networkStatus._updateNetworkClock())
      .then(done)
      .catch(error => done(error));
  }, differenceTime);
});

Then(/^the system time error overlay should be (hidden|visible)$/, function(
  state
) {
  const isVisible = state === 'visible';
  return this.client.waitForVisible(
    SELECTORS.ERROR_COMPONENT,
    null,
    !isVisible
  );
});

Then('the system time difference should be {string}', async function(text) {
  await expectTextInSelector(this.client, {
    selector: SELECTORS.TIME_OFF,
    text
  });
});
