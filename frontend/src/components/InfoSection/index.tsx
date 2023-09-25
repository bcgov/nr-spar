import React from 'react';
import { Row, Column } from '@carbon/react';
import InfoDisplayObj from '../../types/InfoDisplayObj';
import DescriptionBox from '../DescriptionBox';
import InfoSectionRow from './InfoSectionRow';
import JsxChildren from '../../types/JsxChildren';

import './styles.scss';

interface InfoSectionProps {
  title: string
  description: string;
  infoItems: Array<InfoDisplayObj>;
  children?: JsxChildren;
}

/**
 * This component is introduced for the feature of Step 5
 * of Class A seedlot registration step, to see its usage
 * checkout the summary section at the bottom of that page
 */
const InfoSection = (
  {
    title, description, infoItems, children
  }: InfoSectionProps
) => (
  <>
    <Row className="info-section-desc-row">
      <Column>
        <DescriptionBox header={title} description={description} />
      </Column>
    </Row>
    {
      infoItems.length === 0
        ? null
        : <InfoSectionRow items={infoItems} />
    }
    {children}
  </>
);

export default InfoSection;
