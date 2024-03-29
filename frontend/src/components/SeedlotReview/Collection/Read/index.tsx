import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { DateTime as luxon } from 'luxon';
import { useQuery } from '@tanstack/react-query';

import Divider from '../../../Divider';
import ReadOnlyInput from '../../../ReadOnlyInput';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { MONTH_DAY_YEAR } from '../../../../config/DateFormat';
import { getForestClientByNumber } from '../../../../api-service/forestClientsAPI';
import { getForestClientLabel } from '../../../../utils/ForestClientUtils';
import getConeCollectionMethod from '../../../../api-service/coneCollectionMethodAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import { formatCollectionMethods } from '../utils';

const CollectionReviewRead = () => {
  const {
    isFetchingData, allStepData, seedlotData, calculatedValues
  } = useContext(ClassAContext);

  const clientNumber = seedlotData?.collectionClientNumber;

  const agencyQuery = useQuery(
    {
      queryKey: ['forest-clients', clientNumber],
      queryFn: () => getForestClientByNumber(clientNumber!),
      enabled: !!clientNumber
    }
  );

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const formatGenWorthVals = (traitCode: string) => {
    let val = '--';
    const found = calculatedValues.find(
      (calculatedVal) => calculatedVal.traitCode.toLowerCase() === traitCode.toLowerCase()
    );

    if (found) {
      const { calculatedValue } = found;
      val = found.calculatedValue.toFixed(2);
      if (Number(calculatedValue) >= 0) {
        val = `+ ${val}`;
      } else {
        val = `- ${val}`;
      }
    }
    return val;
  };

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
            label="Cone collector agency name"
            value={agencyQuery.data ? getForestClientLabel(agencyQuery.data) : ''}
            showSkeleton={isFetchingData || agencyQuery.isFetching}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="applicant-and-seedlot-agency-loc-code"
            label="Cone collector agency number"
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
            value={
              luxon.fromISO(allStepData.collectionStep.startDate.value).toFormat(MONTH_DAY_YEAR)
            }
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-end-date"
            label="Collection end date"
            value={
              luxon.fromISO(allStepData.collectionStep.endDate.value).toFormat(MONTH_DAY_YEAR)
            }
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
                coneCollectionMethodsQuery.data!
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

      <Row>
        <Column className="sub-section-title-col">
          Geographic information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-bec-zone"
            label="BEC zone"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-sub-zone"
            label="Subzone"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-variant"
            label="Variant"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-description"
            label="Description"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-primary-spu"
            label="Primary seed planning unit"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-mean-elevation"
            label="Mean elevation of parent tree (m)"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-mean-lat"
            label="Mean latitude of parent tree"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-mean-long"
            label="Mean longitude of parent tree"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-effective-pop"
            label="Effective population size"
            value="--"
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Genetic worth
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-ad"
            label="Deer browse (AD)"
            value={formatGenWorthVals('ad')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-dfs"
            label="Dothistroma needle blight (DFS):"
            value={formatGenWorthVals('dfs')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-dfu"
            label="Cedar leaf blight (DFU):"
            value={formatGenWorthVals('dfu')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-dfw"
            label="Swiss needle cast (DFW):"
            value={formatGenWorthVals('dfw')}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-dsb"
            label="White pine blister rust (DSB):"
            value={formatGenWorthVals('dsb')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-dsc"
            label="Comandra blister rust (DSC):"
            value={formatGenWorthVals('dsc')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-dsg"
            label="Western gall rust (DSG)::"
            value={formatGenWorthVals('dsg')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-gvo"
            label="Volume growth(GVO):"
            value={formatGenWorthVals('gvo')}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-iws"
            label="White pine terminal weevil (IWS):"
            value={formatGenWorthVals('iws')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-wdu"
            label="Durability (WDU):"
            value={formatGenWorthVals('wdu')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-wve"
            label="Wood velocity measures (WVE):"
            value={formatGenWorthVals('wve')}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="gen-worth-wwd"
            label="Wood density (WWD):"
            value={formatGenWorthVals('WWD')}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

    </FlexGrid>
  );
};

export default CollectionReviewRead;
