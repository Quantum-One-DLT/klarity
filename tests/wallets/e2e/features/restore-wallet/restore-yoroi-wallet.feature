@e2e
Feature: Restore Quantaverse wallet

  Background:
    Given I have completed the basic setup
    And I have the following wallets:
      | name        |
      | Test Wallet |

  Scenario: Successfully restoring "Quantaverse Cole" cole wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Quantaverse wallet"
    Then I should see section "What kind of Quantaverse wallet would you like to restore?"
    Then I click on option "(Cole wallet)"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                                                                                                                                   |
      | defense brush fiscal cactus rotate trouble mean quantum shrug slight dignity corn immense first citizen |
    And I click Check recovery phrase button
    And I enter wallet name "Quantaverse Cole wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password  | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Quantaverse Cole wallet" wallet loaded
    And "Quantaverse Cole wallet" wallet should have "legacy_aab5517861cca76a53d83e24c84542ecac6c0a3d" as id
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet "Move testnet bcc" action should be visible in the top bar notification

  Scenario: Successfully restoring "Quantaverse Sophie" sophie wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Quantaverse wallet"
    Then I should see section "What kind of Quantaverse wallet would you like to restore?"
    Then I click on option "(Sophie wallet)"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                                                                                                                                   |
      | defense brush fiscal cactus rotate trouble mean quantum shrug slight dignity corn immense first citizen |
    And I click Check recovery phrase button
    And I enter wallet name "Quantaverse Sophie wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password  | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Quantaverse Sophie wallet" wallet loaded
    And "Quantaverse Sophie wallet" wallet should have "aab5517861cca76a53d83e24c84542ecac6c0a3d" as id

  Scenario: Successfully restoring "Quantaverse Cole" wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Quantaverse wallet"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                                                      |
      | frozen neck rural balcony rural into tired vibrant that trigger shadow avocado resemble cliff novel |
    And I click Check recovery phrase button
    And I enter wallet name "Quantaverse Cole wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password  | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Quantaverse Cole wallet" wallet loaded
    And "Quantaverse Cole wallet" wallet should have "legacy_ca8f1986634654c7937c6f931872a1712998b17b" as id
