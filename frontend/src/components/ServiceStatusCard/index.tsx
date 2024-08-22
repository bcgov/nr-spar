import React from 'react';
import { Row, Column, Loading } from '@carbon/react';
import { useQueryClient } from '@tanstack/react-query';
import * as Icons from '@carbon/icons-react';

import { DependencyDefinition } from '../../views/ServiceStatus/definitions';

import './styles.scss';

type ServiceStatusCardProps = {
  dependencyObj: DependencyDefinition
}

const ServiceStatusCard = ({ dependencyObj } : ServiceStatusCardProps) => {
  const qc = useQueryClient();

  const { CheckmarkFilled, ErrorFilled } = Icons;
  const Icon = Icons[dependencyObj.icon];

  return (
    <Row className="service-status-row">
      <Column className="service-status-col">
        <div className="top-section">
          <div className="title-and-icon">
            <Icon
              className={
                qc.getQueryState([dependencyObj.queryKey])?.status === 'error' ? 'dep-icon-error' : 'dep-icon'
              }
            />
            <h4>
              {dependencyObj.name}
            </h4>
          </div>

          <div>
            {
              qc.getQueryState([dependencyObj.queryKey])?.status === 'success'
              && qc.getQueryState([dependencyObj.queryKey])?.fetchStatus !== 'fetching'
                ? <CheckmarkFilled className="success-svg" />
                : null
            }
            {
              qc.getQueryState([dependencyObj.queryKey])?.fetchStatus === 'fetching'
                ? <Loading small withOverlay={false} />
                : null
            }
            {
              qc.getQueryState([dependencyObj.queryKey])?.status === 'error'
              && qc.getQueryState([dependencyObj.queryKey])?.fetchStatus !== 'fetching'
                ? <ErrorFilled className="error-svg" />
                : null
            }
          </div>
        </div>
        <div>
          {
            qc.getQueryState([dependencyObj.queryKey])?.status === 'success'
              ? 'Normal'
              : null
          }
          {
            qc.getQueryState([dependencyObj.queryKey])?.status === 'error'
              ? 'Down'
              : null
          }
        </div>
      </Column>
    </Row>
  );
};

export default ServiceStatusCard;
