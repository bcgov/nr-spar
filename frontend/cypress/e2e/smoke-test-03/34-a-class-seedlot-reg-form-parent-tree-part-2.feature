Feature: A Class Seedlot Registration form, Parent Tree and SMP part 2

	As a seedlot registration user
	I want to set SMP success and non-orchard pollen values
	So that parent tree contribution data is complete

	Background:
		Given I am logged in
		And I open the A-class registration parent tree step for species "pli"
		And I open the "SMP success on parent" tab

	Scenario: SMP success table heading
		Then the SMP success table heading should be "SMP success on parent"
		And the SMP success table subtitle should be "Enter the SMP success estimate for the orchard's seedlot"

	Scenario: Shared default values are off by default
		Then the shared SMP default label should be "Enter the same SMP success on parent or non-orchard pollen contaminant to all parent trees"
		And shared SMP defaults should be disabled
		When I enable shared SMP defaults
		Then the shared SMP default fields should be visible

	Scenario Outline: Reject invalid shared SMP defaults
		When I enable shared SMP defaults
		And I enter "<value>" into the shared "<field>" default
		Then the shared SMP default error should be "<message>"

		Examples:
			| field          | value | message                                     |
			| smp-success    | -1    | Invalid SMP success on parent (%) entries  |
			| smp-success    | 0.05  | Invalid SMP success on parent (%) entries  |
			| smp-success    | 26    | Invalid SMP success on parent (%) entries  |
			| pollen-contam  | -1    | Invalid non-orchard pollen contam. (%) entries |
			| pollen-contam  | 0.05  | Invalid non-orchard pollen contam. (%) entries |
			| pollen-contam  | 101   | Invalid non-orchard pollen contam. (%) entries |

	Scenario: Apply valid shared values to parent trees
		When I enable shared SMP defaults
		And I set the shared "smp-success" default to "5"
		And I set the shared "pollen-contam" default to "2"
		Then the shared SMP default error should be cleared
		And the first five parent trees should have SMP success "5" and pollen contamination "2"
		When I set parent tree "212" SMP success and pollen contamination to "0"
		Then parent tree "212" should have SMP success "0" and pollen contamination "0"

	Scenario: Show additional parent tree columns
		When I make parent tree column "dfs" visible as "Dothistroma needle blight (DFS)"
		Then parent tree column "dfs" should be visible
		When I make parent tree column "dsc" visible as "Comandra blister rust (DSC)"
		Then parent tree column "dsc" should be visible
		When I make parent tree column "dsg" visible as "Western gall rust (DSG)"
		Then parent tree column "dsg" should be visible
		When I make parent tree column "gvo" visible as "Volume growth (GVO)"
		Then parent tree column "gvo" should be visible

	Scenario: Clean the SMP success table and import a CSV file
		When I open the SMP success table options
		And I download the SMP success table template
		And I cancel cleaning the SMP success table
		And I clean the SMP success table
		Then the SMP success and pollen contamination values for parent trees "212" and "219" should be empty
		When I cancel the SMP success CSV upload
		And I import SMP success CSV file "Seedlot_composition_template_02.csv"
		Then parent tree "212" should have SMP success "1" and pollen contamination "46"
		And parent tree "219" should have SMP success "2" and pollen contamination "22"

	Scenario: Calculate parent tree metrics from SMP success data
		When I calculate parent tree metrics
		Then the parent tree metric summaries should be visible
