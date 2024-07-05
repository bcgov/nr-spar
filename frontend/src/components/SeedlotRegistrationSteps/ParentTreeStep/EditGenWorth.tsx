import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import ReadOnlyInput from '../../ReadOnlyInput';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import { GenWorthValType } from '../../../views/Seedlot/SeedlotReview/definitions';

type EditGenWorthProps = {
  genWorthValues: InfoDisplayObj[][];
}

const EditGenWorth = ({ genWorthValues }: EditGenWorthProps) => {
  const {
    isCalculatingPt, genWorthVals, setGenWorthVal
  } = useContext(ClassAContext);

  const displayTextInput = (genObj: InfoDisplayObj) => {
    if (isCalculatingPt) {
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
        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
          const genWorthKeys = Object.keys(genWorthVals) as (keyof GenWorthValType)[];
          if (genWorthKeys.includes(genWorth)) {
            setGenWorthVal(genWorth, e.target.value);
          }
        }}
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
