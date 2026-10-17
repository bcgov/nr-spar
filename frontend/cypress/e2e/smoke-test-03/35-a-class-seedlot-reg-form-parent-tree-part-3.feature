Feature: A Class Seedlot Registration form, Parent Tree and SMP part 3

	As a seedlot registration user
	I want to enter and validate the SMP mix volumes
	So that each parent tree's contribution proportion is calculated correctly

	Background:
		Given I am logged in
		And I open the A-class registration parent tree step for species "pli"
		And I open the "Calculation of SMP mix" tab

	Scenario: Calculation of SMP mix title and subtitle
		Then the SMP mix table heading should be "Calculation of SMP mix"
		And the SMP mix table subtitle should be "Enter the estimative volume of SMP mix used for each clone"

	Scenario: Add and delete rows
		Then the SMP mix table should contain "20 items"
		When I add an SMP mix row
		Then the SMP mix table should contain "21 items"
		When I add an SMP mix row
		Then the SMP mix table should contain "22 items"
		When I delete SMP mix row "7"
		Then the SMP mix table should contain "21 items"

	Scenario: Show additional parent tree columns
		When I make parent tree column "dfs" visible as "Dothistroma needle blight (DFS)"
		Then parent tree column "dfs" should be visible
		When I make parent tree column "dsc" visible as "Comandra blister rust (DSC)"
		Then parent tree column "dsc" should be visible
		When I make parent tree column "dsg" visible as "Western gall rust (DSG)"
		Then parent tree column "dsg" should be visible
		When I make parent tree column "gvo" visible as "Volume growth (GVO)"
		Then parent tree column "gvo" should be visible

	Scenario: Download, clean, and import SMP mix data
		When I open the SMP mix table options
		And I download the SMP mix template
		And I cancel cleaning the SMP mix table
		And I clean the SMP mix table
		Then SMP mix volumes in rows "0" and "1" should be empty
		When I cancel the SMP mix CSV upload
		And I import SMP mix CSV file "Seedlot_composition_template_03.csv"
		Then SMP mix row "0" should contain parent tree "212" with volume "4"
		And SMP mix row "1" should contain parent tree "222" with volume "7"
		And I save the seedlot registration progress

	Scenario: Reject invalid and duplicate parent tree numbers
		When I clean the SMP mix table
		And I enter "5" in SMP mix field "parentTreeNumber" at row 0
		Then the SMP mix validation error should be "Invalid parent tree number entries"
		When I enter "212" in SMP mix field "parentTreeNumber" at row 0
		Then the SMP mix validation error should be cleared
		When I enter "212" in SMP mix field "parentTreeNumber" at row 1
		Then the SMP mix validation error should be "Invalid parent tree number entries"
		When I enter "222" in SMP mix field "parentTreeNumber" at row 1
		Then the SMP mix validation error should be cleared
		And I save the seedlot registration progress

	Scenario Outline: Reject invalid SMP mix volumes
		When I clean the SMP mix table
		And I enter "<value>" in SMP mix field "volume" at row 0
		Then the SMP mix validation error should be "Invalid volume (ml) entries"
		When I enter "0" in SMP mix field "volume" at row 0
		Then the SMP mix validation error should be cleared
		And I save the seedlot registration progress

		Examples:
			| value   |
			| -1      |
			| 2.8     |
			| 1000000 |

	Scenario: Calculate SMP mix proportions
		When I clean the SMP mix table
		And I enter "1" in SMP mix field "volume" at row 0
		Then SMP mix row "0" should have proportion "1.0000"
		When I enter "1" in SMP mix field "volume" at row 1
		Then SMP mix row "0" should have proportion "0.5000"
		And SMP mix row "1" should have proportion "0.5000"
		When I enter "238" in SMP mix field "parentTreeNumber" at row 2
		And I enter "2" in SMP mix field "volume" at row 2
		Then SMP mix row "0" should have proportion "0.2500"
		And SMP mix row "1" should have proportion "0.2500"
		And SMP mix row "2" should have proportion "0.5000"
		And I save the seedlot registration progress

	Scenario: Calculate SMP mix location metrics
		When I calculate parent tree metrics
		Then the mean latitude should be visible
		And the mean longitude should be visible
		And the mean elevation should be visible
		And I save the seedlot registration progress
