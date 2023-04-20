import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexGrid,
  Row,
  Stack,
  Breadcrumb,
  BreadcrumbItem
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import ApplicantInformation from '../../../components/ApplicantInformation';

import './styles.css';

const CreateAClass = () => {
  const navigate = useNavigate();
  return (
    <FlexGrid className="create-a-class-seedlot-page">
      <Stack gap={3}>
        <Row className="create-a-class-seedlot-breadcrumb">
          <Breadcrumb>
            <BreadcrumbItem onClick={() => navigate('/seedlot')}>Seedlots</BreadcrumbItem>
          </Breadcrumb>
        </Row>
        <Row>
          <PageTitle
            title="Create A class seedlot"
            subtitle="Register a new A class seedlot"
            enableFavourite
            activity="CREATE_A_CLASS_SEEDLOT"
          />
        </Row>
        <ApplicantInformation />
      </Stack>
    </FlexGrid>
  );
};

export default CreateAClass;
