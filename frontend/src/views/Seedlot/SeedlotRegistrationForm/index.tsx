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
import getPaymentMethods from '../../../api-service/paymentMethodsAPI';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';
import { getSeedlotInfo } from '../../../api-service/seedlotAPI';
import getMaleFemaleMethodology from '../../../api-service/maleFemaleMethodologyAPI';
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
  initParentTreeState
} from './utils';
import { getMultiOptList, getCheckboxOptions } from '../../../utils/MultiOptionsUtils';
import ExtractionStorage from '../../../types/SeedlotTypes/ExtractionStorage';

import './styles.scss';

const agencyOptions = [
  '0032 - Strong Seeds Orchard - SSO',
  '0035 - Weak Seeds Orchard - WSO',
  '0038 - Okay Seeds Orchard - OSO',
  '0041 - Great Seeds Orchard - GSO',
  '0043 - Bad Seeds Orchard - BSO'
];
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

  const paymentMethodsQuery = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods
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

  const maleFemaleMethodologyQuery = useQuery({
    queryKey: ['male-female-methodology'],
    queryFn: getMaleFemaleMethodology
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    setAllStepData(clonedState);
  };

  const renderStep = () => {
    const defaultAgency = seedlotInfoQuery.data.seedlotApplicantInfo.applicant.name;
    const defaultCode = seedlotInfoQuery.data.seedlotApplicantInfo.applicant.number;

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
            defaultAgency={defaultAgency}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
            collectionMethods={getCheckboxOptions(coneCollectionMethodsQuery.data)}
            // invalidateObj={allInvalidationObj.collectionStep}
            setStepData={(data: CollectionForm) => setStepData('collectionStep', data)}
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
            paymentMethods={getMultiOptList(paymentMethodsQuery.data)}
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
            gameticOptions={getMultiOptList(maleFemaleMethodologyQuery.data, true, false, true, ['isPliSpecies'])}
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
            seedlotNumber={seedlotNumber}
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
              <BreadcrumbItem onClick={() => navigate('/seedlot')}>Seedlots</BreadcrumbItem>
              <BreadcrumbItem onClick={() => navigate('/seedlot/my-seedlots')}>My seedlots</BreadcrumbItem>
              <BreadcrumbItem onClick={() => navigate(`/seedlot/details/${seedlotNumber}`)}>{`Seedlot ${seedlotNumber}`}</BreadcrumbItem>
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
                && paymentMethodsQuery.isSuccess
                && maleFemaleMethodologyQuery.isSuccess
                && coneCollectionMethodsQuery.isSuccess
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
                      onClick={() => navigate(`/seedlot/details/${seedlotNumber}`)}
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
