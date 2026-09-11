import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Row, Column, FlexGrid
} from '@carbon/react';

import DetailSection from '../../../../../components/DetailSection';
import ReadOnlyInput from '../../../../../components/ReadOnlyInput';
import Divider from '../../../../../components/Divider';
import { SeedlotType } from '../../../../../types/SeedlotType';
import { PLACE_HOLDER } from '../../../../../shared-constants/shared-constants';
import getCaptureMethods from '../../../../../api-service/captureMethodsAPI';
import { getForestClientByNumberOrAcronym } from '../../../../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../../config/TimeUnits';
import { getMultiOptList } from '../../../../../utils/MultiOptionsUtils';
import { getForestClientLabel } from '../../../../../utils/ForestClientUtils';
import { utcToApStyle } from '../../../../../utils/DateUtils';
import {
  formatOptionalNumber,
  formatOptionalString
} from './utils';

import './styles.scss';

type CollectionInformationProps = {
  seedlot: SeedlotType,
  isFetching: boolean
};

const CollectionInformation = ({
  seedlot,
  isFetching
}: CollectionInformationProps) => {
  const clientNumber = seedlot.collectionClientNumber;

  const agencyQuery = useQuery({
    queryKey: ['forest-clients', 'collection', clientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(clientNumber),
    enabled: !!clientNumber,
    select: (fc) => getForestClientLabel(fc)
  });

  const captureMethodsQuery = useQuery({
    queryKey: ['capture-methods'],
    queryFn: getCaptureMethods,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const captureMethodDescription = captureMethodsQuery.data?.find(
    (method) => method.code === seedlot.captureMethodCode
  )?.description;

  const isLoading = isFetching || agencyQuery.isFetching;

  return (
    <DetailSection title="Collection information">
      <FlexGrid className="b-class-detail-section">
        <Row>
          <Column className="sub-section-title-col">
            Collector agency
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-collector-agency"
              label="Cone collector agency"
              value={agencyQuery.data ?? PLACE_HOLDER}
              showSkeleton={isLoading}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-collector-loc-code"
              label="Cone collector location code"
              value={formatOptionalString(seedlot.collectionLocationCode)}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>

        <Divider />

        <Row>
          <Column className="sub-section-title-col">
            Collection details
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-capture-method"
              label="Capture method"
              value={formatOptionalString(captureMethodDescription ?? seedlot.captureMethodCode)}
              showSkeleton={isFetching || captureMethodsQuery.isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-trees-from"
              label="Number of trees collected from"
              value={formatOptionalString(seedlot.numberTreesFromCode)}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-collection-start"
              label="Collection start date"
              value={seedlot.collectionStartDate
                ? utcToApStyle(seedlot.collectionStartDate)
                : PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-collection-end"
              label="Collection end date"
              value={seedlot.collectionEndDate
                ? utcToApStyle(seedlot.collectionEndDate)
                : PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-num-containers"
              label="Number of containers"
              value={formatOptionalNumber(seedlot.numberOfContainers)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-vol-per-container"
              label="Volume per container (hl)"
              value={formatOptionalNumber(seedlot.containerVolume)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-vol-cones"
              label="Volume of cones (hl)"
              value={formatOptionalNumber(seedlot.totalConeVolume)}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={8} lg={8}>
            <ReadOnlyInput
              id="b-detail-comments"
              label="Comments"
              value={formatOptionalString(seedlot.comment)}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>
      </FlexGrid>
    </DetailSection>
  );
};

export default CollectionInformation;
