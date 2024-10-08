import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import Divider from '../../../Divider';
import ReadOnlyInput from '../../../ReadOnlyInput';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import { getForestClientLabel } from '../../../../utils/ForestClientUtils';
import getConeCollectionMethod from '../../../../api-service/coneCollectionMethodAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';

import { formatCollectionMethods } from '../utils';
import GeoInfo from '../GeoInfo';

const CollectionReviewRead = () => {
  const {
    isFetchingData, allStepData, seedlotData
  } = useContext(ClassAContext);

  const clientNumber = seedlotData?.collectionClientNumber;

  const agencyQuery = useQuery(
    {
      queryKey: ['forest-clients', clientNumber],
      queryFn: () => getForestClientByNumberOrAcronym(clientNumber!),
      enabled: !!clientNumber,
      select: (fc) => getForestClientLabel(fc)
    }
  );

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

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
            id="collection-agency-name"
            label="Cone collector agency"
            value={agencyQuery.data}
            showSkeleton={isFetchingData || agencyQuery.fetchStatus === 'fetching'}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="applicant-and-seedlot-agency-loc-code"
            label="Cone collector location code"
            value={allStepData.collectionStep.locationCode.value}
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
            id="collection-start-date"
            label="Collection start date"
            value={allStepData.collectionStep.startDate.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-end-date"
            label="Collection end date"
            value={allStepData.collectionStep.endDate.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-num-of-containers"
            label="Number of containers"
            value={allStepData.collectionStep.numberOfContainers.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-vol-per-container"
            label="Volume per container (hl)"
            value={allStepData.collectionStep.volumePerContainers.value}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-vol-of-cones"
            label="Volume of cones (hl)"
            value={allStepData.collectionStep.volumeOfCones.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="collection-methods"
            label="Collection methods"
            value={
              formatCollectionMethods(
                allStepData.collectionStep.selectedCollectionCodes.value,
                coneCollectionMethodsQuery.data
              )
            }
            showSkeleton={isFetchingData || coneCollectionMethodsQuery.isFetching}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="collection-comments"
            label="Comments (optional)"
            value={allStepData.collectionStep.comments.value ?? 'No comment'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Divider />

      <GeoInfo />
    </FlexGrid>
  );
};

export default CollectionReviewRead;
