@e2e @wip
Feature: Node Restart

  Background:
    Given I have completed the basic setup
    And bcc-node is running

  Scenario Outline: I restart Bcc Node from the "Diagnostics" screen for the <ATTEMPT>. time
    Given I open the "Diagnostic" screen
    Then I should see the Bcc Node state is "Running"
    When I click on the "Restart Bcc Node" button
    And I should see the main UI

    Examples:
    | ATTEMPT |
    | 1       |
    | 2       |
    | 3       |
    | 4       |
    | 5       |
