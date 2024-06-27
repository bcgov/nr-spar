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
import focusById from '../../../utils/FocusUtils';
import ROUTES from '../../../routes/constants';

import { InitialSeedlotFormData } from './constants';
import { convertToPayload } from './utils';

import './styles.scss';

const CreateAClass = () => {
  const navigate = useNavigate();
  const [
    seedlotFormData,
    setSeedlotFormData
  ] = useState<SeedlotRegFormType>(InitialSeedlotFormData);

  const seedlotMutation = useMutation({
    mutationFn: (payload: SeedlotRegPayloadType) => postSeedlot(payload),
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Creation failure"
          subtitle={`Your application could not be created. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    onSuccess: (res) => navigate({
      pathname: ROUTES.SEEDLOT_CREATION_SUCCESS,
      search: `?seedlotNumber=${res.data.seedlotNumber}&seedlotClass=A`
    })
  });

  const setInputValidation = (inputName: keyof SeedlotRegFormType, isInvalid: boolean) => (
    setSeedlotFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        isInvalid
      }
    }))
  );

  const validateAndCreateSeedlot = () => {
    // Validate client
    if (seedlotFormData.client.isInvalid || !seedlotFormData.client.value.code) {
      setInputValidation('client', true);
      focusById(seedlotFormData.client.id);
      return;
    }
    // Validate location code
    if (
      seedlotFormData.locationCode.isInvalid
      || !seedlotFormData.locationCode.value
    ) {
      setInputValidation('locationCode', true);
      focusById(seedlotFormData.locationCode.id);
      return;
    }
    // Validate email
    if (seedlotFormData.email.isInvalid || !seedlotFormData.email.value) {
      setInputValidation('email', true);
      focusById(seedlotFormData.email.id);
      return;
    }
    // Validate species
    if (seedlotFormData.species.isInvalid || !seedlotFormData.species.value.code) {
      setInputValidation('species', true);
      focusById(seedlotFormData.species.id);
      return;
    }
    // Source code, and the two booleans always have a default value so there's no need to check.

    // Submit Seedlot.
    const payload = convertToPayload(seedlotFormData);
    seedlotMutation.mutate(payload);
  };

  return (
    <FlexGrid className="create-a-class-seedlot-page">
      <Row className="create-a-class-seedlot-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(ROUTES.SEEDLOTS)}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="page-title-row">
        <PageTitle
          title="Create A-class seedlot"
          subtitle="Register a new A-class seedlot"
          enableFavourite
          activity="registerAClass"
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
                  title="Your application could not be created"
                  inline
                  actionButtonLabel=""
                  onClose={() => false}
                >
                  An error has occurred when trying to create your seedlot number.
                  Please try submiting it again later.
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
          >
            Create seedlot number
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default CreateAClass;
