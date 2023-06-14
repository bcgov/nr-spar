/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  FlexGrid,
  Row,
  Column,
  ActionableNotification,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  OverflowMenuItem,
  OverflowMenu,
  Button,
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
  DefinitionTooltip,
  TextInput,
  Pagination
} from '@carbon/react';
import { View, Settings, Upload } from '@carbon/icons-react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { getSeedPlanUnits, getParentTreeGeneQuali } from '../../../api-service/orchardAPI';

import DropDownObj from '../../../types/DropDownObject';
import DescriptionBox from '../../DescriptionBox';
import { OrchardObj } from '../OrchardStep/definitions';
import {
  getPageText, headerTemplate, rowTemplate, geneticWorthDict, pageSizesConfig,
  DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER
} from './constants';
import {
  TabTypes, HeaderObj, RowItem, RowDataDictType
} from './definitions';
import {
  getTabString, processOrchards, sortAndSliceRows
} from './utils';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import PaginationChangeType from '../../../types/PaginationChangeType';
import './styles.scss';

interface ParentTreeStepProps {
  seedlotSpecies: DropDownObj
  state: ParentTreeStepDataObj;
  setStepData: Function;
  orchards: Array<OrchardObj>;
}

const ParentTreeStep = (
  {
    seedlotSpecies,
    state,
    setStepData,
    orchards
  }: ParentTreeStepProps
) => {
  const pageText = getPageText();
  const queryClient = useQueryClient();
  const [orchardsData, setOrchardsData] = useState<Array<OrchardObj>>([]);
  const [currentTab, setCurrentTab] = useState<keyof TabTypes>('coneTab');
  const [headerConfig, setHeaderConfig] = useState<Array<HeaderObj>>(
    structuredClone(headerTemplate)
  );
  const [currPageSize, setCurrPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE_NUMBER);

  const [slicedRows, setSlicedRows] = useState<Array<RowItem>>(
    sortAndSliceRows(Object.values(state.tableRowData), currentPage, currPageSize, true)
  );

  const toggleNotification = (notifType: string) => {
    const modifiedState = { ...state };
    if (notifType === 'info') {
      modifiedState.notifCtrl[currentTab].showInfo = false;
    }
    if (notifType === 'error') {
      modifiedState.notifCtrl[currentTab].showError = false;
    }
    setStepData(modifiedState);
  };

  useEffect(
    () => {
      const processedOrchard = processOrchards(orchards);
      setOrchardsData(processedOrchard);
    },
    [orchards]
  );

  // Seed plan units queries
  useQueries({
    queries:
      orchardsData.map((orchard) => ({
        queryKey: ['orchard', orchard.orchardId, 'seed-plan-units'],
        queryFn: () => getSeedPlanUnits(orchard.orchardId),
        refetchOnMount: false,
        refetchOnWindowFocus: false
      }))
  });

  const getSPUfromQuery = (orchardId: string): string => {
    const data: Array<any> = queryClient.getQueryData(['orchard', orchardId, 'seed-plan-units']) ?? [];
    if (data[0]?.seedPlanningUnitId) {
      return data[0].seedPlanningUnitId;
    }
    return '';
  };

  const enableParentTreeQuery = (orchardId: string): boolean => {
    if (queryClient.getQueryState(['orchard', orchardId, 'seed-plan-units'])?.status === 'success') {
      return getSPUfromQuery(orchardId) !== '';
    }
    return false;
  };

  const sliceTableRowData = (
    rows: Array<RowItem>,
    pageNumber: number,
    pageSize: number,
    sliceOnly: boolean
  ) => {
    const sliced = sortAndSliceRows(rows, pageNumber, pageSize, sliceOnly);
    setSlicedRows(sliced);
  };

  const processParentTreeData = (data: ParentTreeGeneticQualityType) => {
    const modifiedState = { ...state };
    let clonedTableRowData: RowDataDictType = structuredClone(state.tableRowData);

    data.parentTrees.forEach((parentTree) => {
      if (!Object.prototype.hasOwnProperty.call(clonedTableRowData, parentTree.parentTreeNumber)) {
        const newRowData: RowItem = structuredClone(rowTemplate);
        newRowData.cloneNumber = parentTree.parentTreeNumber;
        // Assign genetic worth values
        parentTree.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
          const genWorthName = singleGenWorthObj.geneticWorthCode.toLowerCase();
          if (Object.prototype.hasOwnProperty.call(newRowData, genWorthName)) {
            newRowData[genWorthName] = singleGenWorthObj.geneticQualityValue;
          }
        });
        clonedTableRowData = Object.assign(clonedTableRowData, {
          [parentTree.parentTreeNumber]: newRowData
        });
      }
    });

    modifiedState.tableRowData = clonedTableRowData;
    sliceTableRowData(Object.values(clonedTableRowData), currentPage, currPageSize, false);
    setStepData(modifiedState);
  };

  // Parent tree genetic quality queries
  useQueries({
    queries:
      orchardsData.map((orchard) => ({
        queryKey: ['orchard', 'parent-tree-genetic-quality', orchard.orchardId, getSPUfromQuery(orchard.orchardId)],
        queryFn: () => (
          getParentTreeGeneQuali(orchard.orchardId, getSPUfromQuery(orchard.orchardId))
        ),
        enabled: enableParentTreeQuery(orchard.orchardId),
        onSuccess: (data: ParentTreeGeneticQualityType) => processParentTreeData(data),
        refetchOnMount: true,
        refetchOnWindowFocus: false
      }))
  });

  const setInputChange = (cloneNumber: string, colName: keyof RowItem, value: string) => {
    const clonedState = { ...state };
    clonedState.tableRowData[cloneNumber][colName] = value;
    // Slicing rows again to make sure the value is updated in the slicedRows state,
    // It works without doing this as slicedRows is a shallow copy, but let's not rely on it
    sliceTableRowData(Object.values(clonedState.tableRowData), currentPage, currPageSize, true);
    setStepData(clonedState);
  };

  const renderTableCell = (rowData: RowItem, header: HeaderObj) => {
    if (header.availableInTabs.includes(currentTab) && header.enabled) {
      const className = header.editable ? 'td-no-padding' : null;
      return (
        <TableCell key={header.id} className={className}>
          {
            header.editable
              ? (
                <TextInput
                  labelText=""
                  hideLabel
                  type="number"
                  placeholder="Add value"
                  defaultValue={rowData[header.id]}
                  id={`${rowData.cloneNumber}-${rowData[header.id]}`}
                  onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setInputChange(rowData.cloneNumber, header.id, event.target.value);
                  }}
                  onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                  onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
                    if (event.key === 'Enter') {
                      (event.target as HTMLInputElement).blur();
                    }
                  }}
                />
              )
              : (
                rowData[header.id]
              )
          }
        </TableCell>
      );
    }
    return null;
  };

  const configHeaderOpt = () => {
    const speciesHasGenWorth = Object.keys(geneticWorthDict);
    if (speciesHasGenWorth.includes(seedlotSpecies.code)) {
      const availOptions = geneticWorthDict[seedlotSpecies.code];
      const clonedHeaders = structuredClone(headerConfig);
      availOptions.forEach((opt: string) => {
        const optionIndex = headerConfig.findIndex((header) => header.id === opt);
        clonedHeaders[optionIndex].isAnOption = true;
      });
      setHeaderConfig(clonedHeaders);
    }
  };

  useEffect(() => configHeaderOpt(), [seedlotSpecies]);

  const toggleColumn = (colName: keyof RowItem, nodeName: string) => {
    // Without this check the checkbox will be clicked twice
    if (nodeName !== 'INPUT') {
      const clonedHeaders = structuredClone(headerConfig);
      const optionIndex = headerConfig.findIndex((header) => header.id === colName);
      clonedHeaders[optionIndex].enabled = !headerConfig[optionIndex].enabled;
      setHeaderConfig(clonedHeaders);
    }
  };

  const renderNotification = () => {
    if (state.notifCtrl[currentTab].showInfo && orchardsData.length > 0) {
      return (
        <ActionableNotification
          kind="info"
          lowContrast
          title={pageText.notificationTitle}
          inline
          actionButtonLabel=""
          onClose={() => {
            toggleNotification('info');
            return false;
          }}
        >
          <span className="notification-subtitle">
            {pageText[currentTab].notificationSubtitle}
          </span>
        </ActionableNotification>
      );
    }

    if (state.notifCtrl[currentTab].showError && orchardsData.length === 0) {
      return (
        <ActionableNotification
          kind="error"
          lowContrast
          title={pageText.errorNotifTitle}
          actionButtonLabel=""
          onClose={() => {
            toggleNotification('error');
            return false;
          }}
        >
          <span className="notification-subtitle">
            {pageText.errorDescription}
          </span>
        </ActionableNotification>
      );
    }

    return null;
  };

  const renderColOptions = () => {
    const toggleableCols = headerConfig
      .filter((header) => header.isAnOption && header.availableInTabs.includes(currentTab));

    return (
      toggleableCols.map((header) => (
        <OverflowMenuItem
          key={header.id}
          closeMenu={() => false}
          onClick={(e: React.ChangeEvent<any>) => toggleColumn(header.id, e.target.nodeName)}
          itemText={
            (
              <Checkbox
                checked={header.enabled}
                id={header.id}
                labelText={header.name}
              />
            )
          }
        />
      ))
    );
  };

  const handlePagination = (paginationObj: PaginationChangeType) => {
    const { page, pageSize } = paginationObj;
    setCurrentPage(page);
    setCurrPageSize(pageSize);
    sliceTableRowData(Object.values(state.tableRowData), page, pageSize, true);
  };

  const renderTableBody = () => {
    if (currentTab === 'mixTab') {
      return null;
    }
    return (
      <TableBody>
        {
          slicedRows.map((rowData) => (
            rowData.isCalcTab
              ? null
              : (
                <TableRow key={rowData.cloneNumber}>
                  {
                    headerConfig.map((header) => (
                      renderTableCell(rowData, header)
                    ))
                  }
                </TableRow>
              )
          ))
        }
      </TableBody>
    );
  };

  const renderPagination = () => {
    if (currentTab === 'mixTab') {
      return null;
    }
    return (
      <Pagination
        pageSize={currPageSize}
        pageSizes={pageSizesConfig}
        itemsPerPageText=""
        totalItems={Object.values(state.tableRowData).length}
        onChange={
          (paginationObj: PaginationChangeType) => handlePagination(paginationObj)
        }
      />
    );
  };

  return (
    <FlexGrid className="parent-tree-step-container">
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Tabs onChange={
            (value: { selectedIndex: number }) => setCurrentTab(getTabString(value.selectedIndex))
          }
          >
            <TabList className="parent-tree-step-tab-list" aria-label="List of tabs">
              <Tab>
                {pageText.coneTab.tabTitle}
                &nbsp;(required)
              </Tab>
              <Tab>{pageText.successTab.tabTitle}</Tab>
              <Tab>{pageText.mixTab.tabTitle}</Tab>
            </TabList>
            <FlexGrid className="parent-tree-tab-container">
              <Row className="title-row">
                <Column sm={4} md={8} lg={16} xlg={12} max={10}>
                  <DescriptionBox
                    header={pageText[currentTab].tabTitle}
                    description={pageText[currentTab].tabDescription}
                  />
                </Column>
              </Row>
              <Row className="notification-row">
                <Column>
                  {
                    renderNotification()
                  }
                </Column>
              </Row>
              <Row className="parent-tree-step-table-container">
                <Column>
                  <TableContainer
                    title={pageText[currentTab].tabTitle}
                    description={pageText[currentTab].tableDescription}
                  >
                    <TableToolbar aria-label="data table toolbar">
                      <TableToolbarContent>
                        <OverflowMenu
                          renderIcon={View}
                          iconDescription="Show/hide columns"
                          flipped
                        >
                          {
                            renderColOptions()
                          }
                        </OverflowMenu>
                        <OverflowMenu
                          renderIcon={Settings}
                          iconDescription="more options"
                        >
                          <OverflowMenuItem
                            itemText="Download table template"
                          />
                        </OverflowMenu>
                        <Button
                          size="sm"
                          kind="primary"
                          renderIcon={Upload}
                        >
                          Upload from file
                        </Button>
                      </TableToolbarContent>
                    </TableToolbar>
                    {
                      // Check if it's fetching parent tree data
                      orchardsData.length > 0 && Object.values(state.tableRowData).length === 0
                        ? (
                          <DataTableSkeleton
                            showToolbar={false}
                            showHeader={false}
                            zebra
                          />
                        )
                        : (
                          <Table useZebraStyles>
                            <TableHead className="table-header">
                              <TableRow>
                                {
                                  headerConfig.map((header) => (
                                    (header.availableInTabs.includes(currentTab) && header.enabled)
                                      ? (
                                        <TableHeader id={header.id} key={header.id}>
                                          <DefinitionTooltip
                                            align="top"
                                            openOnHover
                                            definition={header.description}
                                          >
                                            {header.name}
                                          </DefinitionTooltip>
                                        </TableHeader>
                                      )
                                      : null
                                  ))
                                }
                              </TableRow>
                            </TableHead>
                            {
                              renderTableBody()
                            }
                          </Table>
                        )
                    }
                    {
                      renderPagination()
                    }
                  </TableContainer>
                </Column>
              </Row>
            </FlexGrid>
          </Tabs>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ParentTreeStep;
