Feature: Seedlot API smoke

  Background:
    Given I am logged in
    And I load the FDI seedlot number created earlier

  Scenario: Fetching existing seedlot details returns a successful response
    When I visit the seedlot detail page for the loaded aclass seedlot
    Then the URL should contain "/seedlots/details/"
    And the seedlot GET request status is 200
    And the response contains the expected applicant location code

  Scenario: Unknown page returns a not found response
    When I visit "/dashboard1" without failing on the status code
    Then I can see the page heading "Page not found"
