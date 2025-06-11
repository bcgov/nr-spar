import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, TextInput, Column } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import ROUTES from "../../routes/constants";
import useWindowSize from "../../hooks/UseWindowSize";
import { MEDIUM_SCREEN_WIDTH } from "../../shared-constants/shared-constants";

import { addParamToPath } from "../../utils/PathUtils";
import focusById from "../../utils/FocusUtils";
import { isNumeric } from "../../utils/NumberUtils";

import "./styles.scss";

const SeedlotNavigator = () => {
  const navigate = useNavigate();
  const windowSize = useWindowSize();

  const [seedlotNumber, setSeedlotNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  return (
    <>
      <Column className="no-padding-col" sm={4} md={6} lg={12} xlg={12}>
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
              setErrorMessage("Numbers only");
              return;
            }

            setSeedlotNumber(e.target.value);
            setErrorMessage("");
          }}
          onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
        />
      </Column>
      <Column className="no-padding-col" sm={4} md={2} lg={4} xlg={4}>
        <Button
          className={`seedlot-nav-btn ${
            windowSize.innerWidth >= MEDIUM_SCREEN_WIDTH &&
            "seedlot-nav-btn-float-right"
          }`}
          kind="primary"
          size="md"
          renderIcon={ArrowRight}
          onClick={() => {
            if (seedlotNumber) {
              navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber));
            } else {
              setErrorMessage("Please enter a seedlot number");
              focusById("go-to-seedlot-input");
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
