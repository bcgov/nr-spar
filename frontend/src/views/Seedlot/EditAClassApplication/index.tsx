import React from 'react';
import {
  FlexGrid,
  Row
} from '@carbon/react';

import { useParams, useNavigate } from 'react-router-dom';

import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';
import './styles.scss';

const EditAClassApplication = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  return (
    <FlexGrid className="create-a-class-seedlot-page">
      <Row>
        <LotApplicantAndInfoForm />
      </Row>
    </FlexGrid>
  );
};

export default EditAClassApplication;
