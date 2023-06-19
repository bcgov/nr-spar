/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Row, Column } from '@carbon/react';
import InfoDisplayObj from '../../types/InfoDisplayObj';
import DescriptionBox from '../DescriptionBox';

interface InfoSectionProps {
  title: string
  description: string;
  infoItems: Array<InfoDisplayObj>
}

const InfoSection = (
  {
    title, description, infoItems
  }: InfoSectionProps
) => (
  <>
    <Row>
      <Column>
        <DescriptionBox header={title} description={description} />
      </Column>
    </Row>
    <Row>
      {
        infoItems.map((item) => (
          <Column>
            {item.name}
          </Column>
        ))
      }
    </Row>
  </>
);

export default InfoSection;
