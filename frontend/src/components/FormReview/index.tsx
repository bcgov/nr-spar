import React from 'react';

import {
  Accordion,
  AccordionItem
} from '@carbon/react';

import Subtitle from '../Subtitle';
import TitleAccordion from '../TitleAccordion';
import EmptySection from '../EmptySection';

import './styles.scss';

// this is for testing only
// TODO: remove this once the PR is approved
// eslint-disable-next-line
const emptyMockFormData = [];

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

const FormReview = () => (
  <div className="form-review">
    <div className="form-review-title-section">
      <p className="form-review-title">
        Form review
      </p>
      <Subtitle text="Review data filled in the form (view-only)" />
    </div>
    <div>
      {
        mockFormData.length
          ? (
            <Accordion className="steps-accordion">
              {
                mockFormData.map((data) => (
                  <AccordionItem
                    key={data.id}
                    title={(
                      <TitleAccordion
                        title={data.title}
                        description={data.description}
                      />
                    )}
                  />
                ))
              }
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

export default FormReview;
