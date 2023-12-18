/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Loading,
  Grid
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { AxiosError } from 'axios';

import getFundingSources from '../../../api-service/fundingSorucesAPI';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';
import getGameticMethodology from '../../../api-service/gameticMethodologyAPI';
import { getSeedlotById } from '../../../api-service/seedlotAPI';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import { getForestClientByNumber } from '../../../api-service/forestClientsAPI';
import getApplicantAgenciesOptions from '../../../api-service/applicantAgenciesAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';

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

import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';

import { AllStepData, ProgressIndicatorConfig } from './definitions';
import {
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
  verifyParentStepCompleteness
} from './utils';
import {
  initialProgressConfig, stepMap, tscAgencyObj, tscLocationCode
} from './constants';

import './styles.scss';
import { generateDefaultRows } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import { DEFAULT_MIX_PAGE_ROWS } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';

const SeedlotRegistrationForm = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  const [formStep, setFormStep] = useState<number>(0);
  const [
    progressStatus,
    setProgressStatus
  ] = useState<ProgressIndicatorConfig>(initialProgressConfig);

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
        navigate('/404');
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

  /**
   * Update the progress indicator status
   */
  const updateProgressStatus = (currentStepNum: number, prevStepNum: number) => {
    const clonedStatus = structuredClone(progressStatus);
    const currentStepName = stepMap[currentStepNum];
    const prevStepName = stepMap[prevStepNum];

    // Set the current step's current val to true, and everything else false
    clonedStatus[currentStepName].isCurrent = true;
    const stepNames = Object.keys(clonedStatus) as Array<keyof ProgressIndicatorConfig>;
    stepNames.filter((stepName: keyof ProgressIndicatorConfig) => stepName !== currentStepName)
      .forEach((nonCurrentStepName) => {
        clonedStatus[nonCurrentStepName].isCurrent = false;
      });

    // Set invalid or complete status for Collection Step
    if (currentStepName !== 'collection' && prevStepName === 'collection') {
      const isCollectionInvalid = validateCollectionStep(allStepData.collectionStep);
      clonedStatus.collection.isInvalid = isCollectionInvalid;
      if (!isCollectionInvalid) {
        const isCollectionComplete = verifyCollectionStepCompleteness(allStepData.collectionStep);
        clonedStatus.collection.isComplete = isCollectionComplete;
      }
    }

    // Set invalid or complete status for Ownership Step
    if (currentStepName !== 'ownership' && prevStepName === 'ownership') {
      const isOwnershipInvalid = validateOwnershipStep(allStepData.ownershipStep);
      clonedStatus.ownership.isInvalid = isOwnershipInvalid;
      if (!isOwnershipInvalid) {
        const isOwnershipComplete = verifyOwnershipStepCompleteness(allStepData.ownershipStep);
        clonedStatus.ownership.isComplete = isOwnershipComplete;
      }
    }

    // Set invalid or complete status for Interim Step
    if (currentStepName !== 'interim' && prevStepName === 'interim') {
      const isInterimInvalid = validateInterimStep(allStepData.interimStep);
      clonedStatus.interim.isInvalid = isInterimInvalid;
      if (!isInterimInvalid) {
        const isInterimComplete = verifyInterimStepCompleteness(allStepData.interimStep);
        clonedStatus.interim.isComplete = isInterimComplete;
      }
    }

    // Set invalid or complete status for Orchard Step
    if (currentStepName !== 'orchard' && prevStepName === 'orchard') {
      const isOrchardInvalid = validateOrchardStep(allStepData.orchardStep);
      clonedStatus.orchard.isInvalid = isOrchardInvalid;
      if (!isOrchardInvalid) {
        const isOrchardComplete = verifyOrchardStepCompleteness(allStepData.orchardStep);
        clonedStatus.orchard.isComplete = isOrchardComplete;
      }
    }

    // Set invalid or complete status for Extraction and Storage Step
    if (currentStepName !== 'extraction' && prevStepName === 'extraction') {
      const isExtractionInvalid = validateExtractionStep(allStepData.extractionStorageStep);
      clonedStatus.extraction.isInvalid = isExtractionInvalid;
      if (!isExtractionInvalid) {
        const isExtractionComplete = verifyExtractionStepCompleteness(allStepData.extractionStorageStep);
        clonedStatus.extraction.isComplete = isExtractionComplete;
      }
    }

    // Set invalid or complete status for Parent Tree Step
    if (currentStepName !== 'parent' && prevStepName === 'parent') {
      const isParentInvalid = validateParentStep(allStepData.parentTreeStep);
      clonedStatus.parent.isInvalid = isParentInvalid;
      if (!isParentInvalid) {
        const isParentComplete = verifyParentStepCompleteness(allStepData.parentTreeStep);
        clonedStatus.parent.isComplete = isParentComplete;
      }
    }

    setProgressStatus(clonedStatus);
  };

  const setStep = (delta: number) => {
    logState();
    const prevStep = formStep;
    const newStep = prevStep + delta;
    updateProgressStatus(newStep, prevStep);
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
  };

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
          <Column className="seedlot-registration-breadcrumb" sm={4} md={8} lg={16} xlg={16}>
            <Breadcrumb>
              <BreadcrumbItem onClick={() => navigate('/seedlots')}>Seedlots</BreadcrumbItem>
              <BreadcrumbItem onClick={() => navigate('/seedlots/my-seedlots')}>My seedlots</BreadcrumbItem>
              <BreadcrumbItem onClick={() => navigate(`/seedlots/details/${seedlotNumber}`)}>{`Seedlot ${seedlotNumber}`}</BreadcrumbItem>
            </Breadcrumb>
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-title" sm={4} md={8} lg={16} xlg={16}>
            <PageTitle
              title="Seedlot Registration"
              subtitle={`Seedlot ${seedlotNumber}`}
            />
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-progress" sm={4} md={8} lg={16} xlg={16}>
            <SeedlotRegistrationProgress
              progressStatus={progressStatus}
              className="seedlot-registration-steps"
              interactFunction={(e: number) => {
                updateProgressStatus(e, formStep);
                setFormStep(e);
              }}
            />
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-row" sm={4} md={8} lg={16} xlg={16}>
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
                      className="back-next-btn"
                      onClick={() => setStep(-1)}
                    >
                      Back
                    </Button>
                  )
                  : (
                    <Button
                      kind="secondary"
                      size="lg"
                      className="back-next-btn"
                      onClick={() => navigate(`/seedlots/details/${seedlotNumber}`)}
                    >
                      Cancel
                    </Button>
                  )

              }
            </Column>
            <Column sm={4} md={3} lg={3} xlg={4}>
              {
                formStep !== 5
                  ? (
                    <Button
                      kind="primary"
                      size="lg"
                      className="back-next-btn"
                      onClick={() => setStep(1)}
                      renderIcon={ArrowRight}
                    >
                      Next
                    </Button>
                  )
                  : (
                    <SubmitModal btnText="Submit Registration" renderIconName="CheckmarkOutline" />
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
