@e2e @wip
Feature: Quitting Klarity

  Klarity can be quit in multiple (and unexpected) ways and
  has to cleanup and stop bcc-node before exiting.

  @slow @restartApp
  Scenario: Closing the main window
    Given Klarity is running
    And bcc-node is running
    When I close the main window
    Then bcc-node process is not running
    And Klarity process is not running

  @slow @restartApp @skip
  # @API TODO - New wallet backend doesn't support fault injection
  Scenario: Closing the main window, while bcc ignores exit request
    Given Klarity is running
    And bcc-node is running
    When I inject fault named "FInjIgnoreShutdown"
    And I close the main window
    Then I should see the loading screen with "Stopping Bcc node"
    And bcc-node process is not running
    And Klarity process is not running
