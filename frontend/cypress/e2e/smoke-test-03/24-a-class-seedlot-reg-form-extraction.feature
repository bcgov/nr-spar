Feature: A Class seedlot registration Extraction and Storage

  Background:
    Given I am logged in
    And the a-class seedlot fixture is loaded
    And I open the PLI A Class seedlot Extraction and Storage registration form

  Scenario: Validate Extraction and Storage page titles and subtitles
    Then the Extraction and Storage registration page should be displayed
    And the Extraction subtitle should be displayed
    And the Temporary seed storage title and subtitle should be displayed

  Scenario: Validate default Extraction agency details
    Then the Extraction agency Tree Seed Centre checkbox should be selected
    And the Extraction agency checkbox text should be displayed

  Scenario: Validate default Storage agency details
    Then the Storage agency Tree Seed Centre checkbox should be selected
    And the Storage agency checkbox text should be displayed

  Scenario: Edit Extraction agency details
    When I disable the Extraction agency Tree Seed Centre checkbox
    And I enter an invalid Extraction agency acronym
    Then I should see the Extraction agency acronym error
    When I enter an invalid Extraction agency validation value
    Then I should see the Extraction agency validation error
    And the Extraction agency error notification should be visible
    When I close the Extraction agency error notification
    And I enter a valid Extraction agency acronym
    Then I should see the Extraction agency validation success indicator
    And the Extraction agency error notification should not be displayed
    When I enter an invalid Extraction location code
    Then I should see the Extraction location code error
    When I enter a valid Extraction location code
    Then I should see the Extraction location code validation success indicator
    And I save the seedlot registration progress

  Scenario: Search and select an Extraction client
    When I open the Extraction client search modal
    And I search for the Extraction client by acronym
    Then Extraction client search results should be displayed
    When I select the first Extraction client search result
    And I apply the selected Extraction client
    Then the selected client should populate the Extraction agency fields
    And I save the seedlot registration progress

  Scenario: Validate Extraction dates
    When I enter Extraction end date "2024-05-28"
    And I enter Extraction start date "2024-05-29"
    Then I should see Extraction invalid date validation errors
    When I enter Extraction start date "2024-05-27"
    And I select the Extraction agency Tree Seed Centre checkbox
    And I save the seedlot registration progress

  Scenario: Edit Storage agency details
    When I disable the Storage agency Tree Seed Centre checkbox
    And I enter an invalid Storage agency acronym
    Then I should see the Storage agency acronym error
    When I enter an invalid Storage agency validation value
    Then I should see the Storage agency validation error
    And the Storage agency error notification should be visible
    When I close the Storage agency error notification
    And I enter a valid Storage agency acronym
    Then I should see the Storage agency validation success indicator
    And the Storage agency error notification should not be displayed
    When I enter an invalid Storage location code
    Then I should see the Storage location code error
    When I enter a valid Storage location code
    Then I should see the Storage location code validation success indicator
    And I save the seedlot registration progress

  Scenario: Search and select a Storage client
    When I open the Storage client search modal
    And I search for the Storage client by acronym
    Then Storage client search results should be displayed
    When I select the first Storage client search result
    And I apply the selected Storage client
    Then the selected client should populate the Storage agency fields
    And I save the seedlot registration progress

  Scenario: Validate Storage dates
    When I enter Storage end date "2024-05-28"
    And I enter Storage start date "2024-05-29"
    Then I should see Storage invalid date validation errors
    When I enter Storage start date "2024-05-27"
    And I save the seedlot registration progress
