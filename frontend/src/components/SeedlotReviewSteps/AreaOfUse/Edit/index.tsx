import React, { useContext } from 'react';
import {
  FlexGrid, Row, Column, ComboBox
} from '@carbon/react';

import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import Divider from '../../../Divider';
import SeedMapSection from '../SeedMapSection';
import { FilterObj, filterInput } from '../../../../utils/FilterUtils';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';

const AreaOfUseEdit = () => {
  const {
    isFetchingData, richSeedlotData
  } = useContext(ClassAContext);

  const spzListQuery = useQuery();

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Seed Planning Zone(s) (SPZ)
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8} xlg={6}>
          <ComboBox
            className=""
            items={[]}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            selectedItem={null}
            placeholder="Select a seed plan zone"
            titleText="Primary seed planning zone"
            onChange={(e: ComboBoxEvent) => null}
          // invalid={seedlotFormData.species.isInvalid}
          // invalidText={speciesFieldConfig.invalidText}
          // helperText={vegCodeQuery.isError ? '' : speciesFieldConfig.helperText}
          // readOnly={isEdit}
          />
        </Column>
      </Row>
      <Divider />

      <SeedMapSection />
    </FlexGrid>
  );
};

export default AreaOfUseEdit;
