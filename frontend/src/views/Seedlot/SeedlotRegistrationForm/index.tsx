import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FlexGrid,
  Row,
  Breadcrumb,
  BreadcrumbItem
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import SeedlotRegistrationProgress from '../../../components/SeedlotRegistrationProgress';

import './styles.scss';

const SeedlotRegistrationForm = () => {
  const navigate = useNavigate();
  const seedlotNumber = useParams().seedlot;

  const [formStep, setFormStep] = useState<number>(0);

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
        <Row className="seedlot-registration-forms">
          <div className={formStep === 0 ? 'seedlot-current-form' : 'seedlot-form-not-selected'}>
            <p>Collection placeholder</p>
          </div>
          <div className={formStep === 1 ? 'seedlot-current-form' : 'seedlot-form-not-selected'}>
            <p>Ownership placeholder</p>
          </div>
          <div className={formStep === 2 ? 'seedlot-current-form' : 'seedlot-form-not-selected'}>
            <p>Interim storage placeholder</p>
          </div>
          <div className={formStep === 3 ? 'seedlot-current-form' : 'seedlot-form-not-selected'}>
            <p>Orchard placeholder</p>
          </div>
          <div className={formStep === 4 ? 'seedlot-current-form' : 'seedlot-form-not-selected'}>
            <p>Parent tree and SMP placeholder</p>
          </div>
          <div className={formStep === 5 ? 'seedlot-current-form' : 'seedlot-form-not-selected'}>
            <p>Extraction and storage placeholder</p>
          </div>
        </Row>
      </div>
    </FlexGrid>
  );
};

export default SeedlotRegistrationForm;
