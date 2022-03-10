// @flow
import { When } from 'cucumber';
import type { Klarity } from '../../../types';

declare var klarity: Klarity;

When(/^I inject fault named "([^"]*)"$/, async function(faultName) {
  await this.client.executeAsync((name, done) => {
    klarity.api.bcc
      .setBccNodeFault([name, true])
      .then(done)
      .catch(e => {
        throw e;
      });
  }, faultName);
});