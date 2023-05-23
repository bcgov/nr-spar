/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  FlexGrid,
  Row,
  Column,
  InlineNotification
} from '@carbon/react';
import Subtitle from '../../../../Subtitle';
import DropDownObj from '../../../../../types/DropDownObject';
import { pageTexts } from '../../constants';
import textConfig from './constants';
import DescriptionBox from '../../../../DescriptionBox';

import '../styles.scss';

type ConeAndPollenProps = {
  seedlotSpecies: DropDownObj
}

const ConeAndPollen = ({
  seedlotSpecies
}: ConeAndPollenProps) => {
  const a = '';
  return (
    <FlexGrid className="parent-tree-tabs">
      <Row className="title-row">
        <Column sm={4} md={5} lg={9}>
          <DescriptionBox header={textConfig.tabTitle} description={textConfig.tabDescription} />
        </Column>
      </Row>
      <Row className="notification-row">
        <InlineNotification
          lowContrast
          kind="info"
          aria-label={pageTexts.sharedTabTexts.notification.actionButtonLabel}
          subtitle={pageTexts.coneAndPollen.notification.subtitle}
          title={pageTexts.sharedTabTexts.notification.title}
        />
      </Row>
    </FlexGrid>
  );
};

export default ConeAndPollen;
