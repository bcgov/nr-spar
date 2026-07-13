Feature: CONSEP manual moisture content activity summary

Background:
Given I am logged in
And moisture content API responses are mocked
And the moisture content fixture is loaded
And the seedlot replicate info fixture is loaded
When I visit "/consep/manual-moisture-content/514330"
Then the URL should contain "/consep/manual-moisture-content/514330"

Scenario: Manual moisture content page loads core headings
Then I can see the moisture content page title
And I can see the activity results table title

Scenario: Activity summary displays expected seedlot values
Then the activity summary should match seedlot replicate info for moisture content

Scenario: Activity summary result value updates after average calculation
When I calculate average moisture content from accepted replicates
Then the activity summary result value should equal the calculate-average API response
