Feature: CONSEP favourite activities page

  Background:
    Given I am logged in
    And favourite activities API responses are mocked
    When I visit "/consep/favourite-activities"
    Then the URL should contain "/consep/favourite-activities"
    And the favourite activities content fixture is loaded

  Scenario: Favourite page title and empty section render correctly
    Then I can see the empty favourite section title
    And I can see the empty favourite section subtitle
    And I can see the add favourite activity button

  Scenario: Add favourite activity modal can be opened and closed
    When I open the add favourite activity modal
    Then I can see the favourite activity modal
    When I close the favourite activity modal
    Then I should not see the favourite activity modal

  Scenario: User can search activities in modal
    When I open the add favourite activity modal
    And I search favourite activities for "germination"
    Then I should see favourite activity row "Actual germination count"

  Scenario: User can add three favourite activities
    When I open the add favourite activity modal
    And I select favourite activities:
      | Actual germination count |
      | Calculate crop average   |
      | CSP request              |
    And I submit favourite activity modal
    Then I should see favourite card "Actual germination count"
    And I should see favourite card "Calculate crop average"
    And I should see favourite card "CSP request"

  Scenario: User can highlight a favourite activity card
    Given favourite activities include:
      | Actual germination count |
    When I highlight favourite card "Actual germination count"
    Then favourite card "Actual germination count" should be highlighted

  Scenario: User can delete a favourite activity card
    Given favourite activities include:
      | Actual germination count |
    When I delete favourite card "Actual germination count"
    Then I should not see favourite card "Actual germination count"

  Scenario: Maximum 12 favourite activities is enforced
    When I open the add favourite activity modal
    And I select the first 12 favourite activities
    Then unselected favourite activity checkboxes should be disabled
