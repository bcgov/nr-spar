import React, { useEffect, useState } from 'react';
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

import { getSeedlotById } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageTitle from '../../../components/PageTitle';
import RowGap from '../../../components/RowGap';
import ApplicantAndSeedlotRead from '../../../components/SeedlotReviewSteps/ApplicantAndSeedlot/Read';
import ApplicantAndSeedlotEdit from '../../../components/SeedlotReviewSteps/ApplicantAndSeedlot/Edit';
import { SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';
import { InitialSeedlotFormData } from '../CreateAClass/constants';
import CollectionReviewRead from '../../../components/SeedlotReviewSteps/Collection/Read';
import CollectionReviewEdit from '../../../components/SeedlotReviewSteps/Collection/Edit';
import OwnershipReviewRead from '../../../components/SeedlotReviewSteps/Ownership/Read';

import ContextContainerClassA from '../ContextContainerClassA';

import { getBreadcrumbs } from './utils';

import './styles.scss';

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

  useEffect(() => {
    const { status } = seedlotQuery;

    // Handle error
    if (status === 'error') {
      const err = seedlotQuery.error as AxiosError;
      // Handle 404
      if (err.response?.status === 404) {
        navigate('/404');
      }
    }
  }, [seedlotQuery.status]);

  // True if in view mode, false in edit mode.
  const [isReadMode, setIsReadMode] = useState(true);

  useEffect(() => {
    if (seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'INC'
      || seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'PND'
    ) {
      // Navigate back to the seedlot detail page if the seedlot is pending or incomplete
      navigate(`/seedlots/details/${seedlotNumber}`);
    }
  }, [seedlotNumber]);

  /**
   * Applicant info data, form data should be accessed through context.
   */
  const [
    applicantData,
    setApplicantData
  ] = useState<SeedlotRegFormType>(InitialSeedlotFormData);

  const handleEditSaveBtn = () => {
    // eslint-disable-next-line no-console
    console.log(applicantData);
    setIsReadMode(!isReadMode);
  };

  return (
    <ContextContainerClassA>
      <FlexGrid className="seedlot-review-grid">
        <Button
          kind="secondary"
          size="md"
          className="edit-save-btn"
          renderIcon={isReadMode ? Edit : Save}
          onClick={handleEditSaveBtn}
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
                  <ApplicantAndSeedlotEdit
                    applicantData={applicantData}
                    setApplicantData={setApplicantData}
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
        <Row className="section-row">
          <Column>
            {
              isReadMode
                ? <CollectionReviewRead />
                : (
                  <CollectionReviewEdit />
                )
            }
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
        <Row className="section-row">
          <Column>
            <OwnershipReviewRead />
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
    </ContextContainerClassA>
  );
};

export default SeedlotReview;
