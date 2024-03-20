import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Button,
  FlexGrid,
  Row,
  Column
} from '@carbon/react';
import { Edit, Save } from '@carbon/icons-react';

import { getAClassSeedlotFullForm, getSeedlotById } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageTitle from '../../../components/PageTitle';
import RowGap from '../../../components/RowGap';
import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';
import ApplicantAndSeedlotRead from '../../../components/ApplicantAndSeedlot/Read';
import ROUTES from '../../../routes/constants';

import { getBreadcrumbs } from './utils';

import './styles.scss';
import { SeedlotAClassSubmitType } from '../../../types/SeedlotType';
import SeedlotReviewContext from './context';
import { AllStepData } from '../SeedlotRegFormClassA/definitions';
import { refillStateData } from '../SeedlotRegFormClassA/utils';

const SeedlotReview = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: vegCodeQuery.isFetched,
    refetchOnMount: true
  });

  /**
   * status effects for seedlotQuery
   */
  useEffect(() => {
    const { status } = seedlotQuery;

    // Handle error
    if (status === 'error') {
      const err = seedlotQuery.error as AxiosError;
      // Handle 404
      if (err.response?.status === 404) {
        navigate(ROUTES.FOUR_OH_FOUR);
      }
    }
  }, [seedlotQuery.status]);

  const seedlotFullFormQuery = useQuery({
    queryKey: ['seedlot-full-form', seedlotNumber],
    queryFn: () => getAClassSeedlotFullForm(seedlotNumber ?? ''),
    refetchOnMount: true
  });

  const [formData, setFormData] = useState<AllStepData>();

  useEffect(() => {
    if (seedlotFullFormQuery.status === 'success'
      && fundingSourcesQuery.status === 'success'
      && methodsOfPaymentQuery.status === 'success'
      && gameticMethodologyQuery.status === 'success'
      && orchardQuery.status === 'success') {
      const fullFormData = seedlotFullFormQuery.data.seedlotData;
      const defaultAgencyNumber = seedlotQuery.data?.applicantClientNumber;
      setAllStepData(
        refillStateData(
          fullFormData,
          defaultAgencyNumber,
          methodsOfPaymentQuery.data,
          fundingSourcesQuery.data,
          orchardQuery.data,
          gameticMethodologyQuery.data
        )
      );
    } else if (seedlotFullFormQuery.status === 'error') {
      const error = seedlotFullFormQuery.error as AxiosError;
      if (error.response?.status !== 404) {
        // eslint-disable-next-line no-alert
        alert(`Error retrieving seedlot data! ${error.message}`);
        navigate(`/seedlots/details/${seedlotNumber}`);
      }
    }
  }, [
    seedlotFullFormQuery.status,
    seedlotFullFormQuery.isFetched,
    fundingSourcesQuery.isFetched,
    methodsOfPaymentQuery.isFetched,
    gameticMethodologyQuery.isFetched,
    orchardQuery.isFetched
  ]);

  const contextData = useMemo(
    () => (
      {
        formData
      }),
    [
      formData
    ]
  );

  // True if in view mode, false in edit mode.
  const [isReadMode, setIsReadMode] = useState(true);

  return (
    <SeedlotReviewContext.Provider value={contextData}>
      <FlexGrid className="seedlot-review-grid">
        <Button
          kind="secondary"
          size="md"
          className="edit-save-btn"
          renderIcon={isReadMode ? Edit : Save}
          onClick={() => setIsReadMode(!isReadMode)}
        >
          {isReadMode ? 'Edit seedlot' : 'Save edit'}
        </Button>

        <Breadcrumbs crumbs={getBreadcrumbs(seedlotNumber ?? '')} />

        <Row>
          <PageTitle
            title={`Review Seedlot ${seedlotQuery.data?.id}`}
            subtitle={`${seedlotQuery.data?.seedlotStatus.description} status`}
          />
        </Row>

        <Row className="section-title-row">
          <Column className="section-title-col">
            Applicant and seedlot
          </Column>
        </Row>
        <Row className="section-row">
          <Column>
            {
              isReadMode
                ? <ApplicantAndSeedlotRead />
                : (
                  <LotApplicantAndInfoForm
                    isSeedlot
                    isEdit={false}
                  />
                )
            }
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Collection
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Area of use
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Ownership
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Interim storage
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Orchard
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Parent tree and SMP
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Extraction and storage information
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Audit history
          </Column>
        </Row>

        <RowGap gapSize={4} />
      </FlexGrid>
    </SeedlotReviewContext.Provider>
  );
};

export default SeedlotReview;
