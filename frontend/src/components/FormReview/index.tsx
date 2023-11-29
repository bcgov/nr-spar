import React, { useState } from 'react';

import {
  Accordion,
  AccordionItem,
  Button
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import Subtitle from '../Subtitle';
import TitleAccordion from '../TitleAccordion';
import EmptySection from '../EmptySection';

import { AllStepData } from '../../views/Seedlot/SeedlotRegistrationForm/definitions';
import formReviewText from './constants';

import './styles.scss';
import OrchardStep from '../SeedlotRegistrationSteps/OrchardStep';
import InterimStorage from '../SeedlotRegistrationSteps/InterimStep';
import CollectionStep from '../SeedlotRegistrationSteps/CollectionStep';
import ExtractionAndStorage from '../SeedlotRegistrationSteps/ExtractionAndStorageStep';
import { OrchardForm } from '../SeedlotRegistrationSteps/OrchardStep/definitions';
import { initCollectionState, initOwnershipState } from '../../views/Seedlot/SeedlotRegistrationForm/utils';

const mockFormData = [
  {
    id: 0,
    title: 'Collection',
    description: 'Review collection information'
  },
  {
    id: 1,
    title: 'Ownership',
    description: 'Review ownership information'
  },
  {
    id: 2,
    title: 'Interim storage',
    description: 'Review interim storage information'
  },
  {
    id: 3,
    title: 'Orchard',
    description: 'Review orchard information'
  },
  {
    id: 4,
    title: 'Parent tree and SMP',
    description: 'Review parent tree and SPM information'
  },
  {
    id: 5,
    title: 'Extraction and storage',
    description: 'Review extraction and storage information'
  }
];

const defaultCode = '16';
const defaultAgency = '0032 - Strong Seeds Orchard - SSO';

const orchardMock: OrchardForm = {
  orchards: [
    {
      inputId: 0,
      selectedItem: {
        code: '123',
        description: 'Strong seeds orchard',
        label: '123 - Strong seeds orchard'
      }
    }
  ],
  femaleGametic: 'F1 - Visual estimate',
  maleGametic: 'M2',
  controlledCross: true,
  biotechProcess: true,
  noPollenContamination: true,
  breedingPercentage: '100',
  pollenMethodology: false
};

const interimStorageMock = {
  useCollectorAgencyInfo: true,
  agencyName: 'Strong Seeds Orchard - SSO',
  locationCode: '32',
  startDate: '2023/01/04',
  endDate: '2023/01/26',
  storageLocation: 'Strong Seeds Seed Orchard Company',
  facilityType: 'VRM'
};

const ownershipMock = initOwnershipState(defaultAgency, defaultCode);

const collectionMock = initCollectionState(defaultAgency, defaultCode);

const extractionMock = {
  extractoryUseTSC: true,
  extractoryAgency: 'Yellow point lodge LTD.',
  extractoryLocationCode: '00',
  extractionStartDate: '2023/01/20',
  extractionEndDate: '2023/03/18',
  seedStorageUseTSC: true,
  seedStorageAgency: 'Yellow point lodge LTD.',
  seedStorageLocationCode: '00',
  seedStorageStartDate: '2023/01/20',
  seedStorageEndDate: '2023/03/18'
};

const FormReview = () => {
  const [allStepData] = useState<AllStepData>({
    interimStep: interimStorageMock,
    ownershipStep: [ownershipMock],
    orchardStep: orchardMock,
    collectionStep: collectionMock,
    extractionStorageStep: extractionMock,
    parentTreeStep: {
      tableRowData: {},
      notifCtrl: {},
      allParentTreeData: {},
      mixTabData: {}
    }
  });

  return (
    <div className="form-review">
      <div className="form-review-title-section">
        <p className="form-review-title">
          {formReviewText.reviewForm.title}
        </p>
        <Subtitle text={formReviewText.reviewForm.subtitle} />
      </div>
      <div>
        {
          mockFormData.length
            ? (
              <Accordion className="steps-accordion">
                <AccordionItem
                  title={(
                    <TitleAccordion
                      title={formReviewText.collection.title}
                      description={formReviewText.collection.description}
                    />
                  )}
                >
                  <div className="form-item">
                    <CollectionStep
                      state={allStepData.collectionStep}
                      defaultAgency={defaultAgency}
                      defaultCode={defaultCode}
                      agencyOptions={[]}
                      collectionMethods={[]}
                      setStepData={() => { }}
                      readOnly
                    />
                    <Button
                      kind="tertiary"
                      size="md"
                      className="btn-edit-step"
                      renderIcon={Edit}
                    >
                      {formReviewText.editButton.labelText}
                    </Button>
                  </div>
                </AccordionItem>
                <AccordionItem
                  title={(
                    <TitleAccordion
                      title={formReviewText.ownership.title}
                      description={formReviewText.ownership.description}
                    />
                  )}
                >
                  <div className="form-item">
                    <Button
                      kind="tertiary"
                      size="md"
                      className="btn-edit-step"
                      renderIcon={Edit}
                    >
                      {formReviewText.editButton.labelText}
                    </Button>
                  </div>
                </AccordionItem>
                <AccordionItem
                  title={(
                    <TitleAccordion
                      title={formReviewText.interim.title}
                      description={formReviewText.interim.description}
                    />
                  )}
                >
                  <div className="form-item">
                    <InterimStorage
                      state={allStepData.interimStep}
                      collectorAgency={defaultAgency}
                      collectorCode={defaultCode}
                      agencyOptions={[]}
                      setStepData={() => { }}
                      readOnly
                    />
                    <Button
                      kind="tertiary"
                      size="md"
                      className="btn-edit-step"
                      renderIcon={Edit}
                    >
                      {formReviewText.editButton.labelText}
                    </Button>
                  </div>
                </AccordionItem>
                <AccordionItem
                  title={(
                    <TitleAccordion
                      title={formReviewText.orchard.title}
                      description={formReviewText.orchard.description}
                    />
                  )}
                >
                  <div className="form-item">
                    <OrchardStep
                      gameticOptions={[]}
                      seedlotSpecies={{
                        code: 'POG',
                        description: 'Protect old growth',
                        label: 'POG - Protect old growth'
                      }}
                      state={allStepData.orchardStep}
                      setStepData={() => { }}
                      readOnly
                      cleanParentTables={() => { }}
                      tableRowData={{}}
                    />
                    <Button
                      kind="tertiary"
                      size="md"
                      className="btn-edit-step"
                      renderIcon={Edit}
                    >
                      {formReviewText.editButton.labelText}
                    </Button>
                  </div>
                </AccordionItem>
                <AccordionItem
                  title={(
                    <TitleAccordion
                      title={formReviewText.parentTree.title}
                      description={formReviewText.parentTree.description}
                    />
                  )}
                />
                <AccordionItem
                  title={(
                    <TitleAccordion
                      title={formReviewText.extraction.title}
                      description={formReviewText.extraction.description}
                    />
                  )}
                >
                  <div className="form-item">
                    <ExtractionAndStorage
                      state={allStepData.extractionStorageStep}
                      defaultAgency={defaultAgency}
                      defaultCode={defaultCode}
                      agencyOptions={[]}
                      setStepData={() => { }}
                      readOnly
                    />
                    <Button
                      kind="tertiary"
                      size="md"
                      className="btn-edit-step"
                      renderIcon={Edit}
                    >
                      {formReviewText.editButton.labelText}
                    </Button>
                  </div>
                </AccordionItem>
              </Accordion>
            )
            : (
              <div className="form-review-empty-section">
                <EmptySection pictogram="Magnify" title="You haven't completed the form yet!" description="The form data will appear here once you complete one step" />
              </div>
            )
        }
      </div>
    </div>
  );
};

export default FormReview;
