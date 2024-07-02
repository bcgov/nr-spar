import React, {
  useState, useEffect, useRef, useContext
} from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Tabs, TabList, Tab, FlexGrid, Row, Column,
  TableContainer, TableToolbar, Checkbox,
  TableToolbarContent, OverflowMenuItem, OverflowMenu,
  Button, Table, TableHead, TableRow, TableHeader,
  DataTableSkeleton, DefinitionTooltip, Modal,
  Accordion, AccordionItem
} from '@carbon/react';
import {
  View, Settings, Upload, Add
} from '@carbon/icons-react';
import { getAllParentTrees } from '../../../api-service/orchardAPI';
import postForCalculation from '../../../api-service/parentTreeAPI';
import { postFile } from '../../../api-service/seedlotAPI';
import CheckboxType from '../../../types/CheckboxType';
import { PtValsCalcReqPayload } from '../../../types/PtCalcTypes';
import { sortAndSliceRows, sliceTableRowData } from '../../../utils/PaginationUtils';
import { recordValues } from '../../../utils/RecordUtils';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import InfoSection from '../../InfoSection';
import Subtitle from '../../Subtitle';
import EmptySection from '../../EmptySection';
import DetailSection from '../../DetailSection';
import DescriptionBox from '../../DescriptionBox';

import InputErrorNotification from './InputErrorNotification';
import UploadWarnNotification from './UploadWarnNotification';
import CalculateMetrics from './CalculateMetrics';
import InfoSectionDivider from './InfoSectionDivider';
import UnrelatedGenWorth from './UnrelatedGenWorth';
import PopSize from './PopSize';
import SpatialData from './SpatialData';
import {
  renderColOptions, renderTableBody, renderNotification,
  renderDefaultInputs, renderPagination
} from './TableComponents';
import { OrchardObj } from '../OrchardStep/definitions';
import UploadFileModal from './UploadFileModal';
import InfoSectionRow from '../../InfoSection/InfoSectionRow';
import {
  pageText, headerTemplate, geneticWorthDict,
  DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, DEFAULT_MIX_PAGE_SIZE,
  getDownloadUrl, fileConfigTemplate, getEmptySectionDescription,
  noParentTreeDescription, dataEntryInstructions,
  reviewDataInstructions, calculateInstructions
} from './constants';
import {
  TabTypes, HeaderObj, RowItem
} from './definitions';
import {
  getTabString, processOrchards, combineObjectValues, calcSummaryItems,
  processParentTreeData, cleanTable, fillCompostitionTables, configHeaderOpt,
  addNewMixRow, calcMixTabInfoItems, fillMixTable,
  hasParentTreesForSelectedOrchards,
  fillCalculatedInfo,
  generatePtValCalcPayload
} from './utils';

import './styles.scss';
import EditGenWorth from './EditGenWorth';

type ParentTreeStepProps = {
  isReviewDisplay?: boolean;
  isReviewRead?: boolean;
}

