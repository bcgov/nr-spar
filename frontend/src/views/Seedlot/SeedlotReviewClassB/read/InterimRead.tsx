import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import ReadOnlyInput from '../../../../components/ReadOnlyInput';
import ClassBContext from '../../ContextContainerClassB/context';
import { getMultiOptList } from '../../../../utils/MultiOptionsUtils';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import getFacilityTypes from '../../../../api-service/facilityTypesAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import { getForestClientLabel } from '../../../../utils/ForestClientUtils';

const InterimRead = () => {
  const {
    isFetchingData, allStepData: { interimStep: state }
  } = useContext(ClassBContext);

  const clientNumber = state.agencyName.value;

  const agencyQuery = useQuery(
    {
      queryKey: ['forest-clients', clientNumber],
      queryFn: () => getForestClientByNumberOrAcronym(clientNumber),
      enabled: !!clientNumber,
      select: (fc) => getForestClientLabel(fc)
    }
  );

  const facilityTypesQuery = useQuery({
    queryKey: ['facility-types'],
    queryFn: getFacilityTypes,
    select: (data: any) => getMultiOptList(data),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const getFacilityTypeLabel = (interimType: string | null) => {
    if (facilityTypesQuery.data && interimType) {
      const selectedType = facilityTypesQuery.data.find((type) => type.code === interimType);
      return selectedType?.label ?? '';
    }
    return '';
  };

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Interim agency
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-interim-agency-name"
            label="Interim agency"
            value={agencyQuery.data}
            showSkeleton={isFetchingData || agencyQuery.fetchStatus === 'fetching'}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-interim-location-code"
            label="Interim agency location code"
            value={state.locationCode.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-interim-start-date"
            label="Storage start date"
            value={state.startDate.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-interim-end-date"
            label="Storage end date"
            value={state.endDate.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-interim-facility-type"
            label="Storage facility type"
            value={getFacilityTypeLabel(state.facilityType.value)}
            showSkeleton={isFetchingData || facilityTypesQuery.isFetching}
          />
        </Column>
      </Row>
      {
        state.facilityType.value === 'OTH'
          ? (
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="b-review-interim-other-type"
                  label="Storage facility description"
                  value={state.facilityOtherType.value}
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

export default InterimRead;
