import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  Button, ProgressIndicatorSkeleton
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import { getAClassSeedlotProgressStatus } from '../../../../api-service/seedlotAPI';
import { ProgressIndicatorConfig } from '../../SeedlotRegistrationForm/definitions';
import SeedlotRegistrationProgress from '../../../../components/SeedlotRegistrationProgress';
import { completeProgressConfig, initialProgressConfig } from '../../SeedlotRegistrationForm/constants';
import PathConstants from '../../../../routes/pathConstants';
import { addParamToPath } from '../../../../utils/PathUtils';
import { QueryStatusType } from '../../../../types/QueryStatusType';
import { SeedlotStatusCode } from '../../../../types/SeedlotType';

import './styles.scss';

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
    refetchOnWindowFocus: true,
    retry: 1
  });

  useEffect(() => {
    if (formProgressStatusQuery.status === 'success') {
      const retreivedProgress = formProgressStatusQuery.data
        .data as unknown as ProgressIndicatorConfig;

      const keys = Object.keys(retreivedProgress) as (keyof ProgressIndicatorConfig)[];

      keys.forEach((key) => {
        retreivedProgress[key].isCurrent = false;
      });

      setProgressStatus(formProgressStatusQuery.data.data as unknown as ProgressIndicatorConfig);
    }

    if (formProgressStatusQuery.status === 'error') {
      if ((formProgressStatusQuery.error as AxiosError).response?.status === 404) {
        setProgressStatus(initialProgressConfig);
      }
    }
  }, [seedlotStatusCode, formProgressStatusQuery.status]);

  return (
    <div className="form-progress">
      <div className="form-progress-title-section">
        <p className="form-progress-title">
          See where you are in the registration process
        </p>
      </div>
      {
        seedlotStatusCode !== undefined
          ? (
            <div className="steps-box">
              {
                (seedlotStatusCode === 'PND' || seedlotStatusCode === 'INC')
                  && (getSeedlotQueryStatus === 'loading' || formProgressStatusQuery.status === 'loading')
                  ? <ProgressIndicatorSkeleton />
                  : (
                    <SeedlotRegistrationProgress
                      progressStatus={progressStatus}
                      interactFunction={(e: number) => {
                        // Add 1 to the number to make it comply with
                        // the step numbers shown to the user
                        navigate(`${addParamToPath(PathConstants.SEEDLOT_A_CLASS_REGISTRATION, seedlotNumber ?? '')}?step=${e + 1}`);
                      }}
                    />
                  )
              }
            </div>
          ) : null
      }
      <div>
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
      </div>
    </div>
  );
};

export default FormProgress;
