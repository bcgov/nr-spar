import React, { useState, useEffect, useRef } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { Link } from 'react-router-dom';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tabs, TabList, Tab, FlexGrid, Row, Column,
  TableContainer, TableToolbar, Checkbox,
  TableToolbarContent, OverflowMenuItem, OverflowMenu,
  Button, Table, TableHead, TableRow, TableHeader,
  DataTableSkeleton, DefinitionTooltip, Modal
} from '@carbon/react';
import { View, Settings, Upload } from '@carbon/icons-react';
import { getParentTreeGeneQuali } from '../../../api-service/orchardAPI';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import DescriptionBox from '../../DescriptionBox';
import InfoSection from '../../InfoSection';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { postCompositionFile } from '../../../api-service/seedlotAPI';
import CheckboxType from '../../../types/CheckboxType';
import EmptySection from '../../EmptySection';
import { sortAndSliceRows, sliceTableRowData, handlePagination } from '../../../utils/PaginationUtils';
import {
  renderColOptions, renderTableBody, renderNotification,
  renderDefaultInputs, renderPagination
} from './TableComponents';
import { OrchardObj } from '../OrchardStep/definitions';
import UploadFileModal from './UploadFileModal';
import {
  pageText, headerTemplate, rowTemplate, geneticWorthDict,
  DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, summarySectionConfig,
  gwSectionConfig, getDownloadUrl, fileConfigTemplate, getEmptySectionDescription
} from './constants';
import {
  TabTypes, HeaderObj, RowItem, RowDataDictType, CompUploadResponse
} from './definitions';
import {
  getTabString, processOrchards, combineObjectValues,
  calcAverage, calcSum
} from './utils';

import './styles.scss';

interface ParentTreeStepProps {
  seedlotSpecies: MultiOptionsObj
  state: ParentTreeStepDataObj;
  setStep: Function
  setStepData: Function;
  orchards: Array<OrchardObj>;
}

