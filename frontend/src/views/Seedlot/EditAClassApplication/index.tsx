import React, { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  FlexGrid,
  Column,
  Row,
  Loading,
  Button
} from '@carbon/react';
import { Save } from '@carbon/icons-react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { useNavigate, useParams } from 'react-router-dom';

import { getSeedlotById } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';
import { SeedlotType } from '../../../types/SeedlotType';
import { SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';
import { getForestClientByNumber } from '../../../api-service/forestClientsAPI';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { ForestClientType } from '../../../types/ForestClientType';
import { getForestClientOptionInput } from '../../../utils/ForestClientUtils';
import { getBooleanInputObj, getOptionsInputObj, getStringInputObj } from '../../../utils/FormInputUtils';
import { getSpeciesOptionByCode } from '../../../utils/SeedlotUtils';
import { InitialSeedlotFormData } from '../CreateAClass/constants';

import './styles.scss';
import PageTitle from '../../../components/PageTitle';

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
      navigate('/404');
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

  return (
    <FlexGrid className="edit-a-class-seedlot-page">
      <Row className="breadcrumb-row">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlots')}>Seedlots</BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate('/seedlots/my-seedlots')}>My seedlots</BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate(`/seedlots/details/${seedlotNumber}`)}>{`Seedlot ${seedlotNumber}`}</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="title-row">
        <PageTitle
          title="Applicant and seedlot information"
          subtitle="Edit your seedlot's applicant and seedlot information"
        />
      </Row>
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
            onClick={() => {}}
          >
            Save edit
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default EditAClassApplication;
