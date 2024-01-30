import React, { useEffect, useState } from 'react';
import {
  ActionableNotification,
  Breadcrumb,
  BreadcrumbItem,
  FlexGrid,
  Column,
  Row,
  Loading,
  Button
} from '@carbon/react';
import { Save } from '@carbon/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

import { getSeedlotById, patchSeedlotApplicationInfo } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';
import { SeedlotType } from '../../../types/SeedlotType';
import { SeedlotPatchPayloadType, SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';
import { getForestClientByNumber } from '../../../api-service/forestClientsAPI';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import PageTitle from '../../../components/PageTitle';
import focusById from '../../../utils/FocusUtils';
import PathConstants from '../../../routes/pathConstants';
import ErrorToast from '../../../components/Toast/ErrorToast';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import { ForestClientType } from '../../../types/ForestClientTypes/ForestClientType';
import { getForestClientOptionInput } from '../../../utils/ForestClientUtils';
import { getBooleanInputObj, getOptionsInputObj, getStringInputObj } from '../../../utils/FormInputUtils';
import { getSpeciesOptionByCode } from '../../../utils/SeedlotUtils';
import { InitialSeedlotFormData } from '../CreateAClass/constants';

import './styles.scss';
import { addParamToPath } from '../../../utils/PathUtils';

const EditAClassApplication = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  const [
    seedlotEditData,
    setSeedlotEditData
  ] = useState<SeedlotRegFormType>(InitialSeedlotFormData);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: vegCodeQuery.isFetched
  });

  useEffect(() => {
    if (
      seedlotQuery.status === 'error'
      && (seedlotQuery.error as AxiosError).response?.status === 404
    ) {
      navigate(PathConstants.FOUR_OH_FOUR);
    }
  }, [seedlotQuery.status]);

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', seedlotQuery.data?.applicantClientNumber],
    queryFn: () => getForestClientByNumber(seedlotQuery.data?.applicantClientNumber),
    enabled: seedlotQuery.isFetched,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const convertToSeedlotForm = (
    seedlot: SeedlotType,
    vegCodes: MultiOptionsObj[],
    client: ForestClientType
  ) => {
    setSeedlotEditData({
      client: getForestClientOptionInput('edit-client-read-only', client),
      locationCode: getStringInputObj('edit-seedlot-location-code', seedlot.applicantLocationCode),
      email: getStringInputObj('edit-seedlot-email', seedlot.applicantEmailAddress),
      species: getOptionsInputObj('edit-seedlot-species', getSpeciesOptionByCode(seedlot.vegetationCode, vegCodes)),
      sourceCode: getStringInputObj('edit-seedlot-source-code', seedlot.seedlotSource.seedlotSourceCode),
      willBeRegistered: getBooleanInputObj('edit-seedlot-will-be-registered', seedlot.intendedForCrownLand),
      isBcSource: getBooleanInputObj('edit-seedlot-is-bc-source', seedlot.sourceInBc)
    });
  };

  useEffect(() => {
    if (
      forestClientQuery.isFetched
      && forestClientQuery.data
      && seedlotQuery.data
      && vegCodeQuery.data
    ) {
      convertToSeedlotForm(seedlotQuery.data, vegCodeQuery.data, forestClientQuery.data);
    }
  }, [forestClientQuery.isFetched]);

  const seedlotPatchMutation = useMutation({
    mutationFn: (
      payload: SeedlotPatchPayloadType
    ) => patchSeedlotApplicationInfo(seedlotNumber ?? '', payload),
    onSuccess: () => navigate(addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? '')),
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Save failure"
          subtitle={`An unexpected error occurred while saving your edits. Please try again, and if the issue persists, contact support. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    }
  });

  const setInputValidation = (inputName: keyof SeedlotRegFormType, isInvalid: boolean) => (
    setSeedlotEditData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        isInvalid
      }
    }))
  );

  const validateAndSave = () => {
    if (seedlotEditData.email.isInvalid || !seedlotEditData.email.value) {
      setInputValidation('email', true);
      focusById(seedlotEditData.email.id);
      return;
    }

    if (seedlotEditData.sourceCode.isInvalid || !seedlotEditData.sourceCode.value) {
      setInputValidation('sourceCode', true);
      focusById(seedlotEditData.sourceCode.id);
      return;
    }

    seedlotPatchMutation.mutate({
      applicantEmailAddress: seedlotEditData.email.value,
      seedlotSourceCode: seedlotEditData.sourceCode.value,
      toBeRegistrdInd: seedlotEditData.willBeRegistered.value,
      bcSourceInd: seedlotEditData.isBcSource.value
    });
  };

  return (
    <FlexGrid className="edit-a-class-seedlot-page">
      <Row className="breadcrumb-row">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(PathConstants.SEEDLOTS)}>
            Seedlots
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate(PathConstants.MY_SEEDLOTS)}>
            My seedlots
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate(addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? ''))}>
            {`Seedlot ${seedlotNumber}`}
          </BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="title-row">
        <PageTitle
          title="Applicant and seedlot information"
          subtitle="Edit your seedlot's applicant and seedlot information"
        />
      </Row>
      {
        seedlotPatchMutation.isError
          ? (
            <Row className="error-row">
              <Column>
                <ActionableNotification
                  id="edit-seedlot-error-banner"
                  kind="error"
                  lowContrast
                  title="Save failure!"
                  inline
                  actionButtonLabel=""
                  onClose={() => false}
                >
                  An unexpected error occurred while saving your edits.
                  Please try again, and if the issue persists, contact support.
                  {' '}
                  {`${(seedlotPatchMutation.error as AxiosError).code}: ${(seedlotPatchMutation.error as AxiosError).message}`}
                </ActionableNotification>
              </Column>
            </Row>
          )
          : null
      }
      <Row>
        <Column>
          {
            forestClientQuery.isFetched && seedlotEditData
              ? (
                <LotApplicantAndInfoForm
                  isSeedlot
                  isEdit
                  seedlotFormData={seedlotEditData}
                  setSeedlotFormData={setSeedlotEditData}
                />
              )
              : <Loading />
          }
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={3} lg={5} xlg={4} max={3}>
          <Button
            className="submit-button"
            renderIcon={Save}
            onClick={() => validateAndSave()}
          >
            Save edit
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default EditAClassApplication;
