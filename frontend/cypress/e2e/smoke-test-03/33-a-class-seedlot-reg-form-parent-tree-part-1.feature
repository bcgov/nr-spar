Feature: A Class Seedlot Registration form, Parent Tree and SMP part 1

	As a seedlot registration user
	I want to enter and validate cone and pollen count data
	So that parent tree contributions can be reviewed and calculated

	Background:
		Given I am logged in
		And I open the A-class registration parent tree step for species "pli"

	Scenario: Orchard selections are available on the parent tree step
		When I ensure primary and secondary orchards are selected
		Then the parent tree table should be loaded

	Scenario: Page title and cone and pollen section headings
		Then the parent tree page title should be "Cone and pollen count and SMP data"
		And the parent tree page subtitle should be "Enter cone and pollen count (*required), SMP success on parent and SMP mix information"
		And the cone and pollen table heading should be "Cone and pollen count"
		And the cone and pollen table subtitle should be "Enter the cone and pollen count estimate for the orchard's seedlot (*required)"

	Scenario: Download templates and collapse each accordion
		Then the parent tree accordion should be visible
		When I download the parent tree template "Download cone and pollen count and SMP success on parent template." as "Seedlot_composition_template.csv"
		And I download the parent tree template "Download calculation of SMP mix template." as "SMP_Mix_Volume_template.csv"
		And I collapse parent tree accordion 1
		And I collapse parent tree accordion 2
		And I collapse parent tree accordion 3

	Scenario Outline: Validate cone and pollen count entries
		When I enter "<value>" in parent tree field "<field>"
		Then the parent tree validation message should be "<message>"

		Examples:
			| field       | value         | message                    |
			| coneCount   | -1            | Invalid cone count entries |
			| coneCount   | 10000000001   | Invalid cone count entries |
			| coneCount   | 0.00000000001 | Invalid cone count entries |
			| pollenCount | -1            | Invalid pollen count entries |
			| pollenCount | 10000000001   | Invalid pollen count entries |
			| pollenCount | 0.00000000001 | Invalid pollen count entries |

	Scenario: Validate simultaneous invalid cone and pollen counts
		When I enter "-1" in parent tree field "coneCount"
		And I enter "-1" in parent tree field "pollenCount"
		Then the parent tree validation message should be "Invalid cone count and pollen count entries"

	Scenario: Clear count validation after correcting and emptying fields
		When I enter "-1" in parent tree field "coneCount"
		And I enter "1" in parent tree field "coneCount"
		Then the parent tree validation message should be cleared
		When I enter "-1" in parent tree field "pollenCount"
		And I enter "1" in parent tree field "pollenCount"
		Then the parent tree validation message should be cleared
		When I clear the cone and pollen count fields for parent tree "212"
		Then the parent tree validation message should not be visible
		And I save the seedlot registration progress

	Scenario Outline: Show parent tree columns
		When I make parent tree column "<id>" visible as "<label>"
		Then parent tree column "<id>" should be visible
		And I save the seedlot registration progress

		Examples:
			| id  | label                           |
			| dfs | Dothistroma needle blight (DFS) |
			| dsc | Comandra blister rust (DSC)     |
			| dsg | Western gall rust (DSG)          |
			| gvo | Volume growth (GVO)              |

	Scenario: Clean the count table and import the CSV template
		When I open parent tree table options
		And I download the parent tree table template
		And I enter sample values into cone and pollen counts
		And I cancel cleaning the parent tree table
		And I clean the parent tree table
		Then the cone and pollen counts for parent trees "212" and "219" should be empty
		When I cancel the parent tree CSV upload
		And I import parent tree CSV file "Seedlot_composition_template.csv"
		Then parent tree "212" should have cone count "1" and pollen count "46"
		And parent tree "219" should have cone count "2" and pollen count "22"
		And I save the seedlot registration progress

	Scenario: Navigate parent tree table pages
		When I set the parent tree page size to "20"
		Then the parent tree pagination range should be "1–20"
		And the parent tree table should contain 20 rows
		When I select parent tree page "2"
		Then the parent tree pagination range should be "21–40"
		When I select parent tree page "1"
		And I move forward one parent tree page
		Then the selected parent tree page should be "2"
		When I move backward one parent tree page
		Then the selected parent tree page should be "1"

	Scenario: Calculate parent tree metrics
		When I calculate parent tree metrics
		Then the parent tree metric summaries should be visible
		And I save the seedlot registration progress
