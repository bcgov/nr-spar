Feature: A Class Seedlot Registration form, Step 4 Orchard

  As a seedlot registration user
  I want to select orchards and gamete information
  So that the parent tree step is linked to the right orchards

  Background:
    Given I am logged in
    And I open A-class registration step 4 for species "pli"

  Scenario: Page title and subtitle
    Then the orchard step title should be "Orchard information"
    And the orchard step subtitle should be "Enter the contributing orchard information"

  Scenario: Gamete and pollen section titles
    Then the gamete section title should be "Gamete information"
    And the gamete section subtitle should be "Enter the seedlot gamete information"
    And the pollen section title should be "Pollen information"
    And the pollen section subtitle should be "Enter the pollen contaminant information"

  Scenario: Change primary orchard confirmation modal
    When I select primary orchard "219 - VERNON - S - PRD"
    And I clear the primary orchard
    Then the "Change orchard" modal should be visible
    And the "Change orchard" modal heading should be "Are you sure you want to change the orchard? If yes, then you will lose the parent tree and SMP information in Step 5"
    When I click "Cancel" in the "Change orchard" modal
    And I clear the primary orchard
    And I click "Change orchard" in the "Change orchard" modal
    Then the primary orchard should be empty

  Scenario: Add and delete a secondary orchard
    When I select primary orchard "219 - VERNON - S - PRD"
    And I add an additional orchard
    Then the secondary orchard label should be "Select a secondary orchard"
    When I select secondary orchard "222 - VERNON - S - PRD"
    And I delete the secondary orchard
    Then the "Delete orchard" modal should be visible
    And the "Delete orchard" modal heading should be "Are you sure you want to delete the additional orchard? If yes, then you will lose the parent tree and SMP information in Step 5"
    When I click "Cancel" in the "Delete orchard" modal
    And I delete the secondary orchard
    And I click "Delete secondary orchard" in the "Delete orchard" modal
    Then the secondary orchard should not exist
    And I save the seedlot registration progress

  Scenario: Linkage of step 4 orchards and step 5 parent trees
    When I select primary orchard "219 - VERNON - S - PRD"
    And I go to the "Parent tree and SMP" step from the progress bar
    And I store the first 6 parent tree numbers
    And I go to the "Orchard" step from the progress bar
    And I clear the primary orchard
    And I click "Change orchard" in the "Change orchard" modal
    And I select primary orchard "222 - VERNON - S - PRD"
    And I go to the "Parent tree and SMP" step from the progress bar
    And I store the first 6 parent tree numbers
    And I go to the "Orchard" step from the progress bar
    And I clear the primary orchard
    And I click "Change orchard" in the "Change orchard" modal
    And I select primary orchard "219 - VERNON - S - PRD"
    And I save the seedlot registration progress
    And I add an additional orchard
    And I select secondary orchard "222 - VERNON - S - PRD"
    And I save the seedlot registration progress
    And I go to the "Parent tree and SMP" step from the progress bar
    Then the first 6 parent trees should match the combined stored parent trees

  Scenario: Default gamete information
    Then the female and male gametic methods should be empty
    And the controlled cross and biotech options should be "no"

  Scenario Outline: Select gametic contribution methods
    When I select female gametic contribution method "<female>"
    And I select male gametic contribution method "<male>"
    And I save the seedlot registration progress
    Then the female gametic method should be "<female>"
    And the male gametic method should be "<male>"

    Examples:
      | female                    | male                                       |
      | F2 - Measured Cone Volume | M3 - Pollen Volume Estimate by 100% Survey |

  Scenario: Change controlled cross and biotech options
    When I choose "yes" for controlled cross and biotech
    Then the controlled cross and biotech options should be "yes"
    And I save the seedlot registration progress

  Scenario Outline: Clear a gametic contribution method
    When I select female gametic contribution method "F2 - Measured Cone Volume"
    And I select male gametic contribution method "M3 - Pollen Volume Estimate by 100% Survey"
    And I clear the "<gamete>" gametic method
    Then the "<gamete>" gametic method should be empty
    And I save the seedlot registration progress

    Examples:
      | gamete |
      | male   |
      | female |

  Scenario: Default pollen information
    Then the pollen contaminant option should be "no"
    And the pollen breeding percentage fields should not exist

  Scenario: Change pollen information
    When I choose "yes" for pollen contaminant
    Then the pollen breeding percentage fields should be visible
    And the pollen helper text should be "If contaminant pollen was present and the contaminant pollen has a breeding value"

  Scenario Outline: Invalid pollen breeding percentage
    When I choose "yes" for pollen contaminant
    And I enter pollen breeding percentage "<value>"
    Then the pollen error should be "Please enter a valid value between 0 and 100"

    Examples:
      | value   |
      | -1      |
      | 101     |
      | 21.1576 |

  Scenario: Orchard step is marked complete
    When I select primary orchard "219 - VERNON - S - PRD"
    And I choose "yes" for pollen contaminant
    And I enter pollen breeding percentage "5"
    And I save the seedlot registration progress
    Then the "Orchard" progress step should be marked complete
    When I go to the next registration step
    Then the "Orchard" progress step should be completed
