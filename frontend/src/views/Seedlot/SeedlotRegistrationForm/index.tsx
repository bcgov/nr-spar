import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FlexGrid,
  Row,
  Breadcrumb,
  BreadcrumbItem,
  Button
} from '@carbon/react';
import { ArrowRight, CheckmarkOutline } from '@carbon/icons-react';

import PageTitle from '../../../components/PageTitle';
import SeedlotRegistrationProgress from '../../../components/SeedlotRegistrationProgress';
import OrchardStep from '../../../components/SeedlotRegistrationSteps/OrchardStep';
import InterimStorage from '../../../components/SeedlotRegistrationSteps/InterimStep';
import OwnershipStep from '../../../components/SeedlotRegistrationSteps/OwnershipStep';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { SeedlotOrchard } from '../../../types/SeedlotTypes/SeedlotOrchard';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import { AllStepData } from './definitions';
import {
  initInterimState,
  initOrchardState,
  initOwnershipState
} from './utils';
import './styles.scss';

const defaultCode = '16';
const defaultAgency = '0032 - Strong Seeds Orchard - SSO';
const defaultPayment = 'ITC - Invoice to client address';
const agencyOptions = [
  '0032 - Strong Seeds Orchard - SSO',
  '0035 - Weak Seeds Orchard - WSO',
  '0038 - Okay Seeds Orchard - OSO',
  '0041 - Great Seeds Orchard - GSO',
  '0043 - Bad Seeds Orchard - BSO'
];

const SeedlotRegistrationForm = () => {
  const navigate = useNavigate();
  const seedlotNumber = useParams().seedlot;

  const [formStep, setFormStep] = useState<number>(0);

  // Initialize all step's state here
  const [allStepData, setAllStepData] = useState<AllStepData>({
    interimStep: initInterimState(defaultAgency, defaultCode),
    ownershipStep: [initOwnershipState(defaultAgency, defaultCode, defaultPayment)],
    orchardStep: initOrchardState()
  });

  // Can't find a good way to specify the type of stepData
  const setStepData = (stepName: keyof AllStepData, stepData: any) => {
    const newData = { ...allStepData };
    newData[stepName] = stepData;
    setAllStepData(newData);
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
        return null;
      // Ownership
      case 1:
        return (
          <OwnershipStep
            state={allStepData.ownershipStep}
            defaultAgency={defaultAgency}
            defaultCode={defaultCode}
            agencyOptions={agencyOptions}
            setStepData={(data: Array<SingleOwnerForm>) => setStepData('ownershipStep', data)}
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
            state={allStepData.orchardStep}
            setStepData={(data: SeedlotOrchard) => setStepData('orchardStep', data)}
          />
        );
      // Parent Tree and SMP
      case 4:
        return null;
      // Extraction and Storage
      case 5:
        return null;
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
            {renderStep()}
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
                  disabled={formStep === 5}
                >
                  Next
                </Button>
              )
              : (
                <Button
                  kind="primary"
                  size="lg"
                  className="back-next-btn"
                  renderIcon={CheckmarkOutline}
                >
                  Submit registration
                </Button>
              )
          }
        </div>
      </div>
    </FlexGrid>
  );
};

export default SeedlotRegistrationForm;
