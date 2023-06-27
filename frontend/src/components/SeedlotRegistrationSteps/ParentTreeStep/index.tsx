/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Tabs, TabList, Tab, FlexGrid, Row, Column,
  TableContainer, TableToolbar,
  TableToolbarContent, OverflowMenuItem, OverflowMenu,
  Button, Table, TableHead, TableRow, TableHeader,
  DataTableSkeleton, DefinitionTooltip, Modal
} from '@carbon/react';
import { Link } from 'react-router-dom';
import { View, Settings, Upload } from '@carbon/icons-react';
import { useQueries, useMutation } from '@tanstack/react-query';
import { getParentTreeGeneQuali } from '../../../api-service/orchardAPI';

import MultiOptionsObj from '../../../types/MultiOptionsObject';
import DescriptionBox from '../../DescriptionBox';
import InfoSection from '../../InfoSection';
import { OrchardObj } from '../OrchardStep/definitions';
import {
  pageText, headerTemplate, rowTemplate, geneticWorthDict,
  DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, summarySectionConfig,
  gwSectionConfig, getDownloadUrl
} from './constants';
import {
  TabTypes, HeaderObj, RowItem, RowDataDictType
} from './definitions';
import {
  getTabString, processOrchards, sortAndSliceRows, combineObjectValues,
  calcAverage, calcSum
} from './utils';
import {
  renderColOptions, renderTableBody, renderNotification, renderPagination
} from './TableComponents';
import UploadFileModal from './UploadFileModal';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import PaginationChangeType from '../../../types/PaginationChangeType';
import { postConeAndPollenFile } from '../../../api-service/seedlotAPI';
import ApiConfig from '../../../api-service/ApiConfig';
import useFileUploadMutation from '../../../api-service/fileUploadMutation';

import './styles.scss';

interface ParentTreeStepProps {
  seedlotNumber: string,
  seedlotSpecies: MultiOptionsObj
  state: ParentTreeStepDataObj;
  setStepData: Function;
  orchards: Array<OrchardObj>;
}

