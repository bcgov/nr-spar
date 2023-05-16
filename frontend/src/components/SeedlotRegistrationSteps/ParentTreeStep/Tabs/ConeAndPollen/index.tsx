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
          <h2>{pageTexts.tabTitles.coneTab}</h2>
          <h2>{seedlotSpecies.label + a}</h2>
          <Subtitle text={pageTexts.coneAndPollen.subtitle} />
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
