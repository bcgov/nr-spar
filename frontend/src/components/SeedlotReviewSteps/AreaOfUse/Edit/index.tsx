import React, { useContext, useEffect, useState } from 'react';
import {
  FlexGrid, Row, Column, ComboBox,
  Button, TextInputSkeleton, TextInput,
  TextArea
} from '@carbon/react';
import { useQuery } from '@tanstack/react-query';
import { Add } from '@carbon/icons-react';

import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { AreaOfUseDataType } from '../../../../views/Seedlot/ContextContainerClassA/definitions';
import { FilterObj, filterInput } from '../../../../utils/FilterUtils';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import { getSpzList } from '../../../../api-service/areaOfUseAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import { EmptyMultiOptObj } from '../../../../shared-constants/shared-constants';
import { OptionsInputType, StringInputType } from '../../../../types/FormInputType';
import { getOptionsInputObj } from '../../../../utils/FormInputUtils';
import Divider from '../../../Divider';
import {
  filterSpzListItem, spzListToMultiObj,
  validateDegreeRange, validateElevatioRange,
  validateMinMaxPair, validateMinuteOrSecondRange
} from '../utils';
import AdditionalSpzItem from '../AddtionalSpzItem';
import SeedMapSection from '../SeedMapSection';
import { COMMENT_ERR_MSG, MAX_COMMENT_LENGTH } from '../constants';

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

  const setMinMaxInputs = (
    minKey: keyof AreaOfUseDataType,
    minObj: StringInputType,
    maxKey: keyof AreaOfUseDataType,
    maxObj: StringInputType
  ) => {
    setAreaOfUseData((prev) => ({
      ...prev,
      [minKey]: minObj,
      [maxKey]: maxObj
    }));
  };

  const handleMinMaxInput = (
    value: string,
    isMin: boolean,
    minKey: keyof AreaOfUseDataType,
    maxKey: keyof AreaOfUseDataType
  ) => {
    const minObj = areaOfUseData[minKey] as StringInputType;
    const maxObj = areaOfUseData[maxKey] as StringInputType;

    if (isMin) {
      minObj.value = value ?? '';
    } else {
      maxObj.value = value ?? '';
    }

    let rangeValidator: (inputObj: StringInputType) => StringInputType;

    if (minKey === 'minElevation') {
      rangeValidator = validateElevatioRange;
    }
    if (minKey === 'minLatDeg' || minKey === 'minLongDeg') {
      rangeValidator = validateDegreeRange;
    }
    if (minKey === 'minLatMinute' || minKey === 'minLongMinute' || minKey === 'minLatSec' || minKey === 'minLongSec') {
      rangeValidator = validateMinuteOrSecondRange;
    }

    const validatedTuple = validateMinMaxPair(minObj, maxObj, rangeValidator!);

    setMinMaxInputs(
      minKey,
      validatedTuple.minReturnObj,
      maxKey,
      validatedTuple.maxReturnObj
    );
  };

  const handleCommentInput = (value: string) => {
    const { comment } = areaOfUseData;
    // Comment length will most likely not exceed the TextArea's max count
    // but we do the check here just in case
    comment.isInvalid = value.length > MAX_COMMENT_LENGTH;
    if (comment.isInvalid) {
      return;
    }
    comment.value = value ?? '';

    setAreaOfUseData((prev) => ({
      ...prev,
      comment
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

      <Row>
        <Column className="sub-section-title-col">
          Elevation, Latitude and Longitude
        </Column>
      </Row>

      <Row>
        <Column className="info-col" sm={2} md={4} lg={4}>
          <TextInput
            id={areaOfUseData.minElevation.id}
            type="number"
            labelText="Minimum elevation (m):"
            defaultValue={areaOfUseData.minElevation.value}
            invalid={areaOfUseData.minElevation.isInvalid}
            invalidText={areaOfUseData.minElevation.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, true, 'minElevation', 'maxElevation')
            )}
          />
        </Column>
        <Column className="info-col" sm={2} md={4} lg={4}>
          <TextInput
            id={areaOfUseData.maxElevation.id}
            type="number"
            labelText="Maximum elevation (m):"
            defaultValue={areaOfUseData.maxElevation.value}
            invalid={areaOfUseData.maxElevation.isInvalid}
            invalidText={areaOfUseData.maxElevation.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, false, 'minElevation', 'maxElevation')
            )}
          />
        </Column>
      </Row>
      {/* Min Latitude */}
      <Row>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.minLatDeg.id}
            type="number"
            labelText="Minimum latitude degree (°)"
            defaultValue={areaOfUseData.minLatDeg.value}
            invalid={areaOfUseData.minLatDeg.isInvalid}
            invalidText={areaOfUseData.minLatDeg.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, true, 'minLatDeg', 'maxLatDeg')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.minLatMinute.id}
            type="number"
            labelText="minute (')"
            defaultValue={areaOfUseData.minLatMinute.value}
            invalid={areaOfUseData.minLatMinute.isInvalid}
            invalidText={areaOfUseData.minLatMinute.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, true, 'minLatMinute', 'maxLatMinute')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.minLatSec.id}
            type="number"
            labelText='second (")'
            defaultValue={areaOfUseData.minLatSec.value}
            invalid={areaOfUseData.minLatSec.isInvalid}
            invalidText={areaOfUseData.minLatSec.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, true, 'minLatSec', 'maxLatSec')
            )}
          />
        </Column>
      </Row>
      {/* Max Latitude */}
      <Row>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.maxLatDeg.id}
            type="number"
            labelText="Maximum latitude degree (°)"
            defaultValue={areaOfUseData.maxLatDeg.value}
            invalid={areaOfUseData.maxLatDeg.isInvalid}
            invalidText={areaOfUseData.maxLatDeg.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, false, 'minLatDeg', 'maxLatDeg')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.maxLatMinute.id}
            type="number"
            labelText="minute (')"
            defaultValue={areaOfUseData.maxLatMinute.value}
            invalid={areaOfUseData.maxLatMinute.isInvalid}
            invalidText={areaOfUseData.maxLatMinute.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, false, 'minLatMinute', 'maxLatMinute')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.maxLatSec.id}
            type="number"
            labelText='second (")'
            defaultValue={areaOfUseData.maxLatSec.value}
            invalid={areaOfUseData.maxLatSec.isInvalid}
            invalidText={areaOfUseData.maxLatSec.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, false, 'minLatSec', 'maxLatSec')
            )}
          />
        </Column>
      </Row>
      {/* Min Longitude */}
      <Row>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.minLongDeg.id}
            type="number"
            labelText="Minimum longitude degree (°)"
            defaultValue={areaOfUseData.minLongDeg.value}
            invalid={areaOfUseData.minLongDeg.isInvalid}
            invalidText={areaOfUseData.minLongDeg.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, true, 'minLongDeg', 'maxLongDeg')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.minLongMinute.id}
            type="number"
            labelText="minute (')"
            defaultValue={areaOfUseData.minLongMinute.value}
            invalid={areaOfUseData.minLongMinute.isInvalid}
            invalidText={areaOfUseData.minLongMinute.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, true, 'minLongMinute', 'maxLongMinute')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.minLongSec.id}
            type="number"
            labelText='second (")'
            defaultValue={areaOfUseData.minLongSec.value}
            invalid={areaOfUseData.minLongSec.isInvalid}
            invalidText={areaOfUseData.minLongSec.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, true, 'minLongSec', 'maxLongSec')
            )}
          />
        </Column>
      </Row>
      {/* Max Longitude */}
      <Row>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.maxLongDeg.id}
            type="number"
            labelText="Maximum longitude degree (°)"
            defaultValue={areaOfUseData.maxLongDeg.value}
            invalid={areaOfUseData.maxLongDeg.isInvalid}
            invalidText={areaOfUseData.maxLongDeg.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, false, 'minLongDeg', 'maxLongDeg')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.maxLongMinute.id}
            type="number"
            labelText="minute (')"
            defaultValue={areaOfUseData.maxLongMinute.value}
            invalid={areaOfUseData.maxLongMinute.isInvalid}
            invalidText={areaOfUseData.maxLongMinute.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, false, 'minLongMinute', 'maxLongMinute')
            )}
          />
        </Column>
        <Column className="info-col" sm={4} md={8} lg={4}>
          <TextInput
            id={areaOfUseData.maxLongSec.id}
            type="number"
            labelText='second (")'
            defaultValue={areaOfUseData.maxLongSec.value}
            invalid={areaOfUseData.maxLongSec.isInvalid}
            invalidText={areaOfUseData.maxLongSec.errMsg}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleMinMaxInput(e.target.value, false, 'minLongSec', 'maxLongSec')
            )}
          />
        </Column>
      </Row>

      <Row>
        <Column className="info-col" sm={4} md={8} lg={12}>
          <TextArea
            id={areaOfUseData.comment.id}
            labelText="Area of use comment"
            enableCounter
            maxCount={MAX_COMMENT_LENGTH}
            defaultValue={areaOfUseData.comment.value}
            invalid={areaOfUseData.comment.isInvalid}
            invalidText={COMMENT_ERR_MSG}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => (
              handleCommentInput(e.target.value)
            )}
          />
        </Column>
      </Row>

      <Divider />

      <SeedMapSection />
    </FlexGrid>
  );
};

export default AreaOfUseEdit;
