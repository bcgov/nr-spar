Feature: CONSEP germination test result auto-save

  Scenario: Germination counts persist after reload
    Given I am logged in
    And germination API responses are mocked
    When I visit "/consep/germination-test/79082"
    Then the germination result screen has loaded
    And I enter "5" for germination replicate 1 on day 1 and wait for auto-save
    When I reload the germination result page
    Then germination replicate 1 on day 1 should show "5"

  Scenario: Germination conflict blocks saves until Reload
    Given I am logged in
    And germination API responds with a conflict on the first save
    When I visit "/consep/germination-test/79082"
    Then the germination result screen has loaded
    When I enter "5" for germination replicate 1 on day 1 and wait for conflict
    Then the germination conflict banner is visible
    And the germination count and date controls are disabled
    And no additional germination save is sent before Reload
    When I click Reload on the germination conflict banner
    And I enter "6" for germination replicate 1 on day 1 and wait for auto-save
    Then germination replicate 1 on day 1 should show "6"
