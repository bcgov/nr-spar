import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexGrid,
  Column,
  Row,
  Button
} from '@carbon/react';
import * as Pictograms from '@carbon/pictograms-react';
import './styles.scss';

const SeedlotCreatedFeedback = () => {
  const navigate = useNavigate();

  return (
    <FlexGrid fullWidth className="seedlot-created-feedback-page">
      <Row className="scf-row">
        <Column className="scf-pic-container">
          <Pictograms.Growth className="scf-pictogram" />
        </Column>
        <Column className="scf-info-container">
          <h1> A class seedlot created! </h1>
          <h2>
            Your A class seedlot has been created with success!
            Now you can access the seedlot's detail screen,
            create another one or go back to the seedlot's main screen.
          </h2>
          <Button
            onClick={() => null}
            size="lg"
            className="btn-scf"
          >
            Go to seedlot's detail screen
          </Button>
          <Button
            kind="tertiary"
            onClick={() => navigate('/seedlot/register-a-class')}
            size="lg"
            className="btn-scf"
          >
            Create another A class seedlot
          </Button>
          <Button
            kind="tertiary"
            onClick={() => navigate('/seedlot')}
            size="lg"
            className="btn-scf"
          >
            Go back to seedlot's main screen
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default SeedlotCreatedFeedback;
