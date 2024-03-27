import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';

import Divider from '../../Divider';
import ReadOnlyInput from '../../ReadOnlyInput';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import EmailDisplay from '../../EmailDisplay';

const ApplicantAndSeedlotRead = () => {
  const {
    defaultAgencyObj, defaultCode, seedlotData, seedlotSpecies, isFetchingData
  } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Applicant agency
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="applicant-and-seedlot-agency-name"
            label="Agency name"
            value={defaultAgencyObj.label}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="applicant-and-seedlot-agency-loc-code"
            label="Agency location code"
            value={defaultCode}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <EmailDisplay
            label="Email address"
            value={seedlotData?.applicantEmailAddress ?? ''}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Seedlot information
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <ReadOnlyInput
            id="applicant-and-seedlot-species"
            label="Seedlot species"
            value={seedlotSpecies.label}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <ReadOnlyInput
            id="applicant-and-seedlot-a-class-source"
            label="Specify A-class source"
            value={seedlotData?.seedlotSource.description ?? ''}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <ReadOnlyInput
            id="applicant-and-seedlot-to-be-reg-tsc"
            label="To be registered at the Tree Seed Centre?"
            value={seedlotData?.intendedForCrownLand ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <ReadOnlyInput
            id="applicant-and-seedlot-collected-within-bc"
            label="Collected from a location within B.C.?"
            value={seedlotData?.sourceInBc ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ApplicantAndSeedlotRead;
