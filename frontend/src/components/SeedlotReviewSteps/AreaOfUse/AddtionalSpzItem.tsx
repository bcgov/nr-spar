import React from 'react';
import {
  Row, Column, Button,
  ComboBox, TextInputSkeleton
} from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import { AdditionalSpzItemProps } from './definitions';
import { FilterObj, filterInput } from '../../../utils/FilterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';

const AdditionalSpzItem = (
  {
    spz, dropDownItems, isFetching, setAdditionalSpz, deleteAdditionalSpz
  }: AdditionalSpzItemProps
) => (
  <Row>
    <Column className="info-col" sm={4} md={8} lg={8} xlg={6}>
      {
        isFetching
          ? <TextInputSkeleton />
          : (
            <div className="additional-spz-combobox-and-button">
              <ComboBox
                id={spz.id}
                items={dropDownItems}
                shouldFilterItem={
                  ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                }
                selectedItem={spz.value}
                placeholder="Select a seed plan zone"
                titleText="Additional seed planning zone(s)"
                onChange={(e: ComboBoxEvent) => setAdditionalSpz(spz, e.selectedItem)}
                invalid={spz.isInvalid}
                invalidText="Required"
              />
              <Button
                hasIconOnly
                kind="danger--tertiary"
                renderIcon={TrashCan}
                iconDescription="Delete this additional spz"
                onClick={
                  () => deleteAdditionalSpz(spz.id)
                }
              />
            </div>
          )
      }
    </Column>
  </Row>
);

export default AdditionalSpzItem;
