@e2e @wip
Feature: "Klarity Cole" wallet top bar notification

  Background:
    Given I have completed the basic setup

  Scenario: Cole wallet "Create a Sophie wallet" / "Move bcc" notification is NOT shown when "Cole" wallet is empty
    Given I have the following wallets:
      | name           |
      | Sophie Wallet |
    And I have a "Cole Wallet" cole wallet
    Then I should have newly created "Cole Wallet" wallet loaded
    When I am on the "Cole Wallet" wallet "summary" screen
    Then I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet notification should not be displayed in the wallet top bar

  Scenario: Cole wallet "Create a Sophie wallet" notification is displayed if the wallet is NOT empty and I don't have a Sophie wallet in the UI
    Given I have a "Cole Wallet" cole wallet with funds
    Then I should have newly created "Cole Wallet" wallet loaded
    And I should be on the "Cole Wallet" wallet "summary" screen
    And I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet "Create a new Sophie wallet" action should be visible in the top bar notification
    When I click "Cole" wallet top bar notification action
    Then I should be on the "wallets/add" screen

  Scenario: Cole wallet "Move testnet bcc" notification is shown when "Cole" wallet is NOT empty and I have a Sophie wallet in the UI
    Given I have the following wallets:
      | name           |
      | Sophie Wallet |
    And I have a "Cole Wallet" cole wallet with funds
    Then I should have newly created "Cole Wallet" wallet loaded
    When I am on the "Cole Wallet" wallet "summary" screen
    Then I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet "Move testnet bcc" action should be visible in the top bar notification
    When I click "Cole" wallet top bar notification action
    Then I should see "Transfer bcc" wizard
