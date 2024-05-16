import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { DateTime as luxon } from 'luxon';
import { useQuery } from '@tanstack/react-query';

import ReadOnlyInput from '../../../ReadOnlyInput';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { getMultiOptList } from '../../../../utils/MultiOptionsUtils';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import getFacilityTypes from '../../../../api-service/facilityTypesAPI';
import { MONTH_DAY_YEAR } from '../../../../config/DateFormat';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';

const InterimReviewRead = () => {
  const {
    isFetchingData, allStepData: { interimStep: state }, seedlotData
  } = useContext(ClassAContext);

  const clientNumber = seedlotData?.interimStorageClientNumber;

  const agencyQuery = useQuery(
    {
      queryKey: ['forest-clients', clientNumber],
      queryFn: () => getForestClientByNumberOrAcronym(clientNumber!),
      enabled: !!clientNumber
    }
  );

  const facilityTypesQuery = useQuery({
    queryKey: ['facility-types'],
    queryFn: getFacilityTypes,
    select: (data: any) => getMultiOptList(data),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const getFacilityTypeLabel = (interimType: string) => {
    if (facilityTypesQuery.data) {
      const selectedType = facilityTypesQuery.data.filter((type) => type.code === interimType);
      return selectedType[0].label;
    }
    return '';
  };

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Interim storage
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="interim-agency-name"
            label="Interim agency acronym"
            value={agencyQuery.data ? agencyQuery.data.acronym : ''}
            showSkeleton={isFetchingData || agencyQuery.isFetching}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="interim-location-code"
            label="Interim agency location code"
            value={state.locationCode.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="interim-start-date"
            label="Storage start date"
            value={luxon.fromISO(state.startDate.value.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="interim-end-date"
            label="Storage end date"
            value={luxon.fromISO(state.endDate.value.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="interim-facility-type"
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
                  id="interim-other-type"
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

export default InterimReviewRead;
