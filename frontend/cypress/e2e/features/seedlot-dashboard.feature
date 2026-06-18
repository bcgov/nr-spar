Feature: Seedlot Dashboard

Scenario: Seedlot Dashboard page displays correct content
  Given I visit the seedlot dashboard page
  Then I can see the title "Seedlots"
  And I can see the recent section title "My seedlots"
  And I can see the recent section subtitle "Check a summary of your recent seedlots"

Scenario: All seedlot species should exist in the table
  Given I am logged in
  And I visit the seedlot dashboard page
  And the aclass seedlot fixture is loaded
  Then all seedlot species should exist in the seedlot table
