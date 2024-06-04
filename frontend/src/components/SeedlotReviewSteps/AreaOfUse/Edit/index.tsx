import React, { useContext, useEffect, useState } from 'react';
import {
  FlexGrid, Row, Column, ComboBox, TextInputSkeleton
} from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import Divider from '../../../Divider';
import SeedMapSection from '../SeedMapSection';
import { FilterObj, filterInput } from '../../../../utils/FilterUtils';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import { getSpzList } from '../../../../api-service/areaOfUseAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import { filterSpzListItem, spzListToMultiObj } from '../utils';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import { EmptyMultiOptObj } from '../../../../shared-constants/shared-constants';

const AreaOfUseEdit = () => {
  const {
    isFetchingData: isFetchingContextData, areaOfUseData,
    setAreaOfUseData
  } = useContext(ClassAContext);

  const spzListQuery = useQuery({
    queryKey: ['area-of-use', 'tested-parent-trees', 'spz-list'],
    queryFn: () => getSpzList(),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS,
    select: (data) => spzListToMultiObj(data)
  });

  const [isFetching, setIsFetching] = useState<boolean>(isFetchingContextData && spzListQuery.status === 'loading');

  useEffect(() => {
    if (spzListQuery.status === 'loading') {
      setIsFetching(true);
    } else {
      setIsFetching(isFetchingContextData);
    }
  }, [isFetchingContextData, spzListQuery.status]);

  const setPrimarySpz = (selected: MultiOptionsObj | null) => {
    let primarySpzToSet = selected;

    if (!selected) {
      primarySpzToSet = EmptyMultiOptObj;
    }

    setAreaOfUseData((prev) => ({
      ...prev,
      primarySpz: {
        ...prev.primarySpz,
        value: primarySpzToSet!,
        isInvalid: selected === null
      }
    }));
  };

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Seed Planning Zone(s) (SPZ)
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8} xlg={6}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <ComboBox
                  id={areaOfUseData.primarySpz.id}
                  items={
                    filterSpzListItem(
                      spzListQuery.data,
                      [areaOfUseData.primarySpz.value]
                        .concat(areaOfUseData.additionalSpzList.map((extraSpz) => extraSpz.value))
                    )
                  }
                  shouldFilterItem={
                    ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                  }
                  selectedItem={areaOfUseData.primarySpz.value}
                  placeholder="Select a seed plan zone"
                  titleText="Primary seed planning zone"
                  onChange={(e: ComboBoxEvent) => setPrimarySpz(e.selectedItem)}
                  invalid={areaOfUseData.primarySpz.isInvalid}
                  invalidText="Required"
                />
              )
          }
        </Column>
      </Row>
      <Divider />

      <SeedMapSection />
    </FlexGrid>
  );
};

export default AreaOfUseEdit;
