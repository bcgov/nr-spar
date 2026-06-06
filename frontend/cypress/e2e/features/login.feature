Feature: Login page

  Scenario: Landing page displays correct content
    Given I visit the landing page
    Then I can see the title "Welcome to SPAR"
    And I can see the subtitle "Seed Planning and Registry Application"
    And I can see the description "Register and store your seed and meet your annual reforestation needs using SPAR"

  Scenario Outline: User can open a login provider page
    Given I visit the landing page
    When I click the "<provider>" login button
    Then I should see the "<logoId>" logo

    Examples:
      | provider | logoId    |
      | idir     | idirLogo  |
      | bceid    | bceidLogo |

  Scenario: Unauthenticated user is redirected to landing page
    When I visit "/dashboard" without logging in
    Then I can see the title "Welcome to SPAR"

  Scenario: Authenticated user lands on dashboard
    Given I am logged in
    When I visit "/dashboard"
    Then the URL should contain "/dashboard"
    And I can read "Main activities"
    And I open the user profile panel
    Then I should see my login service prefix
    And I should see an email address
