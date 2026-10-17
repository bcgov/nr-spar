Feature: Edit applicant and seedlot information

  Background:
    Given I am logged in
    And the a-class seedlot fixture is loaded
    And I open the configured applicant seedlot detail page

  Scenario: Edit applicant and seedlot information
    When I open the applicant and seedlot editor
    And I change the applicant email to "test@gmail.com"
    And I select "TPT" as the seedlot source
    And I set the registration status to "No"
    And I set the collected within BC status to "No"
    And I save the applicant and seedlot information
    Then I should be on the seedlot detail page
    And the applicant email should be "test@gmail.com"
    And the applicant source should be "Tested Parent Trees"
    And the applicant registration status should be "No"
    And the applicant within BC status should be "No"