const ParentTreeStep = (
  {
    seedlotNumber,
    seedlotSpecies,
    state,
    setStepData,
    orchards
  }: ParentTreeStepProps
) => {
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
  const [summaryConfig, setSummaryConfig] = useState(structuredClone(summarySectionConfig));
  const [gwInfoConfig, setGWInfoConfig] = useState(structuredClone(gwSectionConfig));
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCleanWarnOpen, setIsCleanWarnOpen] = useState(false);

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

  const sliceTableRowData = (
    rows: Array<RowItem>,
    pageNumber: number,
    pageSize: number,
    sliceOnly: boolean
  ) => {
    const sliced = sortAndSliceRows(rows, pageNumber, pageSize, sliceOnly);
    setSlicedRows(sliced);
  };

  const calcSummaryItems = () => {
    if (orchardsData.length > 0) {
      const modifiedSummaryConfig = { ...summaryConfig };
      const tableRows = Object.values(state.tableRowData);

      // Calc Total Number of Parent Trees
      modifiedSummaryConfig.sharedItems
        .totalParentTree.value = tableRows.length.toString();

      // Calc Total number of cone count
      modifiedSummaryConfig.coneTab
        .infoItems.totalCone.value = calcSum(tableRows, 'coneCount');

      // Calc Total number of pollen count
      modifiedSummaryConfig.coneTab
        .infoItems.totalPollen.value = calcSum(tableRows, 'pollenCount');

      // Calc AVG of SMP Success
      modifiedSummaryConfig.sharedItems
        .avgSMPSuccess.value = calcAverage(tableRows, 'smpSuccessPerc');

      // Calc AVG of of non-orchard pollen contam.
      modifiedSummaryConfig.successTab
        .infoItems.avgNonOrchardContam.value = calcAverage(tableRows, 'nonOrchardPollenContam');

      setSummaryConfig(modifiedSummaryConfig);
    }
  };

  useEffect(
    () => {
      sliceTableRowData(Object.values(state.tableRowData), currentPage, currPageSize, true);
      calcSummaryItems();
    },
    [state.tableRowData]
  );

  const processParentTreeData = (data: ParentTreeGeneticQualityType) => {
    const modifiedState = { ...state };
    let clonedTableRowData: RowDataDictType = structuredClone(state.tableRowData);

    data.parentTrees.forEach((parentTree) => {
      if (!Object.prototype.hasOwnProperty.call(clonedTableRowData, parentTree.parentTreeNumber)) {
        const newRowData: RowItem = structuredClone(rowTemplate);
        newRowData.cloneNumber = parentTree.parentTreeNumber;
        // Assign genetic worth values
        parentTree.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
          // We only care about breeding values of genetic worth
          if (singleGenWorthObj.geneticTypeCode === 'BV') {
            const genWorthName = singleGenWorthObj.geneticWorthCode.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(newRowData, genWorthName)) {
              newRowData[genWorthName] = singleGenWorthObj.geneticQualityValue;
            }
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
        queryKey: ['orchard', 'parent-tree-genetic-quality', orchard.orchardId],
        queryFn: () => (
          getParentTreeGeneQuali(orchard.orchardId)
        ),
        onSuccess: (data: ParentTreeGeneticQualityType) => processParentTreeData(data),
        refetchOnMount: true,
        refetchOnWindowFocus: false
      }))
  });

  const setInputChange = (cloneNumber: string, colName: keyof RowItem, value: string) => {
    // Using structuredClone so useEffect on state.tableRowData can be triggered
    const clonedState = structuredClone(state);
    clonedState.tableRowData[cloneNumber][colName] = value;
    setStepData(clonedState);
  };

  /**
   * Each seedlot speicies has its own associated Genetic Worth values that users can toggle,
   * only those values associated are displayed to user.
   * This function toggles the isAnOption field of a header column so it can be
   * displayed as an option
   */
  const configHeaderOpt = () => {
    const speciesHasGenWorth = Object.keys(geneticWorthDict);
    if (speciesHasGenWorth.includes(seedlotSpecies.code)) {
      const availOptions = geneticWorthDict[seedlotSpecies.code];
      const clonedHeaders = structuredClone(headerConfig);
      let clonedGWItems = structuredClone(gwInfoConfig);
      availOptions.forEach((opt: string) => {
        const optionIndex = headerConfig.findIndex((header) => header.id === opt);
        // Enable option in the column customization
        clonedHeaders[optionIndex].isAnOption = true;
        // Add GW input to the info section at the bottom
        clonedGWItems = Object.assign(clonedGWItems, {
          [clonedHeaders[optionIndex].id]: {
            name: clonedHeaders[optionIndex].name,
            value: '--'
          }
        });
      });
      setHeaderConfig(clonedHeaders);
      setGWInfoConfig(clonedGWItems);
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

  const handlePagination = (paginationObj: PaginationChangeType) => {
    const { page, pageSize } = paginationObj;
    setCurrentPage(page);
    setCurrPageSize(pageSize);
    sliceTableRowData(Object.values(state.tableRowData), page, pageSize, true);
  };

  const cleanTable = () => {
    const modifiedState = { ...state };
    const clonedTableRowData: RowDataDictType = structuredClone(state.tableRowData);
    const fieldsToClean = headerConfig
      .filter((header) => header.editable && header.availableInTabs.includes(currentTab))
      .map((header) => header.id);
    const cloneNumbers = Object.keys(clonedTableRowData);
    cloneNumbers.forEach((cloneNumber) => {
      fieldsToClean.forEach((field) => {
        clonedTableRowData[cloneNumber][field] = '';
      });
    });

    modifiedState.tableRowData = clonedTableRowData;
    setStepData(modifiedState);
  };

  const uploadConePollen = useMutation({
    mutationFn: (coneCSV: File) => postConeAndPollenFile(seedlotNumber, coneCSV),
    onSuccess: (data) => { console.log(data); },
    onError: (err) => console.log('hahaha', err)
  });

  const uploadFile = useFileUploadMutation();

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
                    renderNotification(
                      state,
                      currentTab,
                      orchardsData,
                      toggleNotification
                    )
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
                          menuOptionsClass="parent-tree-table-toggle-menu"
                          renderIcon={View}
                          iconDescription="Show/hide columns"
                          flipped
                        >
                          {
                            renderColOptions(headerConfig, currentTab, toggleColumn)
                          }
                        </OverflowMenu>
                        <OverflowMenu
                          renderIcon={Settings}
                          iconDescription="more options"
                          menuOptionsClass="parent-tree-table-option-menu"
                        >
                          <OverflowMenuItem
                            itemText={
                              (
                                <Link
                                  to={getDownloadUrl(currentTab)}
                                  target="_blank"
                                >
                                  Download table template
                                </Link>
                              )
                            }
                          />
                          <OverflowMenuItem itemText="Export table as PDF file" disabled />
                          <OverflowMenuItem
                            itemText="Clean table data"
                            onClick={() => setIsCleanWarnOpen(true)}
                          />
                        </OverflowMenu>
                        <Button
                          size="sm"
                          kind="primary"
                          renderIcon={Upload}
                          onClick={() => setIsUploadOpen(true)}
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
                              renderTableBody(currentTab, slicedRows, headerConfig, setInputChange)
                            }
                          </Table>
                        )
                    }
                    {
                      renderPagination(state, currentTab, currPageSize, handlePagination)
                    }
                  </TableContainer>
                </Column>
              </Row>
            </FlexGrid>
          </Tabs>
        </Column>
      </Row>
      {
        currentTab === 'coneTab' || currentTab === 'successTab'
          ? (
            <>
              <InfoSection
                title={summaryConfig[currentTab].title}
                description={summaryConfig[currentTab].description}
                infoItems={
                  combineObjectValues([
                    summaryConfig.sharedItems,
                    summaryConfig[currentTab].infoItems
                  ])
                }
              />
              <InfoSection
                title={pageText.gwAndDiverse.title}
                description={pageText.gwAndDiverse.description}
                infoItems={Object.values(gwInfoConfig)}
              />
            </>
          )
          : null
      }
      <UploadFileModal
        open={isUploadOpen}
        setOpen={setIsUploadOpen}
        onSubmit={(file: File) => uploadConePollen.mutate(file)}
        // onSubmit={(file: File) => useFileUploadMutation.mutate({
        //   uploadUrl: ApiConfig.uploadConeAndPollen.replace('{seedlotNumber}', seedlotNumber),
        //   file
        // })}
      />
      <Modal
        className="clean-data-modal"
        open={isCleanWarnOpen}
        onRequestClose={() => setIsCleanWarnOpen(false)}
        onRequestSubmit={() => {
          cleanTable();
          setIsCleanWarnOpen(false);
        }}
        danger
        size="sm"
        modalHeading={pageText[currentTab].cleanModalHeading}
        modalLabel={pageText.cleanModal.label}
        primaryButtonText={pageText.cleanModal.primaryButtonText}
        secondaryButtonText={pageText.cleanModal.secondaryButtonText}
      />
    </FlexGrid>
  );
};

export default ParentTreeStep;
