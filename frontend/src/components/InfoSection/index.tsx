import React from 'react';
import { Row, Column, TextInput } from '@carbon/react';
import InfoDisplayObj from '../../types/InfoDisplayObj';
import DescriptionBox from '../DescriptionBox';

import './styles.scss';

interface InfoSectionProps {
  title: string
  description: string;
  infoItems: Array<InfoDisplayObj>
}

/**
 * This component is introduced for the feature of Step 5
 * of Class A seedlot registration step, to see its usage
 * checkout the summary section at the bottom of that page
 */
const InfoSection = (
  {
    title, description, infoItems
  }: InfoSectionProps
) => {
  const formatStrForKey = (str: string) => (
    str.replace(/[^a-zA-Z]+/g, '').toLowerCase()
  );

  return (
    <>
      <Row className="info-section-desc-row">
        <Column>
          <DescriptionBox header={title} description={description} />
        </Column>
      </Row>
      <Row className="info-section-items-row">
        {
          infoItems.map((item) => (
            <Column
              key={`${formatStrForKey(item.name)}-col`}
              sm={4}
              md={4}
              lg={8}
              xlg={4}
              max={4}
            >
              <TextInput
                id={`${formatStrForKey(item.name)}-id`}
                labelText={item.name}
                value={item.value}
                placeholder="--"
                readOnly
              />
            </Column>
          ))
        }
      </Row>
    </>
  );
};

export default InfoSection;
