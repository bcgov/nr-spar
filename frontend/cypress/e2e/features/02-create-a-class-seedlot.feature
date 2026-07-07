Feature: Create A-class seedlot

  Background:
    Given I am logged in
    And I visit "/seedlots"
    Then the URL should contain "/seedlots"
    And I can see the title "Seedlots"
    And the a-class seedlot fixture is loaded

  Scenario Outline: Register an A-class seedlot and store the created number for "<speciesKey>"
    When I start a-class seedlot registration
    Then I should be on the create a-class page
    When I fill agency number for "<speciesKey>"
    And I enter an invalid email
    Then I should see email validation error
    When I enter a valid email for "<speciesKey>"
    And I select seedlot species for "<speciesKey>"
    Then default a-class source radio buttons should be validated
    And default tree seed centre radio buttons should be validated
    When I set tree seed centre option for "<speciesKey>"
    Then selected tree seed centre option should be validated for "<speciesKey>"
    And default location within BC radio buttons should be validated
    When I set location within BC option for "<speciesKey>"
    Then selected location within BC option should be validated for "<speciesKey>"
    When I submit the create seedlot form
    Then I should be on the creation success page
    And I store created seedlot number for "<speciesKey>"

    Examples:
      | speciesKey |
      | pli        |
      | cw         |
      | dr         |
      | ep         |
      | fdc        |
