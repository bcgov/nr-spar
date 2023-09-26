import React, { useState } from 'react';
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

import getFundingSources from '../../../api-service/fundingSorucesAPI';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';
import { getSeedlotInfo } from '../../../api-service/seedlotAPI';
import getGameticMethodology from '../../../api-service/gameticMethodologyAPI';
import getApplicantAgenciesOptions from '../../../api-service/applicantAgenciesAPI';

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
import { AllStepData, AllStepInvalidationObj, FormInvalidationObj } from './definitions';
import {
  initCollectionState,
  initInterimState,
  initOrchardState,
  initOwnershipState,
  initExtractionStorageState,
  initInvalidationObj,
  initOwnerShipInvalidState,
  initParentTreeState,
  generateDefaultRows
} from './utils';
import { getMultiOptList, getCheckboxOptions } from '../../../utils/MultiOptionsUtils';
import ExtractionStorage from '../../../types/SeedlotTypes/ExtractionStorage';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

import './styles.scss';

const defaultExtStorCode = '00';
const defaultExtStorAgency = '12797 - Tree Seed Centre - MOF';

const SeedlotRegistrationForm = () => {
  const navigate = useNavigate();
  const seedlotNumber = useParams().seedlot ?? '';

  const [formStep, setFormStep] = useState<number>(0);

  // Initialize all step's state here
  const [allStepData, setAllStepData] = useState<AllStepData>({
    collectionStep: initCollectionState('', ''),
    interimStep: initInterimState('', ''),
    ownershipStep: [initOwnershipState('', '')],
    orchardStep: initOrchardState(),
    parentTreeStep: initParentTreeState(),
    extractionStorageStep: initExtractionStorageState(defaultExtStorAgency, defaultExtStorCode)
  });

  const fundingSourcesQuery = useQuery({
    queryKey: ['funding-sources'],
    queryFn: getFundingSources
  });

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod
  });

  const seedlotInfoQuery = useQuery({
    queryKey: ['seedlot', seedlotNumber],
    queryFn: () => getSeedlotInfo(seedlotNumber),
    refetchOnWindowFocus: false
  });

  const gameticMethodologyQuery = useQuery({
    queryKey: ['gametic-methodologies'],
    queryFn: getGameticMethodology
  });

  const applicantAgencyQuery = useQuery({
    queryKey: ['applicant-agencies'],
    queryFn: () => getApplicantAgenciesOptions()
  });

  const [allInvalidationObj, setAllInvalidationObj] = useState<AllStepInvalidationObj>({
    collectionStep: initInvalidationObj(),
    interimStep: initInvalidationObj(),
    ownershipStep: initOwnerShipInvalidState(),
    orchardStep: initInvalidationObj(),
    extractionStorageStep: initInvalidationObj()
  });

  // Can't find a good way to specify the type of stepData
  const setStepData = (stepName: keyof AllStepData, stepData: any) => {
    const newData = { ...allStepData };
    newData[stepName] = stepData;
    setAllStepData(newData);
  };

  const methodsOfPaymentQuery = useQuery({
    queryKey: ['methods-of-payment'],
    queryFn: getMethodsOfPayment,
    onSuccess: (dataArr: MultiOptionsObj[]) => {
      const defaultMethodArr = dataArr.filter((data: MultiOptionsObj) => data.isDefault);
      const defaultMethod = defaultMethodArr.length === 0 ? null : defaultMethodArr[0];
      if (!allStepData.ownershipStep[0].methodOfPayment) {
        const tempOwnershipData = structuredClone(allStepData.ownershipStep);
        tempOwnershipData[0].methodOfPayment = defaultMethod;
        setStepData('ownershipStep', tempOwnershipData);
      }
    }
  });

  const setInvalidState = (stepName: keyof AllStepInvalidationObj, stepInvalidData: any) => {
    const newObj = { ...allInvalidationObj };
    newObj[stepName] = stepInvalidData;
    setAllInvalidationObj(newObj);
  };

  const logState = () => {
    // eslint-disable-next-line no-console
    console.log(allStepData);
  };

  const setStep = (delta: number) => {
    logState();
    const newStep = formStep + delta;
    setFormStep(newStep);
  };

  const cleanParentTables = () => {
    const clonedState = { ...allStepData };
    clonedState.parentTreeStep.tableRowData = {};
    clonedState.parentTreeStep.mixTabData = generateDefaultRows();
    setAllStepData(clonedState);
  };

  const renderStep = () => {
    const defaultAgency = seedlotInfoQuery.data.seedlotApplicantInfo.applicant.name;
    const defaultCode = seedlotInfoQuery.data.seedlotApplicantInfo.applicant.number;
    const agencyOptions = applicantAgencyQuery.data ? applicantAgencyQuery.data : [];

    const seedlotSpecies = seedlotInfoQuery.data.seedlot?.lot_species ?? {
      code: '',
      label: '',
      Description: ''
    };
    switch (formStep) {
      // Collection
      case 0:
        return (
          <CollectionStep
            state={allStepData.collectionStep}
            setStepData={(data: CollectionForm) => setStepData('collectionStep', data)}
            defaultAgency={defaultAgency}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
            collectionMethods={getCheckboxOptions(coneCollectionMethodsQuery.data)}
            // invalidateObj={allInvalidationObj.collectionStep}
          />
        );
      // Ownership
      case 1:
        return (
          <OwnershipStep
            state={allStepData.ownershipStep}
            invalidState={allInvalidationObj.ownershipStep}
            defaultAgency={defaultAgency}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
            fundingSources={getMultiOptList(fundingSourcesQuery.data)}
            methodsOfPayment={methodsOfPaymentQuery.data ?? []}
            setStepData={(data: Array<SingleOwnerForm>) => setStepData('ownershipStep', data)}
            setInvalidState={(obj: Array<FormInvalidationObj>) => setInvalidState('ownershipStep', obj)}
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
            defaultAgency={defaultExtStorAgency}
            defaultCode={defaultExtStorCode}
            agencyOptions={agencyOptions}
            setStepData={(data: ExtractionStorage) => setStepData('extractionStorageStep', data)}
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
              currentIndex={formStep}
              className="seedlot-registration-steps"
              interactFunction={(e: number) => {
                setFormStep(e);
              }}
            />
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-row" sm={4} md={8} lg={16} xlg={16}>
            {
              (
                seedlotInfoQuery.isSuccess
                && fundingSourcesQuery.isSuccess
                && methodsOfPaymentQuery.isSuccess
                && gameticMethodologyQuery.isSuccess
                && coneCollectionMethodsQuery.isSuccess
                && applicantAgencyQuery.isSuccess
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
