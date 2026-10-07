Feature: My seedlots

  Background:
    Given I am logged in
    When I visit "/seedlots/my-seedlots"
    Then the URL should contain "/seedlots/my-seedlots"
    And the a-class seedlot fixture is loaded
    And I can see the title "My Seedlots"

  Scenario: User can start a new seedlot registration from My seedlots
    When I click the register a new seedlot button
    Then the URL should contain "/seedlots/register-a-class"

  Scenario: User can open a seedlot detail page from the My seedlots table
    When I open a seedlot row from the table
    Then the URL should contain "/seedlots/details/"

  Scenario: User can search seedlots by species
    When I search for "PLI" in the my seedlots search field
    Then the first visible seedlot species should match fixture key "pli"

  Scenario: My seedlots shows at least the expected total number of seedlots
    Then the pagination total should be at least the expected fixture-based seedlot count

  Scenario Outline: User can sort the My seedlots table by "<column>"
    When I sort the my seedlots table by "<column>"
    Then the my seedlots table should be sorted by "<column>"

    Examples:
      | column          |
      | Seedlot number  |
      | Seedlot species |
      | Seedlot status  |
      | Created at      |
      | Last updated    |
