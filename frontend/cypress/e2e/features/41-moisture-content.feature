Feature: CONSEP manual moisture content activity summary

  Background:
    Given I am logged in
    And moisture content API responses are mocked
    And the moisture content fixture is loaded
    And the moisture seedlot replicate info fixture is loaded
    When I visit "/consep/manual-moisture-content/514330"
    Then the URL should contain "/consep/manual-moisture-content/514330"

  Scenario: Manual moisture content page loads core headings
    Then I can see the moisture content page title
    And I can see the activity results table title

  Scenario: Activity summary displays expected seedlot values
    Then the activity summary should match the seedlot replicate info

  Scenario: Activity results table shows expected moisture columns
    Then the activity results table should show these columns:
      | Replicate |
      | Cont # |
      | Cont wt |
      | Fresh seed |
      | Cont + Dry seed |
      | Dry wt |
      | MC (%) |
      | Acc |
      | Comments |

  Scenario: Activity results table validates a newly added moisture row
    Then the moisture activity results table initially shows 3 rows
    When I add a new moisture replicate row
    Then the moisture activity results table shows 4 rows
    When I enter "10011" in the last moisture row container id field
    Then the last moisture row should show the container id validation error
    When I enter "15" in the last moisture row container id field
    And I enter "10011" in the last moisture row container weight field
    Then the last moisture row should show the container weight validation error
    When I enter "20" in the last moisture row container weight field
    And I enter "10011" in the last moisture row fresh seed field
    Then the last moisture row should show the fresh seed validation error
    When I enter "30" in the last moisture row fresh seed field
    And I enter "10011" in the last moisture row container and dry weight field
    Then the last moisture row should show the container and dry weight validation error
    When I enter "38" in the last moisture row container and dry weight field

  Scenario: Activity summary result value updates after average calculation
    When I calculate average moisture content from accepted replicates
    Then the activity summary result value should equal the calculate-average API response

  Scenario: Moisture content start and end dates can be set
    When I set the "moisture content" start date to "10"
    And I set the "moisture content" end date to "11"

  Scenario: Setting start date after end date shows validation error
    When I set the "moisture content" end date to "11"
    And I set the "moisture content" start date to "15"
    Then the date range should show a validation error

  Scenario: Select category dropdown
    When I select the "moisture content" page category "QA"
    Then the "moisture content" page category should be "QA"

  Scenario: Comment box accepts text input
    Then the "moisture content" comment input should have placeholder
    When I enter the "moisture content" page comment
    Then the "moisture content" page comment should be visible
