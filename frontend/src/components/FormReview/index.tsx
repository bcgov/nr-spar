/**
 * This component is currently not used in the app, but might come back to life in the future.
 */

import React from 'react';

import {
  Accordion,
  AccordionItem,
  Button
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import Subtitle from '../Subtitle';
import TitleAccordion from '../TitleAccordion';
import EmptySection from '../EmptySection';
import formReviewText from './constants';

import './styles.scss';

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

export default FormReview;
