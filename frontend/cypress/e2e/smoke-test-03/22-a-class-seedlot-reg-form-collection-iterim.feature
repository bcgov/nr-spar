Feature: A Class seedlot registration Collection and Interim storage

  Background:
    Given I am logged in
    And the a-class seedlot fixture is loaded
    And I open the PLI A Class seedlot registration form

  Scenario: Validate Collection page headings and default agency values
    Then the Collection registration page should be displayed
    And the Collection agency title and subtitle should be displayed
    And the Collection information title and subtitle should be displayed
    And the Collection agency default values should be displayed

  Scenario: Edit Collection agency details
    When I disable the default Collection agency checkbox
    And I enter an invalid Collection agency acronym
    Then I should see the Collection agency acronym validation error
    When I enter a valid Collection agency acronym
    Then I should see the Collection agency acronym validation success indicator
    When I enter an invalid Collection location code
    Then I should see the Collection location code validation error
    When I enter a valid Collection location code
    And I save the seedlot registration progress

  Scenario: Search and select a Collection client
    When I open the Collection client search modal
    And I search for the Collection client by acronym
    And I select the first client search result
    And I apply the selected Collection client
    Then the selected client should populate the Collection agency fields
    When I save the seedlot registration progress
    And I enter Collection location code "03"
    And I save the seedlot registration progress

  Scenario: Validate Collection dates
    When I enter Collection end date "2024-05-28"
    And I enter Collection start date "2024-05-29"
    Then I should see Collection invalid date validation errors
    When I enter Collection start date "2024-05-27"
    And I save the seedlot registration progress

  Scenario: Validate Collection container inputs and calculated cone volume
    When I enter Collection container values above the allowed limit
    Then I should see Collection container validation errors
    And the Collection calculated cone volume should be "100020001.000"
    When I enter Collection cone volume "10"
    Then I should see the Collection cone volume warning
    When I enter Collection container values with more than three decimal places
    Then I should see Collection container validation errors
    When I enter negative Collection container values
    Then I should see Collection container validation errors
    When I enter valid Collection container values
    Then the Collection calculated cone volume should be "30.000"
    And I save the seedlot registration progress

  Scenario: Complete the Collection step
    When I complete the Collection checkbox and comments fields
    And I save the seedlot registration progress
    Then the Collection progress step should be complete
    When I continue to the next registration step
    Then the Collection progress step should remain complete

  Scenario: Validate Interim storage page headings
    When I open the Interim storage registration step
    Then the Interim storage title and subtitle should be displayed

  Scenario: Link Collection agency details to Interim storage
    Given Collection agency details are saved for Interim storage linkage
    When I open the Interim storage registration step
    Then the Interim storage agency details should match Collection agency details

  Scenario: Edit Interim storage agency details
    When I open the Interim storage registration step
    And I disable the Collection agency checkbox for Interim storage
    And I enter an invalid Interim storage agency acronym
    Then I should see the Interim storage agency acronym validation error
    When I enter a valid Interim storage agency acronym
    And I enter an invalid Interim storage location code
    Then I should see the Interim storage location code validation error
    When I enter a valid Interim storage location code
    Then I should see the Interim storage location code validation success indicator
    And I save the seedlot registration progress

  Scenario: Search and select an Interim storage client
    When I open the Interim storage registration step
    And I open the Interim storage client search modal
    And I search for the Interim storage client by acronym
    And I select the first client search result
    And I apply the selected Interim storage client
    Then the selected client should populate the Interim storage agency fields
    And I save the seedlot registration progress

  Scenario: Validate Interim storage dates
    When I open the Interim storage registration step
    And I enter Interim storage end date "2024-05-28"
    And I enter Interim storage start date "2024-05-29"
    Then I should see Interim storage invalid date validation errors
    When I enter Interim storage start date "2024-05-25"
    And I save the seedlot registration progress
    When I enter Interim storage end date "2024-05-30"
    And I save the seedlot registration progress

  Scenario: Complete Interim storage step using another facility type
    When I open the Interim storage registration step
    Then the default Interim storage facility type should be selected
    When I select the other Interim storage facility type
    Then the Interim storage other facility type input should be visible
    When I enter "Test comment" as the Interim storage other facility type
    And I save the seedlot registration progress
    Then the Interim storage progress step should be complete
    When I continue to the next registration step
    Then the Interim storage progress step should remain complete
