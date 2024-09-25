import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button, TextInput, Column
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import ROUTES from '../../routes/constants';

import { addParamToPath } from '../../utils/PathUtils';
import focusById from '../../utils/FocusUtils';

const SeedlotNavigator = () => {
  const navigate = useNavigate();

  const [seedlotNumber, setSeedlotNumber] = useState<string>('');
  const [seedlotInputErr, setSeedlotInputErr] = useState<boolean>(false);

  return (
    <>
      <Column className="no-padding-col" sm={4} md={6} lg={14} xlg={14}>
        <TextInput
          id="go-to-seedlot-input"
          type="number"
          labelText=""
          placeholder="Enter seedlot number"
          value={seedlotNumber}
          invalid={seedlotInputErr}
          invalidText="Please, enter a seedlot number"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSeedlotInputErr(false);
            setSeedlotNumber(e.target.value);
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
              setSeedlotInputErr(true);
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
