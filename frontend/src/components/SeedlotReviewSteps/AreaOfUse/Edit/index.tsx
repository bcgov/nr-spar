import React, { useContext, useEffect, useState } from 'react';
import {
  FlexGrid, Row, Column, ComboBox,
  Button, TextInputSkeleton
} from '@carbon/react';
import { useQuery } from '@tanstack/react-query';
import { Add } from '@carbon/icons-react';

import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { FilterObj, filterInput } from '../../../../utils/FilterUtils';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import { getSpzList } from '../../../../api-service/areaOfUseAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import { filterSpzListItem, spzListToMultiObj } from '../utils';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import { EmptyMultiOptObj } from '../../../../shared-constants/shared-constants';
import { OptionsInputType } from '../../../../types/FormInputType';
import { getOptionsInputObj } from '../../../../utils/FormInputUtils';
import Divider from '../../../Divider';

import AdditionalSpzItem from '../AddtionalSpzItem';
import SeedMapSection from '../SeedMapSection';

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

  const setAdditionalSpz = (oldSpz: OptionsInputType, newSpz: MultiOptionsObj | null) => {
    // Add the spz item if it does not exist
    const index = areaOfUseData.additionalSpzList.findIndex((spz) => spz.id === oldSpz.id);

    const areaOfUseClone = structuredClone(areaOfUseData);

    // if it exists then replace the value
    if (index > -1) {
      areaOfUseClone.additionalSpzList[index].value = newSpz ?? EmptyMultiOptObj;
      setAreaOfUseData(areaOfUseClone);
    }
  };

  const addEmptyAdditionalSpz = () => {
    const nextIndex = Math
      .max(...areaOfUseData.additionalSpzList.map((spz) => Number(spz.id.slice(-1)))) + 1;
    setAreaOfUseData((prev) => ({
      ...prev,
      additionalSpzList: [
        ...prev.additionalSpzList,
        getOptionsInputObj(`area-of-use-additional-spz-${nextIndex}`, EmptyMultiOptObj)
      ]
    }));
  };

  const deleteAdditionalSpz = (optionInputId: string) => {
    setAreaOfUseData((prev) => ({
      ...prev,
      additionalSpzList: prev.additionalSpzList.filter((spz) => spz.id !== optionInputId)
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
      {
        areaOfUseData.additionalSpzList
          .map((additionalSpz) => (
            <AdditionalSpzItem
              key={additionalSpz.id}
              spz={additionalSpz}
              dropDownItems={
                filterSpzListItem(
                  spzListQuery.data,
                  [areaOfUseData.primarySpz.value]
                    .concat(areaOfUseData.additionalSpzList.map((extraSpz) => extraSpz.value))
                )
              }
              setAdditionalSpz={setAdditionalSpz}
              deleteAdditionalSpz={deleteAdditionalSpz}
              isFetching={isFetching}
            />
          ))
      }
      <Row>
        <Column className="info-col">
          <Button
            kind="tertiary"
            renderIcon={Add}
            iconDescription="Delete this additional spz"
            onClick={addEmptyAdditionalSpz}
          >
            Add seed planning zone
          </Button>
        </Column>
      </Row>
      <Divider />

      <SeedMapSection />
    </FlexGrid>
  );
};

export default AreaOfUseEdit;
