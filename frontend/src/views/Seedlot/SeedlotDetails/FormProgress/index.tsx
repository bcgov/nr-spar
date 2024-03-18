import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  Button, ProgressIndicatorSkeleton, Row, Column
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import { getAClassSeedlotProgressStatus } from '../../../../api-service/seedlotAPI';
import { ProgressIndicatorConfig } from '../../SeedlotRegFormClassA/definitions';
import SeedlotRegistrationProgress from '../../../../components/SeedlotRegistrationProgress';
import NetworkError from '../../../../components/NetworkError';
import { completeProgressConfig, initialProgressConfig } from '../../SeedlotRegFormClassA/constants';
import PathConstants from '../../../../routes/pathConstants';
import { addParamToPath } from '../../../../utils/PathUtils';
import { QueryStatusType } from '../../../../types/QueryStatusType';
import { SeedlotStatusCode } from '../../../../types/SeedlotType';

import './styles.scss';
import DetailSection from '../../../../components/DetailSection';

interface FormProgressProps {
  seedlotNumber?: string;
  seedlotStatusCode?: SeedlotStatusCode;
  getSeedlotQueryStatus: QueryStatusType
}

const FormProgress = (
  {
    seedlotNumber,
    seedlotStatusCode,
    getSeedlotQueryStatus
  }: FormProgressProps
) => {
  const navigate = useNavigate();

  const [
    progressStatus,
    setProgressStatus
  ] = useState<ProgressIndicatorConfig>(initialProgressConfig);

  useEffect(() => {
    if (seedlotStatusCode && seedlotStatusCode !== 'PND' && seedlotStatusCode !== 'INC') {
      setProgressStatus(completeProgressConfig);
    }
  }, [seedlotStatusCode]);

  const formProgressStatusQuery = useQuery({
    queryKey: ['seedlots', 'a-class-form-progress', 'status', seedlotNumber],
    queryFn: () => getAClassSeedlotProgressStatus(seedlotNumber ?? ''),
    enabled: getSeedlotQueryStatus === 'success'
      && (seedlotStatusCode === 'PND' || seedlotStatusCode === 'INC'),
    refetchOnMount: true,
    retry: 1
  });

  useEffect(() => {
    if (formProgressStatusQuery.status === 'success') {
      const retrievedProgress = formProgressStatusQuery.data
        .data as unknown as ProgressIndicatorConfig;
      setProgressStatus(retrievedProgress);
    }

    if (formProgressStatusQuery.status === 'error') {
      if ((formProgressStatusQuery.error as AxiosError).response?.status === 404) {
        setProgressStatus(initialProgressConfig);
      }
    }
  }, [
    seedlotStatusCode, formProgressStatusQuery.status, formProgressStatusQuery.isFetchedAfterMount
  ]);

  const renderProgress = () => {
    if (!seedlotStatusCode || seedlotStatusCode === 'PND' || seedlotStatusCode === 'INC') {
      if ((getSeedlotQueryStatus === 'loading' || formProgressStatusQuery.status === 'loading')) {
        return <ProgressIndicatorSkeleton />;
      }

      // Render network error only if it's not 404.
      if (formProgressStatusQuery.status === 'error'
        && (formProgressStatusQuery.error as AxiosError).response?.status !== 404
      ) {
        return <NetworkError description={(formProgressStatusQuery.error as AxiosError).message} />;
      }
    }
    return (
      <SeedlotRegistrationProgress
        progressStatus={progressStatus}
        interactFunction={(e: number) => {
          // Add 1 to the number to make it comply with
          // the step numbers shown to the user
          navigate(`${addParamToPath(PathConstants.SEEDLOT_A_CLASS_REGISTRATION, seedlotNumber ?? '')}?step=${e + 1}`);
        }}
      />
    );
  };

  return (
    <DetailSection title="See where you are in the registration process">
      <Row>
        <Column className="steps-box">
          {
            renderProgress()
          }
        </Column>
      </Row>
      <Row>
        <Column>
          <Button
            kind="tertiary"
            size="md"
            className="btn-fp"
            renderIcon={Edit}
            onClick={() => navigate(addParamToPath(PathConstants.SEEDLOT_A_CLASS_REGISTRATION, seedlotNumber ?? ''))}
            disabled={getSeedlotQueryStatus === 'loading'}
          >
            Edit seedlot form
          </Button>
        </Column>
      </Row>
    </DetailSection>
  );
};

export default FormProgress;
