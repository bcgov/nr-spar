Feature: Dashboard page

  Background:
    Given I am logged in
    When I visit "/dashboard"
    Then the URL should contain "/dashboard"

  Scenario: Dashboard loads correctly
    Then I can see the dashboard page title

  Scenario: Favourites section shows the empty state
    Then I can see the dashboard's empty favourite section title
    And I can see the dashboard's empty favourite section subtitle

  Scenario: User can favourite the Seedlots page
    When I visit "/seedlots"
    And I favourite the current page
    And I visit "/dashboard"
    Then I should see the dashboard favourite card "Seedlots"

  Scenario: User can highlight a dashboard favourite card
    When I highlight the dashboard favourite card "Seedlots"
    Then the dashboard favourite card "Seedlots" should be highlighted

  Scenario: User can delete a dashboard favourite card
    When I delete the dashboard favourite card "Seedlots"
    Then I should not see the dashboard favourite card "Seedlots"
