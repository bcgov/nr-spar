Feature: CONSEP favourite activities page

Scenario: Favourite card is removed after unselecting it in modal
  Given favourite activities include:
    | Actual germination count |
  Then I should see favourite card Actual
germination
count
  When I open the add favourite activity modal
  And I select favourite activities:
    | Actual germination count |
  And I submit favourite activity modal
  Then I should not see favourite card Actual
germination
count
