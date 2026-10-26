Feature: A Class Seedlot Registration form, Parent Tree Calculations Part 1

  As a seedlot registration user
  I want to calculate parent tree contribution metrics
  So that I can verify orchard selection, CSV import, totals, and parent tree removal

  Background:
    Given I am logged in
    And I open the A-class registration parent tree step for species "fdi"

  Scenario: Orchard selection
    When I go back to the orchard selection step
    And I select primary orchard "324 - BAILEY - S - PRD"
    And I select female gametic contribution method "F1 - Visual Estimate"
    And I select male gametic contribution method "M2 - Pollen Volume Estimate by Partial Survey"
    And I save the seedlot registration progress

  Scenario: Upload CSV file
    When I upload parent tree CSV file "Seedlot_composition_template_FDI.csv"
    And I save the seedlot registration progress

  Scenario: Check parent tree contribution summary
    Then the parent tree table should be loaded
    And the total number of parent trees should match the table rows
    And the total cone count should match the table values
    And the total pollen count should match the table values

    When I calculate parent tree metrics
    Then I store the effective population size
    And I save the seedlot registration progress

  Scenario: Remove a single parent tree contribution
    When I clear cone and pollen counts for parent tree "8021"
    Then the parent tree contribution totals should decrease for parent tree "8021"

    When I calculate parent tree metrics
    Then the effective population size should be lower than before
