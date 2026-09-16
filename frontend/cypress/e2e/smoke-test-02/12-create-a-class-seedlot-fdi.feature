Feature: Create FDI seedlot

  Background:
    Given I am logged in
    And I visit "/seedlots"
    Then the URL should contain "/seedlots"
    And I can see the title "Seedlots"
    And the a-class seedlot fixture is loaded

  Scenario: Register FDI seedlot and store the created number
    Given the seedlot creation POST request is intercepted
    When I start a-class seedlot registration
    Then I should be on the create a-class page
    When I fill agency number for "fdi"
    And I enter an invalid email
    Then I should see email validation error
    When I enter a valid email for "fdi"
    And I select seedlot species for "fdi"
    Then default a-class source radio buttons should be validated
    And default tree seed centre radio buttons should be validated
    When I set tree seed centre option for "fdi"
    Then selected tree seed centre option should be validated for "fdi"
    And default location within BC radio buttons should be validated
    When I set location within BC option for "fdi"
    Then selected location within BC option should be validated for "fdi"
    When I submit the create seedlot form
    Then I should be on the creation success page
    And I store created seedlot number for "fdi"
    And the seedlot creation POST request should succeed for "fdi"
