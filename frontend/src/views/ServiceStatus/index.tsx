import React, { useContext } from 'react';
import {
  FlexGrid, Row, Column,
  Header, SkipToContent,
  InlineNotification, Button
} from '@carbon/react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Home } from '@carbon/icons-react';

import { componentTexts } from '../../components/BCHeader/constants';
import ServiceStatusCard from '../../components/ServiceStatusCard';
import { FIFTEEN_SECONDS } from '../../config/TimeUnits';
import AuthContext from '../../contexts/AuthContext';

import { SPAR_DEPENDENCIES } from './constants';
import './styles.scss';

const ServiceStatus = () => {
  const statusQueries = useQueries({
    queries: SPAR_DEPENDENCIES.map((dependencyObj) => ({
      queryKey: [dependencyObj.queryKey],
      queryFn: () => fetch(dependencyObj.healthCheckUrl, { mode: 'no-cors' }),
      refetchInterval: FIFTEEN_SECONDS,
      refetchIntervalInBackground: false,
      retry: 0
    }))
  });

  const navigate = useNavigate();

  const { signed } = useContext(AuthContext);

  return (
    <>
      <Header
        aria-label={componentTexts.completeTitle}
        className="spar-header"
      >
        <SkipToContent />
        <Link to="/" className="header-link">
          {componentTexts.headerTitle}
          <span className="header-full-name">{`${componentTexts.completeTitle}`}</span>
        </Link>
      </Header>

      <FlexGrid className="status-page-grid">
        <Row>
          <Column>
            <h3 className="title">
              SPAR Dependency Status
            </h3>
          </Column>
        </Row>
        {
          statusQueries.filter((query) => query.status === 'error').length > 0
            ? (
              <Row className="status-page-row">
                <Column className="notificatione-col">
                  <InlineNotification
                    className="status-notification"
                    lowContrast
                    kind="warning"
                    statusIconDescription="notification"
                    subtitle={
                      `${statusQueries.filter((query) => query.status === 'error').length} out of
                       ${SPAR_DEPENDENCIES.length} service${SPAR_DEPENDENCIES.length > 0 ? 's' : ''}
                       are down.
                      `
                    }
                    /*
                     * It's grammatically incorrect to use 'is' for singluar subject
                     * e.g. 1 out of 4 IS down
                     * The original correct implementation was
                     * ${statusQueries.filter((query) => query.status === 'error')
                     *      .length > 1 ? 'are' : 'is'}
                     * But UX wanted it to be ARE 🤷
                     */
                    title="SPAR Dependency Failure: "
                    hideCloseButton
                  />
                </Column>
              </Row>
            )
            : (
              <Row className="status-page-row">
                <Column className="notificatione-col">
                  <InlineNotification
                    className="status-notification"
                    lowContrast
                    kind="success"
                    statusIconDescription="notification"
                    title="All systems operational!"
                    hideCloseButton
                  />
                </Column>
              </Row>
            )
        }
        {
          SPAR_DEPENDENCIES.map((dependencyObj) => (
            <ServiceStatusCard key={dependencyObj.queryKey} dependencyObj={dependencyObj} />
          ))
        }

        {
          signed
            ? (
              <Row className="status-page-row">
                <Column className="button-col">
                  <Button kind="primary" size="lg" renderIcon={Home} onClick={() => navigate('/')}>
                    Return to main page
                  </Button>
                </Column>
              </Row>
            )
            : null
        }
      </FlexGrid>
    </>

  );
};

export default ServiceStatus;
