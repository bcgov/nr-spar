import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FlexGrid,
  Column,
  Row,
  Button
} from '@carbon/react';
import { Growth } from '@carbon/pictograms-react';
import './styles.scss';

const SeedlotCreatedFeedback = () => {
  const navigate = useNavigate();
  const seedlotNumber = useParams().seedlot;

  return (
    <FlexGrid fullWidth className="seedlot-created-feedback-page">
      <Row className="scf-row">
        <Column className="scf-pic-container" sm={4} md={4} lg={6} xlg={6} max={6}>
          <Growth className="scf-pictogram" />
        </Column>
        <Column className="scf-info-container" sm={4} md={8} lg={10} xlg={10} max={10}>
          <FlexGrid>
            <Row>
              <Column>
                <h1> A class seedlot created! </h1>
              </Column>
            </Row>
            <Row>
              <Column>
                <h2>
                  Your A class seedlot
                  {' '}
                  {seedlotNumber}
                  {' '}
                  has been created with success!
                  Now you can access the seedlot&apos;s detail screen,
                  create another one or go back to the seedlot&apos;s main screen.
                </h2>
              </Column>
            </Row>
            <Row className="navigate-btn">
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                <Button
                  onClick={() => navigate(`/seedlot/details/${seedlotNumber}`)}
                  size="lg"
                  className="btn-scf"
                >
                  Go to seedlot&apos;s detail screen
                </Button>
              </Column>
            </Row>
            <Row>
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                <Button
                  kind="tertiary"
                  onClick={() => navigate('/seedlot/register-a-class')}
                  size="lg"
                  className="btn-scf"
                >
                  Create another A class seedlot
                </Button>
              </Column>
            </Row>
            <Row>
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
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
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default SeedlotCreatedFeedback;