const ParentTreeStep = ({ isReviewDisplay, isReviewRead }: ParentTreeStepProps) => {
  const {
    allStepData: { parentTreeStep: state },
    allStepData: { orchardStep: { orchards } },
    setStepData,
    setStep,
    seedlotSpecies,
    isFormSubmitted,
    weightedGwInfoItems,
    setWeightedGwInfoItems,
    genWorthInfoItems,
    setGenWorthInfoItems,
    popSizeAndDiversityConfig,
    setPopSizeAndDiversityConfig,
    summaryConfig,
    setSummaryConfig,
    meanGeomInfos,
    setMeanGeomInfos,
    setIsCalculatingPt,
    setGeoInfoVals,
    setGenWorthVal
  } = useContext(ClassAContext);

  const [orchardsData, setOrchardsData] = useState<Array<OrchardObj>>(
    () => processOrchards(orchards)
  );
  const [currentTab, setCurrentTab] = useState<TabTypes>('coneTab');
  const [headerConfig, setHeaderConfig] = useState<Array<HeaderObj>>(
    structuredClone(headerTemplate)
  );
  const [currPageSize, setCurrPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [slicedRows, setSlicedRows] = useState<Array<RowItem>>(
    sortAndSliceRows(Object.values(state.tableRowData), currentPage, currPageSize, true, 'parentTreeNumber')
  );
  const [currMixPageSize, setCurrMixPageSize] = useState<number>(DEFAULT_MIX_PAGE_SIZE);
  const [currentMixPage, setCurrentMixPage] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [slicedMixRows, setSlicedMixRows] = useState<Array<RowItem>>(
    () => sortAndSliceRows(Object.values(state.mixTabData), currentMixPage, currMixPageSize, true, 'parentTreeNumber')
  );

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCleanWarnOpen, setIsCleanWarnOpen] = useState(false);
  const [fileUploadConfig, setFileUploadConfig] = useState(
    () => structuredClone(fileConfigTemplate)
  );
  const resetFileUploadConfig = () => setFileUploadConfig(
    () => structuredClone(fileConfigTemplate)
  );
  const [isSMPDefaultValChecked, setIsSMPDefaultValChecked] = useState(false);
  // Options are disabled if users have not typed in one or more valid orchards
  const [disableOptions, setDisableOptions] = useState(true);
  const [applicableGenWorths, setApplicableGenWorths] = useState<string[]>([]);
  // Array that stores invalid p.t. numbers uploaded from users from composition tabs
  const [invalidPTNumbers, setInvalidPTNumbers] = useState<string[]>([]);
  const [isOrchardEmpty, setIsOrchardEmpty] = useState<boolean>(false);
  const [showInfoSections, setShowInfoSections] = useState<boolean>(isReviewDisplay ?? false);

  const [controlReviewData, setControlReviewData] = useState<boolean>(isReviewDisplay ?? false);

  const emptySectionDescription = getEmptySectionDescription(setStep);

  // Link reference to trigger click event
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(
    () => {
      const processedOrchard = processOrchards(orchards);
      const disabled = processedOrchard.length === 0;
      setDisableOptions(disabled);
      setOrchardsData(processedOrchard);
    },
    [orchards]
  );

  // Effects for 'Cone and Pollen' and 'SMP Success' tabs
  useEffect(
    () => {
      const tableRows = Object.values(state.tableRowData);
      sliceTableRowData(
        tableRows,
        currentPage,
        currPageSize,
        true,
        'parentTreeNumber',
        setSlicedRows
      );
      calcSummaryItems(setSummaryConfig, summaryConfig, tableRows);
    },
    [state.tableRowData]
  );

  // Effects 'SMP mix' tab
  useEffect(
    () => {
      sliceTableRowData(
        Object.values(state.mixTabData),
        currentMixPage,
        currMixPageSize,
        true,
        'parentTreeNumber',
        setSlicedMixRows
      );
      calcMixTabInfoItems(
        disableOptions,
        summaryConfig,
        setSummaryConfig,
        applicableGenWorths,
        weightedGwInfoItems,
        setWeightedGwInfoItems,
        popSizeAndDiversityConfig,
        setPopSizeAndDiversityConfig,
        state
      );
    },
    [state.mixTabData, disableOptions]
  );

  // Parent trees Query
  const allParentTreeQuery = useQuery({
    queryKey: ['orchards', 'parent-trees', 'vegetation-codes', seedlotSpecies.code],
    queryFn: () => (
      getAllParentTrees(seedlotSpecies.code)
    ),
    staleTime: THREE_HOURS, // will not refetch for 3 hours
    cacheTime: THREE_HALF_HOURS // data is cached 3.5 hours then deleted
  });

  /**
   * Populate table when data is first fetched
   * Re-populate table if it is emptied by users and data is cached
   */
  useEffect(() => {
    const disabled = orchardsData.length === 0;
    if (
      !disabled
      && (Object.keys(state.tableRowData).length === 0 || controlReviewData)
      && allParentTreeQuery.isFetched
      && allParentTreeQuery.data
    ) {
      const orchardIds = orchardsData.map((o) => o.selectedItem?.code);

      if (hasParentTreesForSelectedOrchards(orchardIds, allParentTreeQuery.data)) {
        setDisableOptions(false);
        processParentTreeData(
          allParentTreeQuery.data,
          state,
          orchardsData.map((o) => o.selectedItem?.code),
          currentPage,
          currPageSize,
          setSlicedRows,
          setStepData
        );
        if (controlReviewData) {
          setControlReviewData(false);
        }
      } else {
        setDisableOptions(true);
        setIsOrchardEmpty(true);
      }
    }
  }, [state.tableRowData, allParentTreeQuery.isFetched]);

  useEffect(() => configHeaderOpt(
    geneticWorthDict,
    seedlotSpecies,
    headerConfig,
    genWorthInfoItems,
    setGenWorthInfoItems,
    setHeaderConfig,
    weightedGwInfoItems,
    setWeightedGwInfoItems,
    setApplicableGenWorths,
    isReviewDisplay ?? false
  ), [seedlotSpecies]);

  const uploadCompostion = useMutation({
    mutationFn: (coneCSV: File) => postFile(coneCSV, false),
    onSuccess: (res) => {
      resetFileUploadConfig();
      setIsUploadOpen(false);
      fillCompostitionTables(
        res.data,
        state,
        headerConfig,
        currentTab,
        setStepData,
        setInvalidPTNumbers,
        seedlotSpecies
      );
    },
    onError: (err: AxiosError) => {
      const msg = (err.response as AxiosResponse).data.message;
      setFileUploadConfig({ ...fileUploadConfig, errorSub: msg, invalidFile: true });
    }
  });

  const uploadMixFile = useMutation({
    mutationFn: (mixCsv: File) => postFile(mixCsv, true),
    onSuccess: (res) => {
      resetFileUploadConfig();
      setIsUploadOpen(false);
      fillMixTable(res.data, applicableGenWorths, state, setStepData);
    },
    onError: (err: AxiosError) => {
      const msg = (err.response as AxiosResponse).data.message;
      setFileUploadConfig({ ...fileUploadConfig, errorSub: msg, invalidFile: true });
    }
  });

  const calculateGenWorthQuery = useMutation({
    mutationFn: (data: PtValsCalcReqPayload) => postForCalculation(data),
    onSuccess: (res) => fillCalculatedInfo(
      res.data,
      genWorthInfoItems,
      setGenWorthInfoItems,
      popSizeAndDiversityConfig,
      setPopSizeAndDiversityConfig,
      meanGeomInfos,
      setMeanGeomInfos,
      setIsCalculatingPt,
      setGeoInfoVals,
      setGenWorthVal,
      isReviewDisplay
    )
  });

  const [ctrlFirstLoadReview, setCtrlFirstLoadReview] = useState<boolean>(isReviewDisplay ?? false);

  useEffect(() => {
    if (ctrlFirstLoadReview && !controlReviewData) {
      calculateGenWorthQuery.mutate(
        generatePtValCalcPayload(
          state,
          geneticWorthDict,
          seedlotSpecies
        )
      );
      setCtrlFirstLoadReview(false);
    }
  }, [controlReviewData]);

  const renderRecalcSection = () => {
    if (isReviewDisplay && !isReviewRead) {
      return (
        <DetailSection>
          <DescriptionBox
            header="Update genetic worth, geospatial and area of use"
            description="Recalculate values based on newly provided cone and pollen count data, overriding current entries"
          />
          <CalculateMetrics
            disableOptions={disableOptions}
            setShowInfoSections={setShowInfoSections}
            isReview
          />
        </DetailSection>
      );
    }
    return null;
  };

  const renderInfoSections = () => (
    <Row className="info-sections-row">
      <Column className="info-sections-col">
        {
          (currentTab === 'coneTab' || currentTab === 'successTab')
            ? (
              <>
                {/* -------- Summary Section -------- */}
                <DetailSection>
                  <DescriptionBox
                    header={summaryConfig[currentTab].title}
                    description={summaryConfig[currentTab].description}
                  />
                  <InfoSection
                    infoItems={
                      combineObjectValues([
                        summaryConfig.sharedItems,
                        summaryConfig[currentTab].infoItems
                      ])
                    }
                  />
                </DetailSection>
                {/* ------ Re-calculate Button Row - REVIEW ONLY ------ */}
                {
                  renderRecalcSection()
                }
                {/* -------- Calculate Button Row -------- */}
                <DetailSection>
                  {
                    !isFormSubmitted
                      ? (
                        <>
                          <DescriptionBox header="Genetic worth, effective population size and geospatial data" />
                          <CalculateMetrics
                            disableOptions={disableOptions}
                            setShowInfoSections={setShowInfoSections}
                          />
                        </>
                      )
                      : null
                  }
                  {
                    showInfoSections
                      ? (
                        <>
                          {/* ---- Genetic worth and percent of tested parent trees ---- */}
                          {
                            !isReviewDisplay ? <InfoSectionDivider /> : null
                          }
                          <Row className="info-section-sub-title">
                            <Column>
                              Genetic worth and percent of Tested parent tree contribution
                            </Column>
                          </Row>
                          {
                            isReviewDisplay && !isReviewRead
                              ? (
                                <EditGenWorth genWorthValues={recordValues(genWorthInfoItems)} />
                              )
                              : (
                                <InfoSection
                                  infoItems={[]}
                                >
                                  {
                                    recordValues(genWorthInfoItems).map((gwTuple) => (
                                      <InfoSectionRow key={gwTuple[0].name} items={gwTuple} />
                                    ))
                                  }
                                </InfoSection>
                              )
                          }
                          <InfoSectionDivider />
                          {/* ---- Unrelated genetic worth - REVIEW ONLY ---- */}
                          {
                            isReviewDisplay
                              ? (
                                <>
                                  <Row className="info-section-sub-title">
                                    <Column>
                                      Unrelated genetic worth
                                    </Column>
                                  </Row>
                                  <UnrelatedGenWorth
                                    isRead={isReviewRead}
                                    validGenWorth={geneticWorthDict[seedlotSpecies.code]}
                                  />
                                  <InfoSectionDivider />
                                </>
                              )
                              : null
                          }
                          {/* -------- Effective population size and diversity -------- */}
                          <Row className="info-section-sub-title">
                            <Column>
                              Effective population size and diversity
                            </Column>
                          </Row>
                          {
                            isReviewDisplay && !isReviewRead
                              ? (
                                <PopSize />
                              )
                              : (
                                <InfoSection
                                  infoItems={Object.values(popSizeAndDiversityConfig)}
                                />
                              )
                          }
                          <InfoSectionDivider />
                          {/* -------- Seedlot mean geospatial data -------- */}
                          <Row className="info-section-sub-title">
                            <Column>
                              {
                                !isReviewDisplay
                                  ? 'Orchard parent tree geospatial summary'
                                  : 'Mean geospatial data'
                              }
                            </Column>
                          </Row>
                          {
                            isReviewDisplay && !isReviewRead
                              ? (
                                <SpatialData />
                              )
                              : (
                                <InfoSection
                                  infoItems={Object.values(meanGeomInfos.seedlot)}
                                />
                              )
                          }
                        </>
                      )
                      : null
                  }
                </DetailSection>
              </>
            )
            : (
              <>
                <DetailSection>
                  <DescriptionBox
                    header="Breeding value of SMP mix used"
                    description="Check the breeding value of SMP mix used on parent"
                  />
                  <InfoSection
                    infoItems={
                      combineObjectValues([
                        summaryConfig[currentTab].infoItems,
                        weightedGwInfoItems
                      ])
                    }
                  />
                </DetailSection>
                {/* ------ Re-calculate Button Row - REVIEW ONLY ------ */}
                {
                  renderRecalcSection()
                }
                {
                  <DetailSection>
                    {/* -------- SMP mix mean geospatial data -------- */}
                    <Row className="info-section-sub-title">
                      <DescriptionBox
                        header="SMP Mix geospatial summary"
                      />
                    </Row>
                    {
                      !isFormSubmitted || !(isReviewDisplay && isReviewRead)
                        ? (
                          <CalculateMetrics
                            disableOptions={disableOptions}
                            setShowInfoSections={setShowInfoSections}
                          />
                        )
                        : null
                    }
                    {
                      showInfoSections
                        ? (
                          <InfoSection
                            infoItems={Object.values(meanGeomInfos.smpMix)}
                          />
                        )
                        : null
                    }
                  </DetailSection>
                }
              </>
            )
        }
      </Column>
    </Row>
  );

  return (
    <FlexGrid className="parent-tree-step-container">
      {
        !isReviewDisplay
          ? (
            <>
              <Row className="title-row">
                <Column sm={4} md={8} lg={16}>
                  <h2>{pageText.stepTitle}</h2>
                  <Subtitle text={pageText.stepSubtitle} />
                </Column>
              </Row>
              <Row>
                <Column sm={4} md={8} lg={16}>
                  <Accordion className="instructions-accordion">
                    <AccordionItem open title="1. Data entry">
                      {dataEntryInstructions}
                    </AccordionItem>
                    <AccordionItem open title="2. Review data">
                      {reviewDataInstructions}
                    </AccordionItem>
                    <AccordionItem open title="3. Calculate seedlot metrics">
                      {calculateInstructions}
                    </AccordionItem>
                  </Accordion>
                </Column>
              </Row>
            </>
          )
          : null
      }
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
              {
                renderNotification(
                  state,
                  currentTab,
                  orchardsData,
                  setStepData
                )
              }
              <InputErrorNotification state={state} headerConfig={headerConfig} />
              <UploadWarnNotification
                invalidPTNumbers={invalidPTNumbers}
                setInvalidPTNumbers={setInvalidPTNumbers}
              />
              {
                currentTab === 'successTab' && !isReviewRead
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
                            disabled={
                              disableOptions
                              || (isFormSubmitted
                              && !(isReviewDisplay && !isReviewRead))
                            }
                          />
                        </Column>
                      </Row>
                      {
                        renderDefaultInputs(
                          isSMPDefaultValChecked,
                          state,
                          setStepData,
                          seedlotSpecies
                        )
                      }
                    </>
                  )
                  : null
              }
              <Row className="parent-tree-step-table-container">
                <Column className="parent-tree-step-table-container-col">
                  <TableContainer
                    title={pageText[currentTab].tabTitle}
                    description={pageText[currentTab].tableDescription}
                    className={(!disableOptions) ? 'sticky-table-title' : undefined}
                  >
                    <div className={(!disableOptions) ? 'sticky-toolbar' : undefined}>
                      <TableToolbar aria-label="data table toolbar">
                        <TableToolbarContent>
                          {
                            currentTab === 'mixTab'
                              ? (
                                <Button
                                  kind="ghost"
                                  hasIconOnly
                                  disabled={
                                    disableOptions
                                    || (isFormSubmitted
                                    && !(isReviewDisplay && !isReviewRead))
                                  }
                                  renderIcon={Add}
                                  iconDescription="Add a new row"
                                  onClick={() => addNewMixRow(state, setStepData)}
                                />
                              )
                              : null
                          }
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
                            disabled={
                              disableOptions
                              || isFormSubmitted
                              || (isReviewDisplay && !isReviewRead)
                            }
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
                            disabled={
                              disableOptions
                              || !allParentTreeQuery.isFetched
                              || isFormSubmitted
                              || (isReviewDisplay && !isReviewRead)
                            }
                          >
                            Upload from file
                          </Button>
                        </TableToolbarContent>
                      </TableToolbar>
                    </div>
                    {
                      // Check if it's fetching parent tree data
                      (!disableOptions && allParentTreeQuery.isFetching)
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
                              disableOptions
                                ? null
                                : renderTableBody(
                                  currentTab,
                                  slicedRows,
                                  slicedMixRows,
                                  headerConfig,
                                  applicableGenWorths,
                                  state,
                                  setStepData,
                                  seedlotSpecies,
                                  isFormSubmitted,
                                  (isReviewDisplay && !isReviewRead)
                                )
                            }
                          </Table>
                        )
                    }
                    {
                      disableOptions
                        ? (
                          <EmptySection
                            title={
                              isOrchardEmpty
                                ? pageText.emptySection.emptyOrchard
                                : pageText.emptySection.title
                            }
                            description={
                              isOrchardEmpty
                                ? noParentTreeDescription
                                : emptySectionDescription
                            }
                            pictogram={
                              isOrchardEmpty
                                ? 'Question'
                                : 'CloudyWindy'
                            }
                          />
                        )
                        : renderPagination(
                          state,
                          currentTab,
                          currPageSize,
                          setCurrentPage,
                          setCurrPageSize,
                          setSlicedRows,
                          currMixPageSize,
                          setCurrMixPageSize,
                          setCurrentMixPage,
                          setSlicedMixRows
                        )
                    }
                  </TableContainer>
                </Column>
              </Row>
              {
                renderInfoSections()
              }
            </FlexGrid>
          </Tabs>
        </Column>
      </Row>
      <UploadFileModal
        open={isUploadOpen}
        setOpen={setIsUploadOpen}
        onSubmit={
          (file: File) => {
            if (currentTab === 'mixTab') {
              uploadMixFile.mutate(file);
            } else {
              uploadCompostion.mutate(file);
            }
          }
        }
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