const ParentTreeStep = (
  {
    seedlotSpecies,
    state,
    setStep,
    setStepData,
    orchards
  }: ParentTreeStepProps
) => {
  const queryClient = useQueryClient();
  const isQueryClientFetching = queryClient.isFetching() > 0;
  const [orchardsData, setOrchardsData] = useState<Array<OrchardObj>>([]);
  const [currentTab, setCurrentTab] = useState<keyof TabTypes>('coneTab');
  const [headerConfig, setHeaderConfig] = useState<Array<HeaderObj>>(
    structuredClone(headerTemplate)
  );
  const [currPageSize, setCurrPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [slicedRows, setSlicedRows] = useState<Array<RowItem>>(
    sortAndSliceRows(Object.values(state.tableRowData), currentPage, currPageSize, true, 'parentTreeNumber')
  );
  const [summaryConfig, setSummaryConfig] = useState(structuredClone(summarySectionConfig));
  const [gwInfoConfig, setGWInfoConfig] = useState(structuredClone(gwSectionConfig));
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCleanWarnOpen, setIsCleanWarnOpen] = useState(false);
  const [fileUploadConfig, setFileUploadConfig] = useState(structuredClone(fileConfigTemplate));
  const resetFileUploadConfig = () => setFileUploadConfig(structuredClone(fileConfigTemplate));
  const [isSMPDefaultValChecked, setIsSMPDefaultValChecked] = useState(false);
  // Options are disabled if users have not typed in one or more valid orchards
  const [disableOptions, setDisableOptions] = useState(true);
  const [isFetchingParentTrees, setIsFetchingParentTrees] = useState(true);

  // Link reference to trigger click event
  const linkRef = useRef<HTMLAnchorElement>(null);

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
      setDisableOptions(processedOrchard.length === 0);
      setOrchardsData(processedOrchard);
      queryClient.resetQueries({ queryKey: ['orchard', 'parent-tree-genetic-quality'] });
    },
    [orchards]
  );

  const calcSummaryItems = () => {
    if (!disableOptions) {
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
      sliceTableRowData(
        Object.values(state.tableRowData),
        currentPage,
        currPageSize,
        true,
        'parentTreeNumber',
        setSlicedRows
      );
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
        newRowData.parentTreeNumber = parentTree.parentTreeNumber;
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
    sliceTableRowData(
      Object.values(clonedTableRowData),
      currentPage,
      currPageSize,
      false,
      'parentTreeNumber',
      setSlicedRows
    );
    setStepData(modifiedState);
  };

  // Parent tree genetic quality queries
  useQueries({
    queries:
      orchardsData.map((orchard) => ({
        queryKey: ['orchard', 'parent-tree-genetic-quality', orchard.selectedItem?.code],
        queryFn: () => (
          getParentTreeGeneQuali(orchard.selectedItem?.code)
        ),
        onSuccess: (data: ParentTreeGeneticQualityType) => processParentTreeData(data)
      }))
  });

  const getParentTreesFetchStatus = (): boolean => {
    let isFetching = false;
    orchardsData.forEach((orchard) => {
      const orchardId = orchard.selectedItem?.code ? orchard.selectedItem.code : '';
      const queryKey = ['orchard', 'parent-tree-genetic-quality', orchardId];
      const queryStatus = queryClient.getQueryState(queryKey);
      if (!isFetching && queryStatus?.fetchStatus === 'fetching') {
        isFetching = true;
      }
    });
    return isFetching;
  };

  useEffect(
    () => setIsFetchingParentTrees(getParentTreesFetchStatus()),
    [isQueryClientFetching]
  );

  const setInputChange = (parentTreeNumber: string, colName: keyof RowItem, value: string) => {
    // Using structuredClone so useEffect on state.tableRowData can be triggered
    const clonedState = structuredClone(state);
    clonedState.tableRowData[parentTreeNumber][colName] = value;
    setStepData(clonedState);
  };

  /**
   * Each seedlot species has its own associated Genetic Worth values that users can toggle,
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
            value: ''
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

  const cleanTable = () => {
    const clonedState = structuredClone(state);
    const fieldsToClean = headerConfig
      .filter((header) => header.editable && header.availableInTabs.includes(currentTab))
      .map((header) => header.id);
    const parentTreeNumbers = Object.keys(clonedState.tableRowData);
    parentTreeNumbers.forEach((parentTreeNumber) => {
      fieldsToClean.forEach((field) => {
        clonedState.tableRowData[parentTreeNumber][field] = '';
      });
    });
    setStepData(clonedState);
    return clonedState;
  };

  const fillCompostitionTables = (res: AxiosResponse) => {
    // Store parent tree numbers that does not exist in the orchards
    const invalidParentTreeNumbers: Array<string> = [];

    // Clean the table first
    const clonedState = cleanTable();

    res.data.forEach((row: CompUploadResponse) => {
      const parentTreeNumber = row.parentTreeNumber.toString();
      if (Object.prototype.hasOwnProperty.call(clonedState.tableRowData, parentTreeNumber)) {
        // If the clone nubmer exist from user file then fill in the values
        clonedState.tableRowData[parentTreeNumber].coneCount = row.coneCount.toString();
        clonedState.tableRowData[parentTreeNumber].pollenCount = row.pollenCount.toString();
        clonedState.tableRowData[parentTreeNumber].smpSuccessPerc = row.smpSuccess.toString();
        clonedState.tableRowData[parentTreeNumber]
          .nonOrchardPollenContam = row.pollenContamination.toString();
      } else {
        invalidParentTreeNumbers.push(parentTreeNumber);
      }
    });

    setStepData(clonedState);

    if (invalidParentTreeNumbers.length > 0) {
      // A temporary solution to let users know they have invalid clone numbers
      // eslint-disable-next-line no-alert
      alert(`The following clone numbers cannot be found: ${invalidParentTreeNumbers}`);
    }
  };

  const uploadCompostion = useMutation({
    mutationFn: (coneCSV: File) => postCompositionFile(coneCSV),
    onSuccess: (res) => {
      resetFileUploadConfig();
      setIsUploadOpen(false);
      fillCompostitionTables(res);
    },
    onError: (err: AxiosError) => {
      const msg = (err.response as AxiosResponse).data.message;
      setFileUploadConfig({ ...fileUploadConfig, errorSub: msg, invalidFile: true });
    }
  });

  const applyValueToAll = (field: keyof RowItem, value: string) => {
    const clonedState = structuredClone(state);
    const parentTreeNumbers = Object.keys(clonedState.tableRowData);
    parentTreeNumbers.forEach((number) => {
      clonedState.tableRowData[number][field] = value;
    });
    setStepData(clonedState);
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
                    renderNotification(
                      state,
                      currentTab,
                      orchardsData,
                      toggleNotification
                    )
                  }
                </Column>
              </Row>
              {
                currentTab === 'successTab'
                  ? (
                    <>
                      <Row className="smp-default-checkbox-row">
                        <Column>
                          <Checkbox
                            id="smp-default-vals-checkbox"
                            checked={isSMPDefaultValChecked}
                            labelText={pageText.successTab.defaultCheckBoxDesc}
                            onChange={
                              (
                                _event: React.ChangeEvent<HTMLInputElement>,
                                { checked }: CheckboxType
                              ) => {
                                setIsSMPDefaultValChecked(checked);
                              }
                            }
                            disabled={disableOptions}
                          />
                        </Column>
                      </Row>
                      {
                        renderDefaultInputs(isSMPDefaultValChecked, applyValueToAll)
                      }
                    </>
                  )
                  : null
              }
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
                          disabled={disableOptions}
                        >
                          {
                            renderColOptions(headerConfig, currentTab, toggleColumn)
                          }
                        </OverflowMenu>
                        <OverflowMenu
                          renderIcon={Settings}
                          iconDescription="More options"
                          menuOptionsClass="parent-tree-table-option-menu"
                          disabled={disableOptions}
                        >
                          <OverflowMenuItem
                            itemText={
                              (
                                <Link
                                  ref={linkRef}
                                  to={getDownloadUrl(currentTab)}
                                  target="_blank"
                                >
                                  Download table template
                                </Link>
                              )
                            }
                            onClick={() => linkRef.current?.click()}
                          />
                          <OverflowMenuItem itemText="Export table as PDF file" disabled />
                          <OverflowMenuItem
                            itemText="Clean table data"
                            onClick={() => setIsCleanWarnOpen(true)}
                          />
                        </OverflowMenu>
                        <Button
                          className="upload-button"
                          size="sm"
                          kind="primary"
                          renderIcon={Upload}
                          onClick={() => setIsUploadOpen(true)}
                          disabled={disableOptions}
                        >
                          Upload from file
                        </Button>
                      </TableToolbarContent>
                    </TableToolbar>
                    {
                      // Check if it's fetching parent tree data
                      (!disableOptions && isFetchingParentTrees)
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
                      disableOptions
                        ? <EmptySection title={pageText.emptySection.title} description={getEmptySectionDescription(setStep)} pictogram="CloudyWindy" />
                        : renderPagination(
                          state,
                          currentTab,
                          currPageSize,
                          setCurrentPage,
                          setCurrPageSize,
                          handlePagination,
                          setSlicedRows
                        )
                    }
                  </TableContainer>
                </Column>
              </Row>
            </FlexGrid>
          </Tabs>
        </Column>
      </Row>
      {
        currentTab === 'mixTab'
          ? (
            <EmptySection
              title="Coming soon"
              description=""
              icon="Construction"
            />
          )
          : null
      }
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
        onSubmit={(file: File) => uploadCompostion.mutate(file)}
        fileUploadConfig={fileUploadConfig}
        setFileUploadConfig={setFileUploadConfig}
        resetFileUploadConfig={resetFileUploadConfig}
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
