import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';

import Divider from '../../../Divider';
import ReadOnlyInput from '../../../ReadOnlyInput';

import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';

const OrchardReviewRead = () => {
  const {
    isFetchingData, allStepData: { orchardStep: state }, seedlotSpecies
  } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Orchard information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id={state.orchards.primaryOrchard.id}
            label="Orchard ID or number"
            value={state.orchards.primaryOrchard.value.label}
          />
        </Column>
      </Row>
      {
        state.orchards.secondaryOrchard.value.label
          ? (
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={state.orchards.secondaryOrchard.id}
                  label="Orchard ID or number"
                  value={state.orchards.secondaryOrchard.value.label}
                />
              </Column>
            </Row>
          )
          : null
      }
      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Gamete information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="orchard-seedlot-species"
            label="Seedlot species"
            value={seedlotSpecies.label}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="orchard-female-gametic"
            label="Female gametic contribution methodology"
            value={state.femaleGametic.value?.label}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="orchard-male-gametic"
            label="Male gametic contribution methodology"
            value={state.maleGametic.value?.label}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="orchard-controlled-cross"
            label="Was the seedlot produced through controlled crosses?"
            value={state.isControlledCross.value ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="orchard-biotech-process"
            label="Have biotechnological processes been used to produce this seedlot?"
            value={state.hasBiotechProcess.value ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Pollen information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="orchard-pollen-contamination"
            label="Was pollen contamination present in the seed orchard?"
            value={state.hasPollenContamination.value ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {
        state.hasPollenContamination.value
          ? (
            <>
              <Row>
                <Column className="info-col" sm={4} md={8} lg={8}>
                  <ReadOnlyInput
                    id="orchard-pollen-percentage"
                    label="Contaminant pollen breeding value"
                    value={state.breedingPercentage.value}
                    showSkeleton={isFetchingData}
                  />
                </Column>
              </Row>
              <Row>
                <Column className="info-col" sm={4} md={8} lg={8}>
                  <ReadOnlyInput
                    id="orchard-pollen-contamination"
                    label="Contaminant pollen methodology"
                    value="Regional pollen monitoring"
                    showSkeleton={isFetchingData}
                  />
                </Column>
              </Row>
            </>
          )
          : null
      }

    </FlexGrid>
  );
};

export default OrchardReviewRead;
