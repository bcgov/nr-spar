import React from 'react';
import { useNavigate } from 'react-router';
import {
  FlexGrid, Row, Column,
  Button
} from '@carbon/react';
import { Home } from '@carbon/icons-react';
import Error403 from '../../../assets/img/SPAR_403_error.svg';
import ROUTES from '../../../routes/constants';
import useWindowSize from '../../../hooks/UseWindowSize';
import { fourOhThreeTexts } from './constants';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';

import './styles.scss';

const FourOhThree = () => {
  const navigate = useNavigate();
  const windowSize = useWindowSize();

  return (
    <FlexGrid fullWidth className="four-oh-three-page">
      <Row className="four-oh-three-row">
        <Column sm={4} md={8} lg={6} xlg={6} max={8}>
          <img
            src={Error403}
            alt={fourOhThreeTexts.altText}
            className="four-oh-three-img"
          />
        </Column>
        <Column sm={4} md={8} lg={10} xlg={10} max={8}>
          <h1>
            {fourOhThreeTexts.title}
          </h1>
          {
            windowSize.innerWidth > MEDIUM_SCREEN_WIDTH
              ? (
                <p>
                  {fourOhThreeTexts.supportText1}
                </p>
              )
              : null
          }
          <p>
            {fourOhThreeTexts.supportText2}
          </p>
          <Button
            renderIcon={Home}
            size="lg"
            onClick={
              () => navigate(ROUTES.ROOT)
            }
          >
            {fourOhThreeTexts.buttonLabel}
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default FourOhThree;
