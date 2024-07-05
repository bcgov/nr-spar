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
import { InitialSeedlotRegFormData } from '../CreateAClass/constants';
import CollectionReviewRead from '../../../components/SeedlotReviewSteps/Collection/Read';
import CollectionReviewEdit from '../../../components/SeedlotReviewSteps/Collection/Edit';
import OwnershipReviewRead from '../../../components/SeedlotReviewSteps/Ownership/Read';
import OwnershipReviewEdit from '../../../components/SeedlotReviewSteps/Ownership/Edit';
import InterimReviewRead from '../../../components/SeedlotReviewSteps/Interim/Read';
import InterimReviewEdit from '../../../components/SeedlotReviewSteps/Interim/Edit';
import OrchardReviewRead from '../../../components/SeedlotReviewSteps/Orchard/Read';
import OrchardReviewEdit from '../../../components/SeedlotReviewSteps/Orchard/Edit';
import ParentTreeReview from '../../../components/SeedlotReviewSteps/ParentTrees';
import AreaOfUseRead from '../../../components/SeedlotReviewSteps/AreaOfUse/Read';
import AreaOfUseEdit from '../../../components/SeedlotReviewSteps/AreaOfUse/Edit';
import ExtractionStorageReviewRead from '../../../components/SeedlotReviewSteps/ExtractionStorage/Read';
import ExtractionStorageReviewEdit from '../../../components/SeedlotReviewSteps/ExtractionStorage/Edit';

import ContextContainerClassA from '../ContextContainerClassA';

import { getBreadcrumbs } from './utils';

import './styles.scss';
import { validateRegForm } from '../CreateAClass/utils';

const SeedlotReview = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(),
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
    if (seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode === 'INC'
      || seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode === 'PND'
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
  ] = useState<SeedlotRegFormType>(InitialSeedlotRegFormData);

  const verifyFormData = (): boolean => {
    let isValid = false;

    if (!validateRegForm(applicantData, setApplicantData)) {
      console.log(applicantData);
      return isValid;
    }

    isValid = true;
    return isValid;
  };

  const handleEditSaveBtn = () => {
    const isFormDataValid = verifyFormData();
    console.log('ahahah', isFormDataValid);

    if (isFormDataValid) {
      setIsReadMode(!isReadMode);
    }
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
            title={`Review Seedlot ${seedlotQuery.data?.seedlot.id}`}
            subtitle={`${seedlotQuery.data?.seedlot.seedlotStatus.description} status`}
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
            Ownership
          </Column>
        </Row>
        <Row className="section-row">
          <Column>
            {
              isReadMode
                ? <OwnershipReviewRead />
                : (
                  <OwnershipReviewEdit />
                )
            }
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Interim storage
          </Column>
        </Row>
        <Row className="section-row">
          <Column>
            {
              isReadMode
                ? <InterimReviewRead />
                : (
                  <InterimReviewEdit />
                )
            }
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Orchard
          </Column>
        </Row>
        <Row className="section-row">
          <Column>
            {
              isReadMode
                ? <OrchardReviewRead />
                : (
                  <OrchardReviewEdit />
                )
            }
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Parent tree and SMP
          </Column>
        </Row>
        <Row className="section-row">
          <Column>
            <ParentTreeReview isRead={isReadMode} />
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Area of use
          </Column>
        </Row>
        <Row className="section-row">
          <Column>
            {
              isReadMode
                ? <AreaOfUseRead />
                : <AreaOfUseEdit />
            }
          </Column>
        </Row>

        <RowGap />

        <Row className="section-title-row">
          <Column className="section-title-col">
            Extraction and storage information
          </Column>
        </Row>
        <Row className="section-row">
          <Column>
            {
              isReadMode
                ? <ExtractionStorageReviewRead />
                : (
                  <ExtractionStorageReviewEdit />
                )
            }
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
