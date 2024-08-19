import React from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';
import axios, { AxiosError } from 'axios';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import api from '../../api-service/api';
import { TEN_SECONDS } from '../../config/TimeUnits';

import { SPAR_DEPENDENCIES } from './constants';
import './styles.scss';

const ServiceStatus = () => {
  const qc = useQueryClient();

  useQueries({
    queries: SPAR_DEPENDENCIES.map((dependencyObj) => ({
      queryKey: [dependencyObj.queryKey],
      queryFn: () => axios.get(dependencyObj.healthCheckUrl, {
        headers: {
          accept: 'application/json'
        }
      })
        .then((response) => ({
          data: response.data,
          status: response.status,
          statusText: response.statusText, // Capture the status text (e.g., "OK")
          error: false
        })) // Return the data, status, and statusText if the request is successful
        .catch((error) => ({
          error: true,
          message: error.message,
          status: error.response ? error.response.status : 'Network Error',
          statusText: error.response ? error.response.statusText : 'Network Error', // Capture the status text
          details: error.response ? error.response.data : null
        })),
      retry: 0 // Disable automatic retries
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
