import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button, TextInput, Column
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import ROUTES from '../../routes/constants';

import { addParamToPath } from '../../utils/PathUtils';
import focusById from '../../utils/FocusUtils';
import { isNumeric } from '../../utils/NumberUtils';

const SeedlotNavigator = () => {
  const navigate = useNavigate();

  const [seedlotNumber, setSeedlotNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  return (
    <>
      <Column className="no-padding-col" sm={4} md={6} lg={14} xlg={14}>
        <TextInput
          id="go-to-seedlot-input"
          labelText=""
          placeholder="Enter seedlot number"
          value={seedlotNumber}
          invalid={!!errorMessage}
          invalidText={errorMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            if (inputValue && !isNumeric(inputValue)) {
              setErrorMessage('Numbers only');
              return;
            }

            setSeedlotNumber(e.target.value);
            setErrorMessage('');
          }}
          onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
        />
      </Column>
      <Column sm={4} md={2} lg={2} xlg={2}>
        <Button
          kind="primary"
          size="md"
          renderIcon={ArrowRight}
          onClick={() => {
            if (seedlotNumber) {
              navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber));
            } else {
              setErrorMessage('Please enter a seedlot number');
              focusById('go-to-seedlot-input');
            }
          }}
        >
          Go to seedlot
        </Button>
      </Column>
    </>
  );
};

export default SeedlotNavigator;
