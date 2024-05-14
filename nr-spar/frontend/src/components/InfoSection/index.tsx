import React from 'react';
import InfoDisplayObj from '../../types/InfoDisplayObj';
import InfoSectionRow from './InfoSectionRow';
import JsxChildren from '../../types/JsxChildren';

import './styles.scss';

interface InfoSectionProps {
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
    infoItems, children
  }: InfoSectionProps
) => (
  <>
    {
      infoItems.length === 0
        ? null
        : <InfoSectionRow items={infoItems} />
    }
    {children}
  </>
);

export default InfoSection;
