import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Loading
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';

import getFundingSources from '../../../api-service/fundingSorucesAPI';
import getPaymentMethods from '../../../api-service/paymentMethodsAPI';
import getSeedlotInfo from '../../../api-service/seedlotAPI';
import PageTitle from '../../../components/PageTitle';
import SeedlotRegistrationProgress from '../../../components/SeedlotRegistrationProgress';
import OrchardStep from '../../../components/SeedlotRegistrationSteps/OrchardStep';
import InterimStorage from '../../../components/SeedlotRegistrationSteps/InterimStep';
import OwnershipStep from '../../../components/SeedlotRegistrationSteps/OwnershipStep';
import CollectionStep from '../../../components/SeedlotRegistrationSteps/CollectionStep';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import ExtractionAndStorage from '../../../components/SeedlotRegistrationSteps/ExtractionAndStorageStep';
import { SeedlotOrchard } from '../../../types/SeedlotTypes/SeedlotOrchard';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import { AllStepData, AllStepInvalidationObj, FormInvalidationObj } from './definitions';
import {
  initCollectionState,
  initInterimState,
  initOrchardState,
  initOwnershipState,
  initExtractionStorageState,
  initInvalidationObj,
  initOwnerShipInvalidState
} from './utils';
import { getDropDownList } from '../../../utils/DropDownUtils';
import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/utils';
import ParentTreeStep from '../../../components/SeedlotRegistrationSteps/ParentTreeStep';
import ExtractionStorage from '../../../types/SeedlotTypes/ExtractionStorage';
import SubmitModal from '../../../components/SeedlotRegistrationSteps/SubmitModal';
import './styles.scss';

const defaultCode = '16';
const defaultAgency = '0032 - Strong Seeds Orchard - SSO';
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

  const fundingSourcesQuery = useQuery({
    queryKey: ['funding-sources'],
    queryFn: getFundingSources
  });

  const paymentMethodsQuery = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods
  });

  const seedlotInfoQuery = useQuery({
    queryKey: ['seedlot', seedlotNumber],
    queryFn: () => getSeedlotInfo(seedlotNumber)
  });

  // Initialize all step's state here
  const [allStepData, setAllStepData] = useState<AllStepData>({
    collectionStep: initCollectionState(defaultAgency, defaultCode),
    interimStep: initInterimState(defaultAgency, defaultCode),
    ownershipStep: [initOwnershipState(defaultAgency, defaultCode)],
    orchardStep: initOrchardState(),
    parentTreeStep: {},
    extractionStorageStep: initExtractionStorageState(defaultExtStorAgency, defaultExtStorCode)
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

  const renderStep = () => {
    switch (formStep) {
      // Collection
      case 0:
        return (
          <CollectionStep
            state={allStepData.collectionStep}
            defaultAgency={defaultAgency}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
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
            fundingSources={getDropDownList(fundingSourcesQuery.data)}
            paymentMethods={getDropDownList(paymentMethodsQuery.data)}
            setStepData={(data: Array<SingleOwnerForm>) => setStepData('ownershipStep', data)}
            setInvalidState={(obj: Array<FormInvalidationObj>) => setInvalidState('ownershipStep', obj)}
          />
        );
      // Interim Storage
      case 2:
        return (
          <InterimStorage
            state={allStepData.interimStep}
            defaultAgency={defaultAgency}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
            setStepData={(data: InterimForm) => setStepData('interimStep', data)}
          />
        );
      // Orchard
      case 3:
        return (
          <OrchardStep
            seedlotSpecies={seedlotInfoQuery.data.seedlot.lot_species}
            state={allStepData.orchardStep}
            setStepData={(data: SeedlotOrchard) => setStepData('orchardStep', data)}
          />
        );
      // Parent Tree and SMP
      case 4:
        return (
          <ParentTreeStep
            seedlotSpecies={seedlotInfoQuery.data.seedlot.lot_species}
            state={allStepData.parentTreeStep}
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
    <FlexGrid className="seedlot-registration-page">
      <div className="seedlot-registration-title-section">
        <Row className="seedlot-registration-breadcrumb">
          <Breadcrumb>
            <BreadcrumbItem onClick={() => navigate('/seedlot')}>Seedlots</BreadcrumbItem>
            <BreadcrumbItem onClick={() => navigate('/seedlot/my-seedlots')}>My seedlots</BreadcrumbItem>
            <BreadcrumbItem onClick={() => navigate(`/seedlot/details/${seedlotNumber}`)}>{`Seedlot ${seedlotNumber}`}</BreadcrumbItem>
          </Breadcrumb>
        </Row>
        <Row>
          <PageTitle
            title="Seedlot Registration"
            subtitle={`Seedlot ${seedlotNumber}`}
          />
        </Row>
        <Row className="seedlot-registration-progress">
          <SeedlotRegistrationProgress
            currentIndex={formStep}
            className="seedlot-registration-steps"
            interactFunction={(e: number) => {
              setFormStep(e);
            }}
          />
        </Row>
        <Row className="seedlot-registration-row">
          <div className="seedlot-current-form">
            {
              (
                seedlotInfoQuery.isSuccess
                && fundingSourcesQuery.isSuccess
                && paymentMethodsQuery.isSuccess
              )
                ? renderStep()
                : <Loading />
            }
          </div>
        </Row>
        <div className="btns-container">
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
                <SubmitModal />
              )
          }
        </div>
      </div>
    </FlexGrid>
  );
};

export default SeedlotRegistrationForm;
