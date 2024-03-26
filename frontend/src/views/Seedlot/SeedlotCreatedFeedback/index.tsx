import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FlexGrid,
  Column,
  Row,
  Button
} from '@carbon/react';
import { Growth } from '@carbon/pictograms-react';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';

import './styles.scss';

const SeedlotCreatedFeedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const seedlotNumber = searchParams.get('seedlotNumber');
  const seedlotClass = searchParams.get('seedlotClass');

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
                <h1>
                  {seedlotClass}
                  -class
                  {' '}
                  {seedlotNumber}
                  {' '}
                  seedlot created
                </h1>
              </Column>
            </Row>
            <Row className="navigate-btn">
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                <Button
                  onClick={() => {
                    if (seedlotClass === 'A') {
                      navigate(addParamToPath(ROUTES.SEEDLOT_A_CLASS_REGISTRATION, seedlotNumber ?? ''));
                    }
                  }}
                  size="lg"
                  className="btn-scf"
                >
                  Continue registration
                </Button>
              </Column>
            </Row>
            <Row>
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                <Button
                  kind="tertiary"
                  onClick={() => navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? ''))}
                  size="lg"
                  className="btn-scf"
                >
                  Seedlot details
                </Button>
              </Column>
            </Row>
            <Row>
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                <Button
                  kind="tertiary"
                  onClick={() => {
                    if (seedlotClass === 'A') {
                      navigate(ROUTES.SEEDLOTS_A_CLASS_CREATION);
                    }
                  }}
                  size="lg"
                  className="btn-scf"
                >
                  Create another
                  {' '}
                  {seedlotClass}
                  -class seedlot
                </Button>
              </Column>
            </Row>
            <Row>
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                <Button
                  kind="tertiary"
                  onClick={() => navigate(ROUTES.SEEDLOTS)}
                  size="lg"
                  className="btn-scf"
                >
                  Seedlot&apos;s main screen
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
