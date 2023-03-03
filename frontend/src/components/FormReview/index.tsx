import React from 'react';

import {
  Accordion,
  AccordionItem
} from '@carbon/react';

import Subtitle from '../Subtitle';
import TitleAccordion from '../TitleAccordion';

import './styles.scss';

const FormReview = () => (
  <div className="form-review">
    <div className="form-review-title-section">
      <p className="form-review-title">
        Form review
      </p>
      <Subtitle text="Review data filled in the form (view-only)" />
    </div>
    <div>
      <Accordion className="steps-accordion" >
        <AccordionItem 
          title={
            <TitleAccordion
              title="Collection"
              description="Review collection information" />
          } />
        <AccordionItem 
          title={
            <TitleAccordion
              title="Ownership"
              description="Review ownership information" />
          } />
        <AccordionItem 
          title={
            <TitleAccordion
              title="Interim storage"
              description="Review interim storage information" />
          } />
        <AccordionItem 
          title={
            <TitleAccordion
              title="Orchard"
              description="Review orchard information" />
          } />
        <AccordionItem 
          title={
            <TitleAccordion
              title="Parent tree and SMP"
              description="Review parent tree and SPM information" />
          } />
        <AccordionItem 
          title={
            <TitleAccordion
              title="Extraction and storage"
              description="Review extraction and storage information" />
          } />
      </Accordion>
    </div>
  </div>
);

export default FormReview;
