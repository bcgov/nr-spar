/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  FlexGrid,
  Row,
  Column,
  ActionableNotification
} from '@carbon/react';
import DropDownObj from '../../../../../types/DropDownObject';
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
    <FlexGrid className="parent-tree-tab-container">
      <Row className="title-row">
        <Column sm={4} md={8} lg={16} xlg={12} max={10}>
          <DescriptionBox header={textConfig.tabTitle} description={textConfig.tabDescription} />
        </Column>
      </Row>
      <Row className="notification-row">
        <Column>
          <ActionableNotification
            kind="info"
            lowContrast
            title={textConfig.notificationTitle}
            inline
            actionButtonLabel=""
          >
            <span className="notification-subtitle">
              {textConfig.notificationSubtitle}
            </span>
          </ActionableNotification>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ConeAndPollen;
