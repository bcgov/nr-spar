import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionableNotification,
  Button,
  FlexGrid,
  Row,
  Column,
  Breadcrumb,
  BreadcrumbItem
} from '@carbon/react';
import { DocumentAdd } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import PageTitle from '../../../components/PageTitle';
import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';
import { SeedlotRegFormType, SeedlotRegPayloadType } from '../../../types/SeedlotRegistrationTypes';
import { postSeedlot } from '../../../api-service/seedlotAPI';
import ErrorToast from '../../../components/Toast/ErrorToast';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import ROUTES from '../../../routes/constants';

import { CreateSeedlotClassProps } from './definitions';
import { convertToPayload, validateRegForm } from './utils';

import './styles.scss';

const CreateSeedlotClass = ({
  geneticClass,
  title,
  subtitle,
  activity,
  initialFormData,
  errorTitle
}: CreateSeedlotClassProps) => {
  const navigate = useNavigate();
  const [
    seedlotFormData,
    setSeedlotFormData
  ] = useState<SeedlotRegFormType>(initialFormData);

  const seedlotMutation = useMutation({
    mutationFn: (payload: SeedlotRegPayloadType) => postSeedlot(payload),
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Creation failure"
          subtitle={`${errorTitle} Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    onSuccess: (res) => navigate({
      pathname: ROUTES.SEEDLOT_CREATION_SUCCESS,
      search: `?seedlotNumber=${res.data.seedlotNumber}&seedlotClass=${geneticClass}`
    })
  });

  const validateAndCreateSeedlot = () => {
    const isValid = validateRegForm(seedlotFormData, setSeedlotFormData);
    if (isValid) {
      const payload = convertToPayload(seedlotFormData, geneticClass);
      seedlotMutation.mutate(payload);
    }
  };

  return (
    <FlexGrid className="create-seedlot-class-page">
      <Row className="create-seedlot-class-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(ROUTES.SEEDLOTS)}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="page-title-row">
        <PageTitle
          title={title}
          subtitle={subtitle}
          enableFavourite
          activity={activity}
        />
      </Row>
      {
        seedlotMutation.isError
          ? (
            <Row className="error-row">
              <Column>
                <ActionableNotification
                  id="create-seedlot-error-banner"
                  kind="error"
                  lowContrast
                  title={errorTitle}
                  inline
                  actionButtonLabel=""
                  onClose={() => false}
                >
                  An error has occurred when trying to create your seedlot number.
                  Please try submitting it again later.
                  {' '}
                  {`${seedlotMutation.error.code}: ${seedlotMutation.error.message}`}
                </ActionableNotification>
              </Column>
            </Row>
          )
          : null
      }
      <Row>
        <Column>
          <LotApplicantAndInfoForm
            isSeedlot
            geneticClass={geneticClass}
            isEdit={false}
            seedlotFormData={seedlotFormData}
            setSeedlotFormData={setSeedlotFormData}
          />
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={3} lg={5} xlg={4} max={3}>
          <Button
            className="submit-button"
            renderIcon={DocumentAdd}
            onClick={validateAndCreateSeedlot}
            disabled={seedlotMutation.isPending}
          >
            Create seedlot number
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default CreateSeedlotClass;
