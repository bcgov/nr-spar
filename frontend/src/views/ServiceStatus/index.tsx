import React from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import api from '../../api-service/api';
import { TEN_SECONDS } from '../../config/TimeUnits';

import { SPAR_DEPENDENCIES } from './constants';
import './styles.scss';

const ServiceStatus = () => {
  const qc = useQueryClient();

  useQueries({
    queries: SPAR_DEPENDENCIES.map((depencyObj) => ({
      queryKey: [depencyObj.queryKey],
      queryFn: () => api.get(depencyObj.healthCheckUrl),
      refetchInterval: TEN_SECONDS, // Polling every 10 seconds
      refetchIntervalInBackground: true // Continue polling in background
    }))
  });

  return (
    <FlexGrid>
      <Row>
        <Column>
          <h3>
            SPAR Dependency Status
          </h3>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ServiceStatus;
