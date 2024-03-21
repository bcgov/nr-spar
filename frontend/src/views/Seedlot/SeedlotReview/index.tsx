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
import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';
import ApplicantAndSeedlotRead from '../../../components/ApplicantAndSeedlot/Read';

import { getBreadcrumbs } from './utils';

import './styles.scss';
import SeedlotRegistrationForm from '../SeedlotRegFormClassA';

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

  return (
    <SeedlotRegistrationForm>
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
    </SeedlotRegistrationForm>
  );
};

export default SeedlotReview;
