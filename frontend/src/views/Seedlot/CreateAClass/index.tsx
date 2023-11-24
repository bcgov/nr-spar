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
import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';
import './styles.scss';

const CreateAClass = () => {
  const navigate = useNavigate();
  return (
    <FlexGrid className="create-a-class-seedlot-page">
      <Stack gap={3}>
        <Row className="create-a-class-seedlot-breadcrumb">
          <Breadcrumb>
            <BreadcrumbItem onClick={() => navigate('/seedlots')}>Seedlots</BreadcrumbItem>
          </Breadcrumb>
        </Row>
        <Row>
          <PageTitle
            title="Create A-class seedlot"
            subtitle="Register a new A-class seedlot"
            enableFavourite
            activity="registerAClass"
          />
        </Row>
        <Row>
          <LotApplicantAndInfoForm isSeedlot isEdit />
        </Row>
      </Stack>
    </FlexGrid>
  );
};

export default CreateAClass;
