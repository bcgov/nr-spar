import React, { useContext } from 'react';
import validator from 'validator';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import ReadOnlyInput from '../../ReadOnlyInput';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { GenWorthValType } from '../../../views/Seedlot/SeedlotReview/definitions';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import { isFloatWithinRange } from '../../../utils/NumberUtils';
import {
  MIN_VALUE_GEN_WORTH, MAX_VALUE_GEN_WORTH,
  MAX_DECIMAL_DIGITS, GEN_WORTH_ERR_MSG
} from './constants';
import { recordKeys } from '../../../utils/RecordUtils';

type EditGenWorthProps = {
  genWorthValues: InfoDisplayObj[][];
}

const EditGenWorth = ({ genWorthValues }: EditGenWorthProps) => {
  const {
    isCalculatingPt, genWorthVals, setGenWorthInputObj,
    isFetchingData, genWorthInfoItems, setGenWorthInfoItems
  } = useContext(ClassAContext);

  const genInfoItemsKeys = recordKeys(genWorthInfoItems);

  const handleInput = (key: keyof GenWorthValType, value: string | null) => {
    const newObj = structuredClone(genWorthVals[key]);

    newObj.value = value ?? '';

    if (value) {
      let isValid = isFloatWithinRange(value, MIN_VALUE_GEN_WORTH, MAX_VALUE_GEN_WORTH);
      if (isValid) {
        isValid = validator.isDecimal(value, { decimal_digits: `0,${MAX_DECIMAL_DIGITS}` });
      }
      newObj.isInvalid = !isValid;

      if (!isValid) {
        newObj.errMsg = GEN_WORTH_ERR_MSG;
      }
    }

    if (genInfoItemsKeys.includes(key)) {
      const clonedInfoItems = structuredClone(genWorthInfoItems);
      clonedInfoItems[key][0].value = value ?? '';
      setGenWorthInfoItems(clonedInfoItems);
    }

    setGenWorthInputObj(key, newObj);
  };

  const displayTextInput = (genObj: InfoDisplayObj) => {
    if (isCalculatingPt || isFetchingData) {
      return <TextInputSkeleton />;
    }
    const strArray = genObj.name.split(' ');
    const genWorth = strArray[strArray.length - 1].toLowerCase() as keyof GenWorthValType;

    return (
      <TextInput
        id={`gen-worth-${genWorth}`}
        labelText={genObj.name}
        defaultValue={genObj.value}
        type="number"
        onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
          const genWorthKeys = Object.keys(genWorthVals) as (keyof GenWorthValType)[];
          if (genWorthKeys.includes(genWorth)) {
            handleInput(genWorth, e.target.value);
          }
        }}
        invalid={genWorthVals[genWorth].isInvalid}
        invalidText={genWorthVals[genWorth].errMsg}
      />
    );
  };

  return (
    genWorthValues.map((genTuple) => (
      <Row key={genTuple[0].name}>
        {
          genTuple.map((genField) => (
            <Column key={`${genField.name.toLowerCase().replace(' ', '')}-key`} className="info-col" sm={4} md={4} lg={4}>
              {
                genField.name.includes('%')
                  ? (
                    <ReadOnlyInput
                      id={genField.name.toLowerCase().replace(' ', '')}
                      label={genField.name}
                      value={genField.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    displayTextInput(genField)
                  )
              }
            </Column>
          ))
        }
      </Row>
    ))
  );
};

export default EditGenWorth;
