/* eslint-disable max-len */
import React, { useEffect, useRef, useState } from 'react';
import {
  useNavigate, useParams, useSearchParams, useLocation
} from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Loading,
  Grid,
  InlineNotification,
  InlineLoading,
  ActionableNotification
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';

import getFundingSources from '../../../api-service/fundingSourcesAPI';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';
import getGameticMethodology from '../../../api-service/gameticMethodologyAPI';
import { getSeedlotById, putAClassSeedlot, putAClassSeedlotProgress } from '../../../api-service/seedlotAPI';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import { getForestClientByNumber } from '../../../api-service/forestClientsAPI';
import getApplicantAgenciesOptions from '../../../api-service/applicantAgenciesAPI';
import {
  TEN_SECONDS, THREE_HALF_HOURS, THREE_HOURS, FIVE_SECONDS
} from '../../../config/TimeUnits';

import PageTitle from '../../../components/PageTitle';
import SeedlotRegistrationProgress from '../../../components/SeedlotRegistrationProgress';
import CollectionStep from '../../../components/SeedlotRegistrationSteps/CollectionStep';
import OwnershipStep from '../../../components/SeedlotRegistrationSteps/OwnershipStep';
import InterimStorage from '../../../components/SeedlotRegistrationSteps/InterimStep';
import OrchardStep from '../../../components/SeedlotRegistrationSteps/OrchardStep';
import ParentTreeStep from '../../../components/SeedlotRegistrationSteps/ParentTreeStep';
import ExtractionAndStorage from '../../../components/SeedlotRegistrationSteps/ExtractionAndStorageStep';
import SubmitModal from '../../../components/SeedlotRegistrationSteps/SubmitModal';

import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { OrchardForm } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import { getMultiOptList, getCheckboxOptions } from '../../../utils/MultiOptionsUtils';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { SeedlotAClassSubmitType } from '../../../types/SeedlotType';
import { generateDefaultRows } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import { DEFAULT_MIX_PAGE_ROWS } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import PathConstants from '../../../routes/pathConstants';

import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';

import SaveTooltipLabel from './SaveTooltip';
import { AllStepData, ProgressIndicatorConfig, ProgressStepStatus } from './definitions';
import {
  initProgressBar,
  initCollectionState,
  initInterimState,
  initOrchardState,
  initOwnershipState,
  initExtractionStorageState,
  initParentTreeState,
  getSpeciesOptionByCode,
  validateCollectionStep,
  verifyCollectionStepCompleteness,
  validateOwnershipStep,
  verifyOwnershipStepCompleteness,
  validateInterimStep,
  verifyInterimStepCompleteness,
  validateOrchardStep,
  verifyOrchardStepCompleteness,
  validateExtractionStep,
  verifyExtractionStepCompleteness,
  validateParentStep,
  verifyParentStepCompleteness,
  checkAllStepsCompletion,
  convertCollection,
  convertExtraction,
  convertInterim,
  convertOrchard,
  convertOwnership,
  convertParentTree,
  getSeedlotSubmitErrDescription
} from './utils';
import {
  MAX_EDIT_BEFORE_SAVE,
  initialProgressConfig, smartSaveText, stepMap, tscAgencyObj, tscLocationCode
} from './constants';

import './styles.scss';

