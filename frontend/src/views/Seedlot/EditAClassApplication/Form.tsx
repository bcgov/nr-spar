import React, { useEffect } from 'react';
import {
  ActionableNotification,
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
import { getForestClientByNumberOrAcronym } from '../../../api-service/forestClientsAPI';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import PageTitle from '../../../components/PageTitle';
import focusById from '../../../utils/FocusUtils';
import ROUTES from '../../../routes/constants';
import ErrorToast from '../../../components/Toast/ErrorToast';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import { ForestClientType } from '../../../types/ForestClientTypes/ForestClientType';
import { getForestClientOptionInput } from '../../../utils/ForestClientUtils';
import { getBooleanInputObj, getOptionsInputObj, getStringInputObj } from '../../../utils/FormInputUtils';
import { getSpeciesOptionByCode } from '../../../utils/SeedlotUtils';
import { addParamToPath } from '../../../utils/PathUtils';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';

import { getBreadcrumbs } from './utils';

import './styles.scss';

type props = {
  // Defines whether this component is being used on the review seedlot page
  isReview?: boolean,
  applicantData: SeedlotRegFormType,
  setApplicantData: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>
}

const EditAClassApplicationForm = ({ isReview, applicantData, setApplicantData }: props) => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(),
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: vegCodeQuery.isFetched,
    select: (data) => data.seedlot
  });

  useEffect(() => {
    if (
      seedlotQuery.status === 'error'
      && (seedlotQuery.error as AxiosError).response?.status === 404
    ) {
      navigate(ROUTES.FOUR_OH_FOUR);
    }
  }, [seedlotQuery.status]);

  const applicantClientNumber = seedlotQuery.data?.applicantClientNumber;

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', applicantClientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(applicantClientNumber!),
    enabled: !!applicantClientNumber,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const convertToSeedlotForm = (
    seedlot: SeedlotType,
    vegCodes: MultiOptionsObj[],
    client: ForestClientType
  ) => {
    setApplicantData({
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
    onSuccess: () => navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? '')),
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
    setApplicantData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        isInvalid
      }
    }))
  );

  const validateAndSave = () => {
    if (applicantData.email.isInvalid || !applicantData.email.value) {
      setInputValidation('email', true);
      focusById(applicantData.email.id);
      return;
    }

    if (applicantData.sourceCode.isInvalid || !applicantData.sourceCode.value) {
      setInputValidation('sourceCode', true);
      focusById(applicantData.sourceCode.id);
      return;
    }

    seedlotPatchMutation.mutate({
      applicantEmailAddress: applicantData.email.value,
      seedlotSourceCode: applicantData.sourceCode.value,
      toBeRegistrdInd: applicantData.willBeRegistered.value,
      bcSourceInd: applicantData.isBcSource.value
    });
  };

  return (
    <FlexGrid className={`edit-a-class-seedlot-page ${isReview ? 'no-padding' : null}`}>
      {
        isReview
          ? null
          : (
            <>
              <Row className="breadcrumb-row">
                <Breadcrumbs crumbs={getBreadcrumbs(seedlotNumber!)} />
              </Row>
              <Row className="title-row">
                <PageTitle
                  title="Applicant and seedlot information"
                  subtitle="Edit your seedlot's applicant and seedlot information"
                />
              </Row>
            </>
          )
      }
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
            forestClientQuery.isFetched && applicantData
              ? (
                <LotApplicantAndInfoForm
                  isSeedlot
                  isEdit
                  isReview={isReview}
                  seedlotFormData={applicantData}
                  setSeedlotFormData={setApplicantData}
                />
              )
              : <Loading />
          }
        </Column>
      </Row>
      {
        isReview
          ? null
          : (
            <Row>
              <Column sm={4} md={3} lg={5} xlg={4} max={3}>
                <Button
                  className="submit-button"
                  renderIcon={Save}
                  onClick={validateAndSave}
                >
                  Save edit
                </Button>
              </Column>
            </Row>
          )
      }
    </FlexGrid>
  );
};

export default EditAClassApplicationForm;
