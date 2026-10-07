Feature: A Class seedlot registration Ownership

  Background:
    Given I am logged in
    And the a-class seedlot fixture is loaded
    And I open the PLI A Class seedlot Ownership registration form

  Scenario: Validate Ownership page heading and default owner accordion
    Then the Ownership registration page should be displayed
    And the Ownership title and subtitle should be displayed
    When I select the default owner checkbox
    And I save the seedlot registration progress
    Then the default Ownership accordion title and subtitle should be displayed

  Scenario: Collapse and expand the owner accordion
    When I collapse the Ownership accordion
    Then the Ownership details section should not be visible
    When I expand the Ownership accordion
    Then the Ownership details section should be visible

  Scenario: Validate default Ownership agency and location values
    Then the default owner checkbox should be selected
    And the default Ownership agency and location values should be displayed

  Scenario: Edit Ownership agency and location code
    When I disable the default owner checkbox
    And I enter an invalid Ownership agency acronym
    Then I should see the Ownership agency acronym error
    When I enter an invalid Ownership agency validation value
    Then I should see the Ownership agency validation error
    And the Ownership error notification should be visible
    When I close the Ownership error notification
    And I enter a valid Ownership agency acronym
    Then I should see the Ownership agency validation success indicator
    When I enter an invalid Ownership location code
    Then I should see the Ownership location code error
    When I enter a valid Ownership location code
    Then I should see the Ownership location code validation success indicator
    And I save the seedlot registration progress

  Scenario: Search and select an Ownership client
    When I open the Ownership client search modal
    And I search for the Ownership client by acronym
    Then Ownership client search results should be displayed
    When I select the first Ownership client search result
    And I apply the selected Ownership client
    Then the selected client should populate the Ownership agency fields
    And I save the seedlot registration progress

  Scenario: Validate default Ownership percentage values
    Then the default Ownership portion values should be displayed
    And I save the seedlot registration progress

  Scenario: Edit Ownership percentage values and validate input rules
    When I set Ownership reserved portion to "02"
    Then the Ownership surplus portion should be "98"
    When I set Ownership surplus portion to "52"
    Then the Ownership reserved portion should be "48"
    When I set Ownership owner portion to "80"
    Then the Ownership accordion subtitle should be "80% owner portion"
    When I set Ownership owner portion to "-1"
    Then I should see the Ownership owner portion below-limit error
    When I set Ownership owner portion to "0.0439"
    Then I should see the Ownership owner portion decimal error
    When I set Ownership owner portion to "102"
    Then I should see the Ownership owner portion above-limit error
    When I set Ownership owner portion to "100"
    And I save the seedlot registration progress

  Scenario: Select and clear Ownership funding source and payment method
    Then the Ownership funding source and payment method should be blank
    When I select the Ownership funding source
    Then the selected Ownership funding source should be displayed
    When I clear the Ownership funding source
    Then the Ownership funding source should be blank
    When I select the Ownership funding source
    And I select the initial Ownership method of payment
    Then the selected Ownership method of payment should be displayed
    When I clear the Ownership method of payment
    Then the Ownership method of payment should be blank
    When I select the cash sale Ownership method of payment
    Then the cash sale Ownership method of payment should be displayed
    And I save the seedlot registration progress

  Scenario: Create and delete an additional owner
    When I add an Ownership owner section
    Then 2 Ownership owner section should be displayed
    And the Ownership delete owner button should be displayed
    When I delete the added Ownership owner section
    Then 1 Ownership owner section should be displayed

  Scenario: Validate owner portions across three owners and complete Ownership
    When I add an Ownership owner section
    And I add an Ownership owner section
    Then 3 Ownership owner section should be displayed
    And the additional Ownership owner default title and subtitle should be displayed
    When I validate Ownership portions without updating all owners
    Then all Ownership owner sections should show the owner portion sum error
    When I set the three Ownership owner portions to "90", "5", and "5"
    Then no Ownership owner portion sum errors should be displayed
    When I delete the third Ownership owner section
    And I delete the second Ownership owner section
    And I set Ownership owner portion to "100"
    And I save the seedlot registration progress
    Then the Ownership progress step should be complete
    When I continue to the next registration step
    Then the Ownership progress step should remain complete
