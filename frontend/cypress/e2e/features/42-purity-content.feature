Feature: CONSEP manual purity content screen

  Background:
    Given I am logged in
    And purity content API responses are mocked
    And the purity content fixture is loaded
    And the purity seedlot replicate info fixture is loaded for purity content
    When I visit "/consep/manual-purity-content/79082"
    Then the URL should contain "/consep/manual-purity-content/79082"
    And the activity results table has loaded

  Scenario: Purity content page loads core headings
    Then I can see the purity content page title
    And I can see the activity results table title for purity content
    And I can see the impurities section title

  Scenario: Activity summary displays expected seedlot values for purity content
    Then the activity summary should match the seedlot replicate info

  Scenario: Purity table shows expected columns
    Then the activity results table should show these columns:
      | Replicate |
      | Pure seed weight (g) |
      | Inert matter weight (g) |
      | Other seed weight (g) |
      | Purity |
      | Acc |
      | Comments |

  Scenario: Add impurity row to a replicate and select impurity type
    When I add an impurity row for replicate "1"
    And I select impurity type "DUS" for replicate "1" rank "1"
    Then impurity rank "1" for replicate "1" should show type "DUS"

  Scenario: Deleting second impurity row renumbers remaining ranks
    When I add 3 impurity rows for replicate "1"
    And I delete impurity row with rank "2" for replicate "1"
    Then impurity at index "2" for replicate "1" should have rank "2"

  Scenario: Maximum impurity rows per replicate triggers inline error
    When I add 10 impurity rows for replicate "2"
    Then the add impurity button should not be visible for replicate "2"
    And I should see the maximum impurity error for replicate "2"

  Scenario: Update date fields
    When I set the "purity content" start date to "2025/06/10"
    And I set the "purity content" end date to "2025/06/11"

  Scenario: Setting start date after end date shows validation error
    When I set the "purity content" end date to "2025/06/11"
    And I set the "purity content" start date to "2025/06/15"
    Then the date range should show a validation error

  Scenario: Select category dropdown
    When I select the "purity content" page category "Quality assurance"
    Then the "purity content" page category should be "Quality assurance"

  Scenario: Comment box accepts text input
    Then the "purity content" comment input should have placeholder
    When I enter the "purity content" page comment
    Then the "purity content" page comment should be visible
