@e2e
Feature: Restore Klarity wallet

  Background:
    Given I have completed the basic setup
    And I have the following wallets:
      | name        |
      | Test Wallet |

  Scenario: Successfully restoring "Klarity Cole" wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Klarity wallet"
    Then I should see section "What kind of Klarity wallet would you like to restore?"
    Then I click on option "12 words"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                                  |
      | prison census discover give sound behave hundred cave someone orchard just wild |
    And I click Check recovery phrase button
    And I enter wallet name "Klarity Cole wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password   | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Klarity Cole wallet" wallet loaded
    And "Klarity Cole wallet" wallet should have "legacy_6eb9a6862e5656b4a52fa6fae8eb3a3e8f7c2bd6" as id
    And I should be on the "Klarity Cole wallet" wallet "summary" screen
    And I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet "Move testnet bcc" action should be visible in the top bar notification

  Scenario: Successfully restoring "Klarity Cole" paper wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Klarity wallet"
    Then I should see section "What kind of Klarity wallet would you like to restore?"
    Then I click on option "27 words"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                                                                                                                                   |
      | season nice police near blame dress deal congress unusual more giggle pull general list crash gravity fashion notable voice resemble auto smart flat party thought unique amused |
    And I click Check recovery phrase button
    And I enter wallet name "Klarity paper wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password  | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Klarity paper wallet" wallet loaded
    And "Klarity paper wallet" wallet should have "legacy_699c20fef5469d2cabadf5a778932d06ca3364e2" as id
    And "Cole" wallet badge should be visible in the wallet sidebar
    And "Cole" wallet notification should not be displayed in the wallet top bar

  Scenario: Successfully restoring "Klarity Cole" wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Klarity wallet"
    Then I should see section "What kind of Klarity wallet would you like to restore?"
    Then I click on option "12 words"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                             |
      | tuna only march magic high twice flavor borrow hurt bullet awkward similar |
    And I click Check recovery phrase button
    And I enter wallet name "Klarity Cole wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password   | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Klarity Cole wallet" wallet loaded
    And "Klarity Cole wallet" wallet should have "legacy_8325d53f736d08a92ecb67e762c63a0318143986" as id
    And I should be on the "Klarity Cole wallet" wallet "summary" screen
    And I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished

  Scenario: Successfully restoring "Klarity Cole" paper wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Klarity wallet"
    Then I should see section "What kind of Klarity wallet would you like to restore?"
    Then I click on option "27 words"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                                                                                                                                   |
      | season nice police near blame dress deal congress unusual more giggle pull general list crash gravity fashion notable voice resemble auto smart flat party thought unique amused |
    And I click Check recovery phrase button
    And I enter wallet name "Klarity paper wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password  | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Klarity paper wallet" wallet loaded
    And "Klarity paper wallet" wallet should have "legacy_699c20fef5469d2cabadf5a778932d06ca3364e2" as id

  Scenario: Successfully restoring "Klarity Sophie" wallet
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Klarity wallet"
    Then I should see section "What kind of Klarity wallet would you like to restore?"
    Then I click on option "15 words"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                                             |
      | combine mouse cool skirt truck outer result speed fringe sugar there usage lucky wild tail |
    And I click Check recovery phrase button
    And I enter wallet name "Klarity Sophie wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password  | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Klarity Sophie wallet" wallet loaded
    And "Klarity Sophie wallet" wallet should have "c2ebd8b727cc760fe2f0fb3d06a8630ccc8c70f5" as id

  Scenario: Restoring "Klarity Cole" wallet that already exists
    Given The sidebar shows the "wallets" category
    When I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Klarity wallet"
    Then I should see section "What kind of Klarity wallet would you like to restore?"
    Then I click on option "12 words"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                             |
      | tuna only march magic high twice flavor borrow hurt bullet awkward similar |
    And I click Check recovery phrase button
    And I enter wallet name "Klarity Cole wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password   | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see a screen titled "Wallet Restored"
    And I click close
    Then I should not see the restore wallet dialog anymore
    And I should have newly created "Klarity Cole wallet" wallet loaded
    And "Klarity Cole wallet" wallet should have "legacy_8325d53f736d08a92ecb67e762c63a0318143986" as id
    And I should be on the "Klarity Cole wallet" wallet "summary" screen
    And I should see the restore status notification while restore is running
    And I should not see the restore status notification once restore is finished
    And I click on the add wallet button in the sidebar
    And I see the add wallet page
    And I click on the restore wallet button on the add wallet page
    And I see the restore wallet dialog
    Then I click on option "Klarity wallet"
    Then I should see section "What kind of Klarity wallet would you like to restore?"
    Then I click on option "12 words"
    And I click continue
    And I enter recovery phrase in restore wallet dialog:
      | recoveryPhrase                                                             |
      | tuna only march magic high twice flavor borrow hurt bullet awkward similar |
    And I click Check recovery phrase button
    And I enter wallet name "Klarity Cole wallet" in restore wallet dialog
    And I enter wallet password in restore wallet dialog:
      | password   | repeatedPassword |
      | Secret1234 | Secret1234      |
    And I click continue
    Then I should see the following error messages on the wallet restore dialog:
      | message                               |
      | api.errors.WalletAlreadyRestoredError |
