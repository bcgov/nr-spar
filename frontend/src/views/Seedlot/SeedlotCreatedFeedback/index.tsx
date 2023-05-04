import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const seedlotNumber = useParams().seedlot;

  return (
    <FlexGrid fullWidth className="seedlot-created-feedback-page">
      <Row className="scf-row">
        <Column className="scf-pic-container">
          <Pictograms.Growth className="scf-pictogram" />
        </Column>
        <Column className="scf-info-container">
          <h1> A class seedlot created! </h1>
          <h2>
            Your A class seedlot
            {' '}
            {seedlotNumber}
            {' '}
            has been created with success!
            Now you can access the seedlot&apos;s detail screen,
            create another one or go back to the seedlot&apos;s main screen.
          </h2>
          <Button
            onClick={() => navigate(`/seedlot/details/${seedlotNumber}`)}
            size="lg"
            className="btn-scf"
          >
            Go to seedlot&apos;s detail screen
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
            Go back to seedlot&apos;s main screen
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default SeedlotCreatedFeedback;
