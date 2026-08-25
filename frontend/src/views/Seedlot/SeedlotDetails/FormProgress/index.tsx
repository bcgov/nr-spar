import React, { useMemo } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  Button, ProgressIndicatorSkeleton, Row, Column
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import {
  getAClassSeedlotProgressStatus,
  getBClassSeedlotProgressStatus
} from '../../../../api-service/seedlotAPI';
import { ProgressIndicatorConfig } from '../../ContextContainerClassA/definitions';
import { BClassProgressIndicatorConfig } from '../../ContextContainerClassB/definitions';
import DetailSection from '../../../../components/DetailSection';
import SeedlotRegistrationProgress from '../../../../components/SeedlotRegistrationProgress';
import SeedlotRegistrationProgressClassB from '../../../../components/SeedlotRegistrationProgressClassB';
import NetworkError from '../../../../components/NetworkError';
import {
  completeProgressConfig as aCompleteProgressConfig,
  initialProgressConfig as aInitialProgressConfig
} from '../../ContextContainerClassA/constants';
import {
  completeProgressConfig as bCompleteProgressConfig,
  initialProgressConfig as bInitialProgressConfig
} from '../../ContextContainerClassB/constants';
import ROUTES from '../../../../routes/constants';
import { addParamToPath } from '../../../../utils/PathUtils';
import { QueryStatusType } from '../../../../types/QueryStatusType';
import { SeedlotStatusCode } from '../../../../types/SeedlotType';

import './styles.scss';

type ProgressBarProps<T> = {
  progressStatus: T;
  interactFunction?: (data: number) => void;
};

type ClassFormProgressConfig<T> = {
  queryKey: string;
  fetchProgress: (seedlotNumber: string) => Promise<AxiosResponse<T>>;
  initialProgress: T;
  completeProgress: T;
  registrationRoute: string;
  ProgressBar: React.ComponentType<ProgressBarProps<T>>;
};

const aClassFormProgressConfig: ClassFormProgressConfig<ProgressIndicatorConfig> = {
  queryKey: 'a-class-form-progress',
  fetchProgress: getAClassSeedlotProgressStatus,
  initialProgress: aInitialProgressConfig,
  completeProgress: aCompleteProgressConfig,
  registrationRoute: ROUTES.SEEDLOT_A_CLASS_REGISTRATION,
  ProgressBar: SeedlotRegistrationProgress
};

const bClassFormProgressConfig: ClassFormProgressConfig<BClassProgressIndicatorConfig> = {
  queryKey: 'b-class-form-progress',
  fetchProgress: getBClassSeedlotProgressStatus,
  initialProgress: bInitialProgressConfig,
  completeProgress: bCompleteProgressConfig,
  registrationRoute: ROUTES.SEEDLOT_B_CLASS_REGISTRATION,
  ProgressBar: SeedlotRegistrationProgressClassB
};

interface ClassFormProgressProps<T> {
  seedlotNumber?: string;
  seedlotStatusCode?: SeedlotStatusCode;
  getSeedlotQueryStatus: QueryStatusType;
  config: ClassFormProgressConfig<T>;
}

export const ClassFormProgress = <T,>({
  seedlotNumber,
  seedlotStatusCode,
  getSeedlotQueryStatus,
  config
}: ClassFormProgressProps<T>) => {
  const navigate = useNavigate();
  const {
    queryKey,
    fetchProgress,
    initialProgress,
    completeProgress,
    registrationRoute,
    ProgressBar
  } = config;

  const isDraftStatus = seedlotStatusCode === 'PND' || seedlotStatusCode === 'INC';

  const formProgressStatusQuery = useQuery({
    queryKey: ['seedlots', queryKey, 'status', seedlotNumber],
    queryFn: () => fetchProgress(seedlotNumber ?? ''),
    enabled: getSeedlotQueryStatus === 'success' && isDraftStatus,
    refetchOnMount: true
  });

  const progressError = formProgressStatusQuery.error as AxiosError | null;

  // A submitted seedlot is complete by definition; a draft reports its progress from the API,
  // and anything else (loading, or a 404 meaning "no draft yet") starts from an empty form.
  const progressStatus = useMemo<T>(() => {
    if (seedlotStatusCode && !isDraftStatus) {
      return completeProgress;
    }
    if (isDraftStatus && formProgressStatusQuery.status === 'success') {
      return formProgressStatusQuery.data.data;
    }
    return initialProgress;
  }, [
    seedlotStatusCode,
    isDraftStatus,
    completeProgress,
    initialProgress,
    formProgressStatusQuery.status,
    formProgressStatusQuery.data
  ]);

  const registrationPath = addParamToPath(registrationRoute, seedlotNumber ?? '');

  const renderProgress = () => {
    if (!seedlotStatusCode || isDraftStatus) {
      if (getSeedlotQueryStatus === 'pending' || formProgressStatusQuery.status === 'pending') {
        return <ProgressIndicatorSkeleton />;
      }

      if (formProgressStatusQuery.status === 'error' && progressError?.response?.status !== 404) {
        return <NetworkError description={progressError?.message} />;
      }
    }
    return (
      <ProgressBar
        progressStatus={progressStatus}
        interactFunction={(e: number) => {
          navigate(`${registrationPath}?step=${e + 1}`);
        }}
      />
    );
  };

  const isViewOnly = seedlotStatusCode === 'SUB'
    || seedlotStatusCode === 'EXP'
    || seedlotStatusCode === 'COM'
    || seedlotStatusCode === 'APP';

  return (
    <DetailSection title="See where you are in the registration process">
      <Row>
        <Column className="steps-box">
          {renderProgress()}
        </Column>
      </Row>
      <Row>
        <Column>
          <Button
            kind="tertiary"
            size="md"
            className="section-btn"
            renderIcon={Edit}
            onClick={() => navigate(registrationPath)}
            disabled={getSeedlotQueryStatus === 'pending'}
          >
            {isViewOnly ? 'View your seedlot' : 'Edit seedlot form'}
          </Button>
        </Column>
      </Row>
    </DetailSection>
  );
};

interface FormProgressProps {
  seedlotNumber?: string;
  seedlotStatusCode?: SeedlotStatusCode;
  getSeedlotQueryStatus: QueryStatusType;
  isBClass?: boolean;
}

const FormProgress = ({
  isBClass = false,
  ...props
}: FormProgressProps) => (
  isBClass
    ? <ClassFormProgress {...props} config={bClassFormProgressConfig} />
    : <ClassFormProgress {...props} config={aClassFormProgressConfig} />
);

export default FormProgress;
