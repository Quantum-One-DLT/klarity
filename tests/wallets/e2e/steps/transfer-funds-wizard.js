// @flow
import { When, Then } from 'cucumber';
import { expect } from 'chai';
import BigNumber from 'bignumber.js/bignumber';
import { formattedWalletAmount } from '../../../../source/renderer/app/utils/formatters';
import type { Klarity } from '../../../types';

import { noWalletsErrorMessage, getFixedAmountByName } from './helpers';

declare var klarity: Klarity;

When(/^I click "Cole" wallet top bar notification action$/, function() {
  return this.waitAndClick('.LegacyNotification_actions button:nth-child(2)');
});


When(/^I open "Sophie wallet" selection dropdown$/, function() {
  return this.waitAndClick(
    '.SimpleSelect_select .SimpleInput_input'
  );
});

When(/^I select "([^"]*)" wallet$/, function(walletName) {
  return this.waitAndClick('.SimpleBubble_bubble li:nth-child(1)');
});

When(/^I click continue button on "Transfer bcc" wizard$/, function() {
  return this.waitAndClick('.Dialog_actions .SimpleButton_root');
});

When(/^I enter spending password in "Transfer bcc" wizard step 2 dialog:$/, async function(
  table
) {
  const fields = table.hashes()[0];
  await this.client.setValue(
    '.TransferFundsStep2Dialog_dialog input',
    fields.password
  );
});

When(/^I click continue button on "Transfer bcc" wizard step 2 dialog$/, function() {
  return this.waitAndClick('.TransferFundsStep2Dialog_dialog .confirmButton');
});

When(/^I see "Transfer bcc" wizard step 2 transfer funds button disabled$/, async function() {
  const isEnabled = await this.client.isEnabled('.TransferFundsStep2Dialog_dialog .confirmButton');
  expect(isEnabled).to.equal(false);
});

When(/^I see initial wallets balance$/, async function() {
  // Wait for balance to be visible
  const sophieWalletName = await this.waitAndGetText('.SidebarWalletsMenu_wallets button:nth-child(1) .SidebarWalletMenuItem_title');
  const coleWalletName = await this.waitAndGetText('.SidebarWalletsMenu_wallets button:nth-child(2) .SidebarWalletMenuItem_title');

  // Set initial values for further use
  const sophieFixedWalletAmount = await getFixedAmountByName.call(this, sophieWalletName);
  const coleFixedWalletAmount = await getFixedAmountByName.call(this, coleWalletName);
  this.sophieWalletAmount = new BigNumber(sophieFixedWalletAmount);
  this.coleWalletAmount = new BigNumber(coleFixedWalletAmount);
  if (this.coleWalletAmount.isZero()) throw new Error(noWalletsErrorMessage);
});

Then(/^"Transfer bcc" wizard step 2 dialog continue button should be disabled$/, async function() {
  await this.client.waitForEnabled('.TransferFundsStep2Dialog_dialog .confirmButton');
});

Then(/^I should see "Transfer bcc" wizard step 2 dialog$/, async function() {
  await this.client.waitForVisible('.TransferFundsStep2Dialog_dialog');
  // Set transfer funds fee
  const transferFee = await this.waitAndGetText('.TransferFundsStep2Dialog_dialog .Dialog_content div:nth-child(3) .TransferFundsStep2Dialog_amount');
  this.transferFee = transferFee.replace('+ ', '');
});

Then(
  /^I should not see "Transfer bcc" wizard step 2 wizard dialog anymore$/,
  { timeout: 60000 }, // Transfering funds sometimes last more than "Default" test timeout
  function() {
    return this.client.waitForVisible(
      '.TransferFundsStep2Dialog_dialog',
      null,
      true
    );
  }
);

Then(/^I should see "Add wallet" wizard$/, async function() {
  return this.client.waitForVisible('.TransferFundsStep1Dialog_label');
});

Then(/^I should see "Transfer bcc" wizard$/, async function() {
  return this.client.waitForVisible('.TransferFundsStep1Dialog_label');
});

Then(/^I should see increased sophie wallet cole and 0 BCC in Klarity Cole wallet$/,
  async function() {
    const sophieSelector = '.SidebarWalletsMenu_wallets button:nth-child(1) .SidebarWalletMenuItem_info';
    const coleSelector = '.SidebarWalletsMenu_wallets button:nth-child(2) .SidebarWalletMenuItem_info';
    const transferSumWithoutFees = this.sophieWalletAmount.plus(this.coleWalletAmount);
    const transferSumWithFees = transferSumWithoutFees.minus(this.transferFee);
    const initialSophieFormattedAmount = formattedWalletAmount(this.sophieWalletAmount, true, false);
    const initialColeFormattedAmount = formattedWalletAmount(this.coleWalletAmount, true, false);
    const expectedSophieAmount = formattedWalletAmount(transferSumWithFees, true, false);
    const expectedColeAmount = '0 BCC';
    let sophieWalletFormattedAmount;
    let coleWalletFormattedAmount;
    await this.client.waitUntil(async () => {
      sophieWalletFormattedAmount = await this.waitAndGetText(sophieSelector);
      coleWalletFormattedAmount = await this.waitAndGetText(coleSelector);
      return(
        sophieWalletFormattedAmount !== initialSophieFormattedAmount &&
        coleWalletFormattedAmount !== initialColeFormattedAmount
      );
    })
    expect(sophieWalletFormattedAmount).to.equal(expectedSophieAmount);
    expect(coleWalletFormattedAmount).to.equal(expectedColeAmount);
  }
);

Then(
  /^I should see the following error messages on transfer wizard step 2 dialog:$/,
  async function(data) {
    const errorSelector = '.TransferFundsStep2Dialog_dialog .TransferFundsStep2Dialog_error';
    let errorsOnScreen = await this.waitAndGetText(errorSelector);
    if (typeof errorsOnScreen === 'string') errorsOnScreen = [errorsOnScreen];
    const errors = data.hashes();
    for (let i = 0; i < errors.length; i++) {
      const expectedError = await this.intl(errors[i].message);
      expect(errorsOnScreen[i]).to.equal(expectedError);
    }
  }
);

Then(/^"Transfer bcc" wizard step 2 dialog continue button should not be disabled anymore$/, async function() {
  const isEnabled = await this.client.isEnabled('.TransferFundsStep2Dialog_dialog .confirmButton');
  expect(isEnabled).to.equal(true);
});
