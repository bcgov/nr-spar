Feature: Login page

  Scenario: Landing page displays correct content
    Given I visit the landing page
    Then I can see the login title "Welcome to SPAR"
    And I can see the login subtitle "Seed Planning and Registry Application"
    And I can see the login description "Register and store your seed and meet your annual reforestation needs using SPAR"

  # IDIR goes through IDIR-MFA (Azure AD), so CI stops at BC Gov SSO instead of the Microsoft page.
  Scenario: IDIR login goes to BC Gov SSO with the IDIR-MFA provider
    Given BC Gov SSO sign-in is stubbed
    And I visit the landing page
    When I click the "idir" login button
    Then I am sent to BC Gov SSO with the "azureidir" identity provider

  Scenario: User can open the Business BCeID login page
    Given I visit the landing page
    When I click the "bceid" login button
    Then I should see the "bceidLogo" logo

  Scenario: Unauthenticated user is redirected to landing page
    When I visit "/dashboard" without logging in
    Then I can see the login title "Welcome to SPAR"

  Scenario: Authenticated user lands on dashboard
    Given I am logged in
    When I visit "/dashboard"
    Then the URL should contain "/dashboard"
    And I can read "Main activities"
    And I open the user profile panel
    Then I should see my login service prefix
    And I should see an email address
