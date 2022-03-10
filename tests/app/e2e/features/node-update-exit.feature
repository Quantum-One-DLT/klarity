@e2e @skip
# @API TODO - We don't have app update endpoints
Feature: Node Update Exit

  Background:
    Given I have completed the basic setup
    Given Klarity is running
    And bcc-node is running

  @slow @restartApp
  Scenario: apply-update endpoint triggered, and node fails to exit, that's still handled
    When I inject fault named "FInjApplyUpdateNoExit"
    When I trigger the apply-update endpoint
    Then I should see the loading screen with "Updating Bcc node"
    And Klarity should quit

  # TODO: clarify what should happen when bcc exits with wrong code!
  # Currently Klarity thinks that bcc-node crashed and restarts it …
  @slow @restartApp @skip
  Scenario: apply-update endpoint triggered, and node exits with wrong exit code, that's still handled
    When I inject fault named "FInjApplyUpdateWrongExitCode"
    When I trigger the apply-update endpoint
    Then I should see the loading screen with "Updating Bcc node"
    And Klarity should quit

  # TODO: Klarity doesn't handle ignored api calls atm
  @slow @restartApp @skip
  Scenario: apply-update endpoint triggered, and node ignores the endpoint call, that's still handled
    Given Klarity is running
    And bcc-node is running
    When I inject fault named "FInjIgnoreApi"
    When I trigger the apply-update endpoint
    Then bcc-node process is not running
    And Klarity process is not running
