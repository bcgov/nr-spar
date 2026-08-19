Feature: Seedlot Detail

  Background:
    Given I am logged in
    And the a-class seedlot fixture is loaded
    And I open a seedlot detail page for a saved seedlot number
    Then I can see the seedlot number in the title

  Scenario: Seedlot detail header and edit action shows expected values
    Then I can see the seedlot number in the page header
    And the status and edit action follow seedlot rules

  Scenario: Registration progress bar shows all expected steps
    Then I can see registration progress labels in order:
      | index | label                  |
      | 0     | Collection             |
      | 1     | Ownership              |
      | 2     | Interim storage        |
      | 3     | Orchard                |
      | 4     | Parent tree and SMP    |
      | 5     | Extraction and storage |
    And I can open edit seedlot form from the progress section

  Scenario: Seedlot summary section shows expected values
    Then I can see the seedlot summary title
    And I can see seedlot summary core fields
    And I can see seedlot summary status field
    And I can see seedlot summary approved at field

  Scenario: Applicant and seedlot information section shows expected values
    Then I can see applicant and seedlot information title
    And I can see applicant identity fields match fixture
    And I can see applicant source field match fixture
    And I can see registration and within BC values match fixture