const SeedlotRegistrationForm = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get('step');

  const isPageRendered = useRef(false);

  const [formStep, setFormStep] = useState<number>(
    stepParam
      ? (parseInt(stepParam, 10) - 1)
      : 0
  );
  const [
    progressStatus,
    setProgressStatus
  ] = useState<ProgressIndicatorConfig>(() => initProgressBar(formStep, initialProgressConfig));

  const [allStepCompleted, setAllStepCompleted] = useState<boolean>(false);
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState<string>(() => DateTime.now().toISO());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveDescription, setSaveDescription] = useState<string>('Save changes');
  const numOfEdit = useRef(0);

  // Initialize all step's state here
  const [allStepData, setAllStepData] = useState<AllStepData>(() => ({
    collectionStep: initCollectionState(EmptyMultiOptObj, ''),
    ownershipStep: [initOwnershipState(EmptyMultiOptObj, '')],
    interimStep: initInterimState(EmptyMultiOptObj, ''),
    orchardStep: initOrchardState(),
    parentTreeStep: initParentTreeState(),
    extractionStorageStep: initExtractionStorageState(tscAgencyObj, tscLocationCode)
  }));

  const fundingSourcesQuery = useQuery({
    queryKey: ['funding-sources'],
    queryFn: getFundingSources
  });

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod
  });

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        navigate(PathConstants.FOUR_OH_FOUR);
      }
    },
    enabled: vegCodeQuery.isFetched,
    refetchOnWindowFocus: false
  });

  const setDefaultAgencyAndCode = (agency: MultiOptionsObj, locationCode: string) => {
    setAllStepData((prevData) => ({
      ...prevData,
      collectionStep: {
        ...prevData.collectionStep,
        collectorAgency: {
          ...prevData.collectionStep.collectorAgency,
          value: agency
        },
        locationCode: {
          ...prevData.collectionStep.locationCode,
          value: locationCode
        }
      },
      ownershipStep: prevData.ownershipStep.map((singleOwner) => ({
        ...singleOwner,
        ownerAgency: {
          ...singleOwner.ownerAgency,
          value: agency
        },
        ownerCode: {
          ...singleOwner.ownerCode,
          value: locationCode
        }
      })),
      interimStep: {
        ...prevData.interimStep,
        agencyName: {
          ...prevData.interimStep.agencyName,
          value: agency
        },
        locationCode: {
          ...prevData.interimStep.locationCode,
          value: locationCode
        }
      }
    }));
    numOfEdit.current += 1;
  };

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', seedlotQuery.data?.applicantClientNumber],
    queryFn: () => getForestClientByNumber(seedlotQuery.data?.applicantClientNumber),
    enabled: seedlotQuery.isFetched,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const getDefaultAgencyObj = (): MultiOptionsObj => ({
    code: forestClientQuery.data?.clientNumber ?? '',
    description: forestClientQuery.data?.clientName ?? '',
    label: `${forestClientQuery.data?.clientNumber} - ${forestClientQuery.data?.clientName} - ${forestClientQuery.data?.acronym}`
  });

  const getDefaultLocationCode = (): string => (seedlotQuery.data?.applicantLocationCode ?? '');

  useEffect(() => {
    if (forestClientQuery.isFetched) {
      setDefaultAgencyAndCode(getDefaultAgencyObj(), getDefaultLocationCode());
    }
  }, [forestClientQuery.isFetched]);

  const gameticMethodologyQuery = useQuery({
    queryKey: ['gametic-methodologies'],
    queryFn: getGameticMethodology
  });

  const applicantAgencyQuery = useQuery({
    queryKey: ['applicant-agencies'],
    queryFn: () => getApplicantAgenciesOptions()
  });

  const setStepData = (stepName: keyof AllStepData, stepData: any) => {
    const newData = { ...allStepData };
    // This check guarantee that every change on the collectors
    // agency also changes the values on the interim agency, when
    // necessary, also reflecting the invalid values
    if (stepName === 'collectionStep'
      && allStepData.interimStep.useCollectorAgencyInfo.value
      && (allStepData.collectionStep.collectorAgency.value.code !== stepData.collectorAgency.value.code
        || allStepData.collectionStep.locationCode.value !== stepData.locationCode.value)) {
      newData.interimStep.agencyName.value = stepData.collectorAgency.value;
      newData.interimStep.agencyName.isInvalid = stepData.collectorAgency.value.code.length
        ? stepData.collectorAgency.isInvalid
        : true;
      newData.interimStep.locationCode.value = stepData.locationCode.value;
      newData.interimStep.locationCode.isInvalid = stepData.locationCode.value.length
        ? stepData.locationCode.isInvalid
        : true;
    }
    newData[stepName] = stepData;
    setAllStepData(newData);
    numOfEdit.current += 1;
  };

  const methodsOfPaymentQuery = useQuery({
    queryKey: ['methods-of-payment'],
    queryFn: getMethodsOfPayment,
    onSuccess: (dataArr: MultiOptionsObj[]) => {
      const defaultMethodArr = dataArr.filter((data: MultiOptionsObj) => data.isDefault);
      const defaultMethod = defaultMethodArr.length === 0 ? EmptyMultiOptObj : defaultMethodArr[0];
      if (!allStepData.ownershipStep[0].methodOfPayment.value.code) {
        const tempOwnershipData = structuredClone(allStepData.ownershipStep);
        tempOwnershipData[0].methodOfPayment.value = defaultMethod;
        setStepData('ownershipStep', tempOwnershipData);
      }
    }
  });

  const logState = () => {
    // eslint-disable-next-line no-console
    console.log(allStepData);
  };

  const updateStepStatus = (stepName: keyof ProgressIndicatorConfig): ProgressStepStatus => {
    const clonedStepStatus = structuredClone(progressStatus[stepName]);
    if (stepName === 'collection') {
      clonedStepStatus.isInvalid = validateCollectionStep(allStepData.collectionStep);
      if (!clonedStepStatus.isInvalid) {
        clonedStepStatus.isComplete = verifyCollectionStepCompleteness(allStepData.collectionStep);
      }
    }
    if (stepName === 'ownership') {
      clonedStepStatus.isInvalid = validateOwnershipStep(allStepData.ownershipStep);
      if (!clonedStepStatus.isInvalid) {
        clonedStepStatus.isComplete = verifyOwnershipStepCompleteness(allStepData.ownershipStep);
      }
    }
    if (stepName === 'interim') {
      clonedStepStatus.isInvalid = validateInterimStep(allStepData.interimStep);
      if (!clonedStepStatus.isInvalid) {
        clonedStepStatus.isComplete = verifyInterimStepCompleteness(allStepData.interimStep);
      }
    }
    if (stepName === 'orchard') {
      clonedStepStatus.isInvalid = validateOrchardStep(allStepData.orchardStep);
      if (!clonedStepStatus.isInvalid) {
        clonedStepStatus.isComplete = verifyOrchardStepCompleteness(allStepData.orchardStep);
      }
    }
    if (stepName === 'parent') {
      clonedStepStatus.isInvalid = validateParentStep(allStepData.parentTreeStep);
      if (!clonedStepStatus.isInvalid) {
        clonedStepStatus.isComplete = verifyParentStepCompleteness(allStepData.parentTreeStep);
      }
    }
    if (stepName === 'extraction') {
      clonedStepStatus.isInvalid = validateExtractionStep(allStepData.extractionStorageStep);
      if (!clonedStepStatus.isInvalid) {
        clonedStepStatus.isComplete = verifyExtractionStepCompleteness(allStepData.extractionStorageStep);
      }
    }

    return clonedStepStatus;
  };

  /**
   * Update the progress indicator status
   */
  const updateProgressStatus = (currentStepNum: number, prevStepNum: number) => {
    const clonedStatus = structuredClone(progressStatus);
    const currentStepName = stepMap[currentStepNum];
    const prevStepName = stepMap[prevStepNum];

    // Set invalid or complete status for Collection Step
    if (currentStepName !== 'collection' && prevStepName === 'collection') {
      clonedStatus.collection = updateStepStatus('collection');
    }

    // Set invalid or complete status for Ownership Step
    if (currentStepName !== 'ownership' && prevStepName === 'ownership') {
      clonedStatus.ownership = updateStepStatus('ownership');
    }

    // Set invalid or complete status for Interim Step
    if (currentStepName !== 'interim' && prevStepName === 'interim') {
      clonedStatus.interim = updateStepStatus('interim');
    }

    // Set invalid or complete status for Orchard Step
    if (currentStepName !== 'orchard' && prevStepName === 'orchard') {
      clonedStatus.orchard = updateStepStatus('orchard');
    }

    // Set invalid or complete status for Parent Tree Step
    if (currentStepName !== 'parent' && prevStepName === 'parent') {
      clonedStatus.parent = updateStepStatus('parent');
    }

    // Set invalid or complete status for Extraction and Storage Step
    if (currentStepName !== 'extraction' && prevStepName === 'extraction') {
      clonedStatus.extraction = updateStepStatus('extraction');
    }

    // Set the current step's current val to true, and everything else false
    clonedStatus[currentStepName].isCurrent = true;
    const stepNames = Object.keys(clonedStatus) as Array<keyof ProgressIndicatorConfig>;
    stepNames.filter((stepName: keyof ProgressIndicatorConfig) => stepName !== currentStepName)
      .forEach((nonCurrentStepName) => {
        clonedStatus[nonCurrentStepName].isCurrent = false;
      });

    setProgressStatus(clonedStatus);
  };

  const setStep = (delta: number) => {
    logState();
    const prevStep = formStep;
    const newStep = prevStep + delta;
    updateProgressStatus(newStep, prevStep);
    window.history.replaceState(null, '', `?step=${newStep + 1}`);
    setFormStep(newStep);
  };

  const cleanParentTables = () => {
    const clonedState = { ...allStepData };
    clonedState.parentTreeStep.tableRowData = {};
    clonedState.parentTreeStep.mixTabData = generateDefaultRows(DEFAULT_MIX_PAGE_ROWS);
    setAllStepData(clonedState);
    setProgressStatus((prev) => ({
      ...prev,
      parent: {
        ...prev.parent,
        isComplete: false,
        isInvalid: false
      }
    }));
    numOfEdit.current += 1;
  };

  const getSeedlotPayload = (): SeedlotAClassSubmitType => ({
    seedlotFormCollectionDto: convertCollection(allStepData.collectionStep),
    seedlotFormOwnershipDtoList: convertOwnership(allStepData.ownershipStep),
    seedlotFormInterimDto: convertInterim(allStepData.interimStep),
    seedlotFormOrchardDto: convertOrchard(
      allStepData.orchardStep,
      allStepData.parentTreeStep.tableRowData
    ),
    seedlotFormParentTreeSmpDtoList: convertParentTree(allStepData.parentTreeStep, (seedlotNumber ?? '')),
    seedlotFormExtractionDto: convertExtraction(allStepData.extractionStorageStep)
  });

  const submitSeedlot = useMutation({
    mutationFn: (payload: SeedlotAClassSubmitType) => putAClassSeedlot(seedlotNumber ?? '', payload),
    onSuccess: () => {
      navigate({
        pathname: addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? ''),
        search: '?isSubmitSuccess=true'
      });
    },
    retry: 0
  });

  useEffect(() => {
    const completionStatus = checkAllStepsCompletion(progressStatus, verifyExtractionStepCompleteness(allStepData.extractionStorageStep));
    setAllStepCompleted(completionStatus);
  }, [progressStatus, allStepData.extractionStorageStep, formStep]);

  const updateAllStepStatus = (): ProgressIndicatorConfig => {
    const clonedStatus = structuredClone(progressStatus);
    const stepNames = Object.keys(clonedStatus) as (keyof ProgressIndicatorConfig)[];
    stepNames.forEach((stepName) => {
      clonedStatus[stepName] = updateStepStatus(stepName);
    });
    setProgressStatus(clonedStatus);
    return clonedStatus;
  };

  const saveProgress = useMutation({
    mutationFn: () => putAClassSeedlotProgress(
      seedlotNumber ?? '',
      {
        allStepData,
        progressStatus: updateAllStepStatus()
      }
    ),
    onSuccess: () => {
      numOfEdit.current = 0;
      setLastSaveTimestamp(DateTime.now().toISO());
      setSaveStatus('finished');
      setSaveDescription(smartSaveText.success);
    },
    onError: () => {
      setSaveStatus('error');
      setSaveDescription(smartSaveText.error);
    },
    onSettled: () => {
      setTimeout(() => {
        setSaveStatus(null);
        setSaveDescription(smartSaveText.idle);
      }, FIVE_SECONDS);
    },
    retry: 0
  });

  const handleSaveBtn = () => {
    setSaveStatus('active');
    setSaveDescription(smartSaveText.loading);
    if (!saveProgress.isLoading) {
      saveProgress.mutate();
    }
  };

  const location = useLocation();

  /**
   * For save progress on page leave.
   */
  useEffect(() => () => {
    // Prevent save on first render.
    if (isPageRendered.current) {
      saveProgress.mutate();
    }
    isPageRendered.current = true;
  }, [location]);

  /**
   * For auto save on interval.
   */
  useEffect(() => {
    if (numOfEdit.current >= MAX_EDIT_BEFORE_SAVE) {
      if (!saveProgress.isLoading) {
        saveProgress.mutate();
      }
    }

    const interval = setInterval(() => {
      if (numOfEdit.current > 0 && !saveProgress.isLoading) {
        saveProgress.mutate();
      }
    }, TEN_SECONDS);

    return () => clearInterval(interval);
  }, [numOfEdit.current]);

  const renderStep = () => {
    const defaultAgencyObj = getDefaultAgencyObj();
    const defaultCode = getDefaultLocationCode();

    const agencyOptions = applicantAgencyQuery.data ?? [];

    const seedlotSpecies = getSpeciesOptionByCode(
      seedlotQuery.data?.vegetationCode,
      vegCodeQuery.data
    );

    switch (formStep) {
      // Collection
      case 0:
        return (
          <CollectionStep
            state={allStepData.collectionStep}
            setStepData={(data: CollectionForm) => setStepData('collectionStep', data)}
            defaultAgency={defaultAgencyObj}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
            collectionMethods={getCheckboxOptions(coneCollectionMethodsQuery.data)}
          />
        );
      // Ownership
      case 1:
        return (
          <OwnershipStep
            state={allStepData.ownershipStep}
            defaultAgency={defaultAgencyObj}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
            fundingSources={getMultiOptList(fundingSourcesQuery.data)}
            methodsOfPayment={methodsOfPaymentQuery.data ?? []}
            setStepData={(data: Array<SingleOwnerForm>) => setStepData('ownershipStep', data)}
          />
        );
      // Interim Storage
      case 2:
        return (
          <InterimStorage
            state={allStepData.interimStep}
            collectorAgency={allStepData.collectionStep.collectorAgency}
            collectorCode={allStepData.collectionStep.locationCode}
            agencyOptions={agencyOptions}
            setStepData={(data: InterimForm) => setStepData('interimStep', data)}
          />
        );
      // Orchard
      case 3:
        return (
          <OrchardStep
            gameticOptions={getMultiOptList(gameticMethodologyQuery.data, true, false, true, ['isFemaleMethodology', 'isPliSpecies'])}
            seedlotSpecies={seedlotSpecies}
            state={allStepData.orchardStep}
            cleanParentTables={() => cleanParentTables()}
            setStepData={(data: OrchardForm) => setStepData('orchardStep', data)}
            tableRowData={allStepData.parentTreeStep.tableRowData}
          />
        );
      // Parent Tree and SMP
      case 4:
        return (
          <ParentTreeStep
            seedlotSpecies={seedlotSpecies}
            state={allStepData.parentTreeStep}
            orchards={allStepData.orchardStep.orchards}
            setStep={setStep}
            setStepData={(data: any) => setStepData('parentTreeStep', data)}
          />
        );
      // Extraction and Storage
      case 5:
        return (
          <ExtractionAndStorage
            state={allStepData.extractionStorageStep}
            defaultAgency={tscAgencyObj}
            defaultCode={tscLocationCode}
            agencyOptions={agencyOptions}
            setStepData={(data: ExtractionStorageForm) => setStepData('extractionStorageStep', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="seedlot-registration-page">
      <FlexGrid fullWidth>
        <Row>
          <Column className="seedlot-registration-breadcrumb">
            <Breadcrumb>
              <BreadcrumbItem onClick={() => navigate(PathConstants.SEEDLOTS)}>Seedlots</BreadcrumbItem>
              <BreadcrumbItem onClick={() => navigate(PathConstants.MY_SEEDLOTS)}>My seedlots</BreadcrumbItem>
              <BreadcrumbItem onClick={() => navigate(addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? ''))}>{`Seedlot ${seedlotNumber}`}</BreadcrumbItem>
            </Breadcrumb>
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-title">
            <PageTitle
              title="Seedlot Registration"
              subtitle={(
                <div className="seedlot-form-subtitle">
                  <span>
                    {`Seedlot ${seedlotNumber}`}
                    &nbsp;
                    -
                    &nbsp;
                  </span>
                  <SaveTooltipLabel
                    handleSaveBtn={handleSaveBtn}
                    saveStatus={saveStatus}
                    saveDescription={saveDescription}
                    mutationStatus={saveProgress.status}
                    lastSaveTimestamp={lastSaveTimestamp}
                  />
                </div>
              )}
            />
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-progress">
            <SeedlotRegistrationProgress
              progressStatus={progressStatus}
              className="seedlot-registration-steps"
              interactFunction={(e: number) => {
                updateProgressStatus(e, formStep);
                setStep((e - formStep));
              }}
            />
          </Column>
        </Row>
        {
          submitSeedlot.isError
            ? (
              <Row>
                <Column>
                  <InlineNotification
                    lowContrast
                    kind="error"
                    title={getSeedlotSubmitErrDescription((submitSeedlot.error as AxiosError)).title}
                    subtitle={getSeedlotSubmitErrDescription((submitSeedlot.error as AxiosError)).description}
                  />
                </Column>
              </Row>
            )
            : null
        }
        {
          saveProgress.isError
            ? (
              <Row>
                <Column>
                  <ActionableNotification
                    className="save-error-actionable-notification"
                    lowContrast
                    kind="error"
                    title={`${smartSaveText.error}:\u00A0`}
                    subtitle={smartSaveText.suggestion}
                    actionButtonLabel={smartSaveText.idle}
                    onActionButtonClick={() => handleSaveBtn()}
                  />
                </Column>
              </Row>
            )
            : null
        }
        <Row>
          <Column className="seedlot-registration-row">
            {
              (
                vegCodeQuery.isFetched
                && seedlotQuery.isFetched
                && forestClientQuery.isFetched
                && fundingSourcesQuery.isFetched
                && methodsOfPaymentQuery.isFetched
                && gameticMethodologyQuery.isFetched
                && coneCollectionMethodsQuery.isFetched
                && applicantAgencyQuery.isFetched
                && !submitSeedlot.isLoading
              )
                ? renderStep()
                : <Loading />
            }
          </Column>
        </Row>
        <Row className="seedlot-registration-button-row">
          <Grid narrow>
            <Column sm={4} md={3} lg={3} xlg={4}>
              {
                formStep !== 0
                  ? (
                    <Button
                      kind="secondary"
                      size="lg"
                      className="form-action-btn"
                      onClick={() => setStep(-1)}
                    >
                      Back
                    </Button>
                  )
                  : (
                    <Button
                      kind="secondary"
                      size="lg"
                      className="form-action-btn"
                      onClick={() => navigate(addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? ''))}
                    >
                      Cancel
                    </Button>
                  )

              }
            </Column>
            <Column sm={4} md={3} lg={3} xlg={4}>
              <Button
                kind="secondary"
                size="lg"
                className="form-action-btn"
                onClick={() => handleSaveBtn()}
                disabled={saveProgress.isLoading}
              >
                <InlineLoading status={saveStatus} description={saveDescription} />
              </Button>
            </Column>
            <Column sm={4} md={3} lg={3} xlg={4}>
              {
                formStep !== 5
                  ? (
                    <Button
                      kind="primary"
                      size="lg"
                      className="form-action-btn"
                      onClick={() => setStep(1)}
                      renderIcon={ArrowRight}
                    >
                      Next
                    </Button>
                  )
                  : (
                    <SubmitModal
                      btnText="Submit Registration"
                      renderIconName="CheckmarkOutline"
                      disableBtn={!allStepCompleted}
                      submitFn={() => {
                        submitSeedlot.mutate(getSeedlotPayload());
                      }}
                    />
                  )
              }
            </Column>
          </Grid>
        </Row>
      </FlexGrid>
    </div>
  );
};

export default SeedlotRegistrationForm;
