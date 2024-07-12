import React, { useContext } from 'react';
import {
  Row, Column
} from '@carbon/react';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';
import ReadOnlyInput from '../../ReadOnlyInput';

const GeoInfo = () => {
  const {
    isFetchingData, seedlotData, richSeedlotData, seedlotSpecies
  } = useContext(ClassAContext);

  return (
    <>
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
            value={seedlotData ? `${seedlotData.bgcZoneCode} - ${seedlotData.bgcZoneDescription}` : PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-bec-sub-zone"
            label="Subzone"
            value={seedlotData?.bgcSubzoneCode ?? PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-bec-variant"
            label="Variant"
            value={seedlotData?.variant ?? PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-primary-spu"
            label="Primary seed planning unit"
            value={
              `${seedlotSpecies.code} ${richSeedlotData?.primarySpu?.seedPlanZoneCode} ${richSeedlotData?.primarySpu?.elevationBand}`
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
    </>
  );
};

export default GeoInfo;
