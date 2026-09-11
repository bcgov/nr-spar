Feature: Dashboard page

  Background:
    Given I am logged in
    When I visit "/dashboard"
    Then the URL should contain "/dashboard"

  Scenario: Dashboard loads correctly
    And I can read "Main activities"

  Scenario: Favourites section shows the empty state
    Then I can see the empty favourite section title
    And I can see the empty favourite section subtitle

  Scenario: User can favourite the Seedlots page
    When I visit "/seedlots"
    And I favourite the current page
    And I visit "/dashboard"
    Then I should see favourite card "Seedlots"

  Scenario: User can highlight a favourite card
    Given favourite activities include:
      | Seedlots |
    When I highlight favourite card "Seedlots"
    Then favourite card "Seedlots" should be highlighted

  Scenario: User can delete a favourite card
    Given favourite activities include:
      | Seedlots |
    When I delete favourite card "Seedlots"
    Then I should not see favourite card "Seedlots"
