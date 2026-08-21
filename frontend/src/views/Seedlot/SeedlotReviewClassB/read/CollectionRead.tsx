import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import Divider from '../../../../components/Divider';
import ReadOnlyInput from '../../../../components/ReadOnlyInput';
import ClassBContext from '../../ContextContainerClassB/context';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import { getForestClientLabel } from '../../../../utils/ForestClientUtils';
import getConeCollectionMethod from '../../../../api-service/coneCollectionMethodAPI';
import getCaptureMethods from '../../../../api-service/captureMethodsAPI';
import getNumberTreesCollected from '../../../../api-service/numberTreesCollectedAPI';
import getOrgUnitDistricts from '../../../../api-service/orgUnitDistrictsAPI';
import { getMultiOptList } from '../../../../utils/MultiOptionsUtils';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import { formatCollectionMethods } from '../../../../components/SeedlotReviewSteps/Collection/utils';

import { formatDms } from '../utils';

const CollectionRead = () => {
  const {
    allStepData: { collectionStep: state }, isFetchingData
  } = useContext(ClassBContext);

  const clientNumber = state.collectorAgency.value;

  const agencyQuery = useQuery({
    queryKey: ['forest-clients', clientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(clientNumber),
    enabled: !!clientNumber,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (fc) => getForestClientLabel(fc)
  });

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const captureMethodsQuery = useQuery({
    queryKey: ['capture-methods'],
    queryFn: getCaptureMethods,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const numberTreesQuery = useQuery({
    queryKey: ['number-trees-collected'],
    queryFn: getNumberTreesCollected,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const orgUnitQuery = useQuery({
    queryKey: ['org-unit-districts'],
    queryFn: getOrgUnitDistricts,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const orgUnitLabel = (() => {
    const { code } = state.orgUnit.value;
    if (!code) {
      return '';
    }
    const found = orgUnitQuery.data?.find((unit) => String(unit.orgUnitNo) === code);
    return found ? `${found.orgUnitCode} - ${found.orgUnitName}` : code;
  })();

  const captureMethodLabel = captureMethodsQuery.data?.find(
    (opt) => opt.code === state.captureMethod.value.code
  )?.description ?? state.captureMethod.value.code;

  const numberTreesLabel = numberTreesQuery.data?.find(
    (opt) => opt.code === state.numberTreesFrom.value.code
  )?.description ?? state.numberTreesFrom.value.code;

  const becLabel = (code: string, description?: string) => (
    description ? `${code} - ${description}` : code
  );

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Collector agency
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-collector-agency"
            label="Cone collector agency"
            value={agencyQuery.data}
            showSkeleton={isFetchingData || agencyQuery.fetchStatus === 'fetching'}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-collector-loc-code"
            label="Cone collector location code"
            value={state.locationCode.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Collection information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-org-unit"
            label="Collection org unit"
            value={orgUnitLabel}
            showSkeleton={isFetchingData || orgUnitQuery.isFetching}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-location-area"
            label="Location area"
            value={state.locationArea.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-collection-radius"
            label="Radius of collection area (km)"
            value={state.collectionRadius.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-elevation-min"
            label="Minimum elevation (m)"
            value={state.elevationMin.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-elevation-max"
            label="Maximum elevation (m)"
            value={state.elevationMax.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-elevation-mean"
            label="Mean elevation (m)"
            value={state.elevationMean.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-capture-method"
            label="Capture method"
            value={captureMethodLabel}
            showSkeleton={isFetchingData || captureMethodsQuery.isFetching}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-collection-start-date"
            label="Collection start date"
            value={state.startDate.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-collection-end-date"
            label="Collection end date"
            value={state.endDate.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-num-containers"
            label="Number of containers"
            value={state.numberOfContainers.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-vol-per-container"
            label="Volume per container (hl)"
            value={state.volumePerContainers.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-vol-of-cones"
            label="Volume of cones (hl)"
            value={state.volumeOfCones.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="b-review-collection-methods"
            label="Collection methods"
            value={
              formatCollectionMethods(
                state.selectedCollectionCodes.value,
                coneCollectionMethodsQuery.data
              )
            }
            showSkeleton={isFetchingData || coneCollectionMethodsQuery.isFetching}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-number-trees-from"
            label="Number of trees collected from"
            value={numberTreesLabel}
            showSkeleton={isFetchingData || numberTreesQuery.isFetching}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="b-review-collection-comments"
            label="Comments (optional)"
            value={state.comments.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Geographic information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-collection-lat"
            label="Collection latitude mean"
            value={formatDms(state.latDeg.value, state.latMin.value, state.latSec.value)}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-collection-long"
            label="Collection longitude mean"
            value={formatDms(state.longDeg.value, state.longMin.value, state.longSec.value)}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-bec-zone"
            label="BEC zone"
            value={
              becLabel(state.becZone.value.code, state.becZone.value.description)
            }
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-bec-subzone"
            label="Subzone"
            value={
              becLabel(state.becSubzone.value.code, state.becSubzone.value.description)
            }
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-bec-variant"
            label="Variant"
            value={
              state.becVariant.value.code
                ? becLabel(state.becVariant.value.code, state.becVariant.value.description)
                : 'None'
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="b-review-same-bec-unit"
            label="Collection is all from within the same BEC unit?"
            value={state.sameBecUnit.value ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default CollectionRead;
