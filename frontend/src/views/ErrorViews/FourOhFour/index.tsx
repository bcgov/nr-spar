import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexGrid, Row, Column,
  Button
} from '@carbon/react';
import { Home } from '@carbon/icons-react';
import Error404 from '../../../assets/img/SPAR_404_error.svg';
import ROUTES from '../../../routes/constants';
import useWindowSize from '../../../hooks/UseWindowSize';
import { fourOhFourTexts } from './constants';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';

import './styles.scss';

const FourOhFour = () => {
  const navigate = useNavigate();
  const windowSize = useWindowSize();

  return (
    <FlexGrid fullWidth className="four-oh-four-page">
      <Row className="four-oh-four-row">
        <Column sm={4} md={8} lg={6} xlg={6} max={8}>
          <img
            src={Error404}
            alt={fourOhFourTexts.altText}
            className="four-oh-four-img"
          />
        </Column>
        <Column sm={4} md={8} lg={10} xlg={10} max={8}>
          <h1>
            {fourOhFourTexts.title}
          </h1>
          {
            windowSize.innerWidth > MEDIUM_SCREEN_WIDTH
              ? (
                <p>
                  {fourOhFourTexts.supportText1}
                </p>
              )
              : null
          }
          <p>
            {fourOhFourTexts.supportText2}
          </p>
          <Button
            renderIcon={Home}
            size="lg"
            onClick={
              () => navigate(ROUTES.ROOT)
            }
          >
            {fourOhFourTexts.buttonLabel}
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default FourOhFour;
