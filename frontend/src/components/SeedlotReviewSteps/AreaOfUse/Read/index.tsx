import React, { useContext } from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';

import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import ReadOnlyInput from '../../../ReadOnlyInput';
import { formatSpz, formatSpzList } from '../utils';

const AreaOfUseRead = () => {
  const {
    isFetchingData, richSeedlotData
  } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Seed Planning Zone(s) (SPZ)
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <ReadOnlyInput
            id="primary-spz-input-readonly"
            label="Primary seed planning zone"
            value={
              richSeedlotData?.priamrySpz
                ? formatSpz(richSeedlotData.priamrySpz)
                : ''
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <ReadOnlyInput
            id="additional-spz-input-readonly"
            label="Additional seed planning zone(s)"
            value={
              richSeedlotData?.additionalSpzList
                ? formatSpzList(richSeedlotData.additionalSpzList)
                : ''
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default AreaOfUseRead;
