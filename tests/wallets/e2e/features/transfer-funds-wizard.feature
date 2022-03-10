@e2e @wip
Feature: Transfer funds wizard

  Background:
    Given I have completed the basic setup

  Scenario: Successfully transfering funds from "Klarity Cole" wallet to "Klarity Sophie" wallet
    Given I have a "Cole Wallet" cole wallet for transfering funds
    And I have a "Test Wallet" wallet with funds
    And I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And I see initial wallets balance
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet "Move testnet bcc" action should be visible in the top bar notification
    And I click "Cole" wallet top bar notification action
    Then I should see "Transfer bcc" wizard
    And I open "Sophie wallet" selection dropdown
    And I select "Sophie Wallet" wallet
    And I click continue button on "Transfer bcc" wizard
    Then I should see "Transfer bcc" wizard step 2 dialog
    And I enter spending password in "Transfer bcc" wizard step 2 dialog:
      | password   |
      | Secret1234 |
    Then "Transfer bcc" wizard step 2 dialog continue button should be disabled
    And I click continue button on "Transfer bcc" wizard step 2 dialog
    And I see "Transfer bcc" wizard step 2 transfer funds button disabled
    Then I should not see "Transfer bcc" wizard step 2 wizard dialog anymore
    Then I should see increased sophie wallet balance and 0 BCC in Klarity Cole wallet

  Scenario: User enters wrong spending password
    Given I have a "Cole Wallet" cole wallet with funds
    And I have a "Test Wallet" wallet with funds
    And I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet "Move testnet bcc" action should be visible in the top bar notification
    And I click "Cole" wallet top bar notification action
    Then I should see "Transfer bcc" wizard
    And I open "Sophie wallet" selection dropdown
    And I select "Sophie Wallet" wallet
    And I click continue button on "Transfer bcc" wizard
    Then I should see "Transfer bcc" wizard step 2 dialog
    And I enter spending password in "Transfer bcc" wizard step 2 dialog:
      | password   |
      | Secret1234Wrong |
    Then "Transfer bcc" wizard step 2 dialog continue button should be disabled
    And I click continue button on "Transfer bcc" wizard step 2 dialog
    Then I should see the following error messages on transfer wizard step 2 dialog:
      | message                   |
      | api.errors.IncorrectPasswordError |
    And "Transfer bcc" wizard step 2 dialog continue button should not be disabled anymore

  Scenario: User enters too short spending password
    Given I have a "Cole Wallet" cole wallet with funds
    And I have a "Test Wallet" wallet with funds
    And I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet "Move testnet bcc" action should be visible in the top bar notification
    And I click "Cole" wallet top bar notification action
    Then I should see "Transfer bcc" wizard
    And I open "Sophie wallet" selection dropdown
    And I select "Sophie Wallet" wallet
    And I click continue button on "Transfer bcc" wizard
    Then I should see "Transfer bcc" wizard step 2 dialog
    And I enter spending password in "Transfer bcc" wizard step 2 dialog:
      | password   |
      | wrong      |
    Then "Transfer bcc" wizard step 2 dialog continue button should be disabled
    And I click continue button on "Transfer bcc" wizard step 2 dialog
    Then I should see the following error messages on transfer wizard step 2 dialog:
      | message                   |
      | api.errors.IncorrectPasswordError |
    And "Transfer bcc" wizard step 2 dialog continue button should not be disabled anymore
