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

import { getBreadcrumbs } from './utils';

import './styles.scss';
import LotApplicantAndInfoForm from '../../../components/LotApplicantAndInfoForm';

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
        <Column>
          <div className="section-title">Applicant and seedlot</div>
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? null
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
        <Column>
          <div className="section-title">Collection</div>
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column>
          <div className="section-title">Area of use</div>
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column>
          <div className="section-title">Ownership</div>
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column>
          <div className="section-title">Interim storage</div>
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column>
          <div className="section-title">Orchard</div>
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column>
          <div className="section-title">Parent tree and SMP</div>
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column>
          <div className="section-title">Extraction and storage information</div>
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column>
          <div className="section-title">Audit history</div>
        </Column>
      </Row>

      <RowGap gapSize={4} />
    </FlexGrid>
  );
};

export default SeedlotReview;
