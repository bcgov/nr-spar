Feature: Seedlot Dashboard

Background:
  Given I am logged in
  And I visit the seedlot dashboard page
  And the a-class seedlot fixture is loaded

Scenario: Seedlot Dashboard page displays correct content
  Then I can see the title "Seedlots"
  And I can see the section title "My seedlots"
  And I can see the section subtitle "Check a summary of your recent seedlots"

Scenario: All seedlot species should exist in the table
  Then all seedlot species should exist in the seedlot table
