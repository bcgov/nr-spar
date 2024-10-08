import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import Divider from '../../../Divider';
import ReadOnlyInput from '../../../ReadOnlyInput';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import { getForestClientLabel } from '../../../../utils/ForestClientUtils';

const ExtractionStorageReviewRead = () => {
  const {
    isFetchingData, allStepData: { extractionStorageStep: state }
  } = useContext(ClassAContext);

  const extractClientQuery = useQuery({
    queryKey: ['forest-clients', state.extraction.agency.value],
    queryFn: () => getForestClientByNumberOrAcronym(state.extraction.agency.value),
    enabled: !!state.extraction.agency.value,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS,
    select: (client) => getForestClientLabel(client)
  });

  const storageClientQuery = useQuery({
    queryKey: ['forest-clients', state.seedStorage.agency.value],
    queryFn: () => getForestClientByNumberOrAcronym(state.seedStorage.agency.value),
    enabled: !!state.seedStorage.agency.value,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS,
    select: (client) => getForestClientLabel(client)
  });

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Extraction information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="extraction-agency-name"
            label="Extractory agency"
            value={extractClientQuery.data}
            showSkeleton={isFetchingData || extractClientQuery.fetchStatus === 'fetching'}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="extraction-agency-loc-code"
            label="Extractory agency location code"
            value={state.extraction.locationCode.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {
        state.extraction.startDate.value && state.extraction.endDate.value
          ? (
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="extraction-start-date"
                  label="Extraction start date"
                  value={state.extraction.startDate.value}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="extraction-end-date"
                  label="Extraction end date"
                  value={state.extraction.endDate.value}
                  showSkeleton={isFetchingData}
                />
              </Column>
            </Row>
          )
          : null
      }

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Temporary seed storage
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="storage-agency-name"
            label="Seed storage agency"
            value={storageClientQuery.data}
            showSkeleton={isFetchingData || storageClientQuery.fetchStatus === 'fetching'}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="storage-agency-loc-code"
            label="Seed storage location code"
            value={state.seedStorage.locationCode.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {
        state.seedStorage.startDate.value && state.seedStorage.endDate.value
          ? (
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="storage-start-date"
                  label="Storage start date"
                  value={state.seedStorage.startDate.value}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="storage-end-date"
                  label="Storage end date"
                  value={state.seedStorage.endDate.value}
                  showSkeleton={isFetchingData}
                />
              </Column>
            </Row>
          )
          : null
      }
    </FlexGrid>
  );
};

export default ExtractionStorageReviewRead;
