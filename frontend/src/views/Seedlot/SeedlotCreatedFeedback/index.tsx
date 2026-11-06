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
  const isBClass = seedlotClass === 'B';

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
                {
                  isBClass
                    ? (
                      <h1>B class seedlot created!</h1>
                    )
                    : (
                      <h1>
                        {seedlotClass}
                        -class
                        {' '}
                        <span id="created-seedlot-number">
                          {seedlotNumber}
                        </span>
                        {' '}
                        seedlot created
                      </h1>
                    )
                }
              </Column>
            </Row>
            {
              isBClass
                ? (
                  <Row>
                    <Column>
                      <h2>
                        Your B class seedlot
                        {' '}
                        <span id="created-seedlot-number">{seedlotNumber}</span>
                        {' '}
                        has been created! Now you can access the seedlot&apos;s detail screen,
                        create another one or go back to the seedlot&apos;s main screen.
                      </h2>
                    </Column>
                  </Row>
                )
                : null
            }
            {
              isBClass
                ? (
                  <Row className="navigate-btn">
                    <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                      <Button
                        onClick={() => navigate(
                          addParamToPath(ROUTES.SEEDLOT_B_CLASS_REGISTRATION, seedlotNumber ?? '')
                        )}
                        size="lg"
                        className="btn-scf"
                      >
                        Continue registration
                      </Button>
                    </Column>
                  </Row>
                )
                : null
            }
            {
              isBClass
                ? (
                  <Row>
                    <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                      <Button
                        kind="tertiary"
                        onClick={() => navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? ''))}
                        size="lg"
                        className="btn-scf"
                      >
                        Go to seedlot&apos;s detail screen
                      </Button>
                    </Column>
                  </Row>
                )
                : (
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
                )
            }
            {
              !isBClass
                ? (
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
                )
                : null
            }
            <Row>
              <Column sm={4} md={4} lg={12} xlg={10} max={8}>
                <Button
                  kind={isBClass ? 'secondary' : 'tertiary'}
                  onClick={() => {
                    if (seedlotClass === 'A') {
                      navigate(ROUTES.SEEDLOTS_A_CLASS_CREATION);
                    } else if (seedlotClass === 'B') {
                      navigate(ROUTES.SEEDLOTS_B_CLASS_CREATION);
                    }
                  }}
                  size="lg"
                  className="btn-scf"
                >
                  {
                    isBClass
                      ? 'Create another B class seedlot'
                      : (
                        <>
                          Create another
                          {' '}
                          {seedlotClass}
                          -class seedlot
                        </>
                      )
                  }
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
                  {
                    isBClass
                      ? 'Go back to seedlot\'s main screen'
                      : 'Seedlots main screen'
                  }
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
