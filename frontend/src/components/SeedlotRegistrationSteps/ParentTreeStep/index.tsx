import React, { useState, useEffect, useRef } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { Link } from 'react-router-dom';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tabs, TabList, Tab, FlexGrid, Row, Column,
  TableContainer, TableToolbar, Checkbox,
  TableToolbarContent, OverflowMenuItem, OverflowMenu,
  Button, Table, TableHead, TableRow, TableHeader,
  DataTableSkeleton, DefinitionTooltip, Modal, Loading
} from '@carbon/react';
import {
  View, Settings, Upload, Renew
} from '@carbon/icons-react';
import { getParentTreeGeneQuali } from '../../../api-service/orchardAPI';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import DescriptionBox from '../../DescriptionBox';
import InfoSection from '../../InfoSection';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { postCompositionFile } from '../../../api-service/seedlotAPI';
import postForCalculation from '../../../api-service/geneticWorthAPI';
import CheckboxType from '../../../types/CheckboxType';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import EmptySection from '../../EmptySection';
import { sortAndSliceRows, sliceTableRowData, handlePagination } from '../../../utils/PaginationUtils';
import { recordValues } from '../../../utils/RecordUtils';
import { GenWorthCalcPayload } from '../../../types/GeneticWorthTypes';
import {
  renderColOptions, renderTableBody, renderNotification,
  renderDefaultInputs, renderPagination
} from './TableComponents';
import { OrchardObj } from '../OrchardStep/definitions';
import UploadFileModal from './UploadFileModal';
import InfoSectionRow from '../../InfoSection/InfoSectionRow';
import {
  pageText, headerTemplate, geneticWorthDict,
  DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, SummarySectionConfig,
  PopSizeAndDiversityConfig, getDownloadUrl, fileConfigTemplate,
  getEmptySectionDescription
} from './constants';
import {
  TabTypes, HeaderObj, RowItem
} from './definitions';
import {
  getTabString, processOrchards, combineObjectValues,
  calcSummaryItems,
  processParentTreeData,
  getParentTreesFetchStatus,
  cleanTable,
  fillCompostitionTables,
  configHeaderOpt,
  fillGwInfo,
  generateGenWorthPayload
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
  const [summaryConfig, setSummaryConfig] = useState(structuredClone(SummarySectionConfig));
  const [popSizeAndDiversityConfig] = useState(
    structuredClone(PopSizeAndDiversityConfig)
  );
  const [
    genWorthInfoItems,
    setGenWorthInfoItems
  ] = useState<Record<keyof RowItem, InfoDisplayObj[]>>({});
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

  useEffect(
    () => {
      const processedOrchard = processOrchards(orchards);
      setDisableOptions(processedOrchard.length === 0);
      setOrchardsData(processedOrchard);
      queryClient.resetQueries({ queryKey: ['orchard', 'parent-tree-genetic-quality'] });
    },
    [orchards]
  );

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
      const tableRows = Object.values(state.tableRowData);
      calcSummaryItems(disableOptions, setSummaryConfig, summaryConfig, tableRows);
    },
    [state.tableRowData]
  );

  // Parent tree genetic quality queries
  useQueries({
    queries:
      orchardsData.map((orchard) => ({
        queryKey: ['orchard', 'parent-tree-genetic-quality', orchard.selectedItem?.code],
        queryFn: () => (
          getParentTreeGeneQuali(orchard.selectedItem?.code)
        ),
        onSuccess: (data: ParentTreeGeneticQualityType) => processParentTreeData(
          data,
          state,
          currentPage,
          currPageSize,
          setSlicedRows,
          setStepData
        )
      }))
  });

  useEffect(
    () => setIsFetchingParentTrees(getParentTreesFetchStatus(orchardsData, queryClient)),
    [isQueryClientFetching]
  );

  useEffect(() => configHeaderOpt(
    geneticWorthDict,
    seedlotSpecies,
    headerConfig,
    genWorthInfoItems,
    setGenWorthInfoItems,
    setHeaderConfig
  ), [seedlotSpecies]);

  const uploadCompostion = useMutation({
    mutationFn: (coneCSV: File) => postCompositionFile(coneCSV),
    onSuccess: (res) => {
      resetFileUploadConfig();
      setIsUploadOpen(false);
      fillCompostitionTables(res, state, headerConfig, currentTab, setStepData);
    },
    onError: (err: AxiosError) => {
      const msg = (err.response as AxiosResponse).data.message;
      setFileUploadConfig({ ...fileUploadConfig, errorSub: msg, invalidFile: true });
    }
  });

  const calculateGenWorthQuery = useMutation({
    mutationFn: (data: GenWorthCalcPayload[]) => postForCalculation(data),
    onSuccess: (res) => fillGwInfo(res.data.geneticTraits, genWorthInfoItems, setGenWorthInfoItems)
  });

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
                      setStepData
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
                        renderDefaultInputs(isSMPDefaultValChecked, state, setStepData)
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
                            renderColOptions(headerConfig, currentTab, setHeaderConfig)
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
                          <OverflowMenuItem itemText="Export table as CSV file" disabled />
                          <OverflowMenuItem
                            itemText="Clean table data"
                            onClick={() => setIsCleanWarnOpen(true)}
                          />
                        </OverflowMenu>
                        <Button
                          className="upload-button"
                          size="lg"
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
                              renderTableBody(
                                currentTab,
                                slicedRows,
                                headerConfig,
                                state,
                                setStepData
                              )
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
        (currentTab === 'coneTab' || currentTab === 'successTab')
          ? (
            <>
              {/* -------- Genetic worth and percent of tested parent trees -------- */}
              <InfoSection
                title={pageText.gwAndTestedPerc.title}
                description={pageText.gwAndTestedPerc.description}
                infoItems={[]}
              >
                {
                  recordValues(genWorthInfoItems).map((gwTuple) => (
                    <InfoSectionRow key={gwTuple[0].name} items={gwTuple} />
                  ))
                }
              </InfoSection>
              {/* -------- Effective population size and diversity -------- */}
              <InfoSection
                title={pageText.popSizeAndDiverse.title}
                description={pageText.popSizeAndDiverse.description}
                infoItems={Object.values(popSizeAndDiversityConfig)}
              />
              {/* -------- Calculate Button Row -------- */}
              <Row className="gen-worth-cal-row">
                <Button
                  size="md"
                  kind="tertiary"
                  renderIcon={
                    () => (
                      <div className="gw-calc-loading-icon">
                        {
                          calculateGenWorthQuery.isLoading
                            ? <Loading withOverlay={false} small />
                            : <Renew />
                        }
                      </div>
                    )
                  }
                  disabled={disableOptions}
                  onClick={() => calculateGenWorthQuery.mutate(
                    generateGenWorthPayload(state, geneticWorthDict, seedlotSpecies)
                  )}
                >
                  Calculate Genetic worth and Effective population values
                </Button>
              </Row>
              {/* -------- Summary Section -------- */}
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
          cleanTable(state, headerConfig, currentTab, setStepData);
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
