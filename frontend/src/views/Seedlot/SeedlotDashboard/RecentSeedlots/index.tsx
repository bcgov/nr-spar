import React from 'react';

import { Row, Column } from '@carbon/react';

import { useAuth } from '../../../../contexts/AuthContext';
import SeedlotTable from '../../../../components/SeedlotTable';
import Subtitle from '../../../../components/Subtitle';

import recentSeedlotsText from './constants';

import './styles.scss';

const RecentSeedlots = () => {
  const auth = useAuth();

  const userId = auth.user?.userId ?? '';

  return (
    <Row className="recent-seedlots">
      <Column sm={4} className="recent-seedlots-title">
        <h2>{recentSeedlotsText.tableTitle}</h2>
        <Subtitle text={recentSeedlotsText.tableSubtitle} className="recent-seedlots-subtitle" />
      </Column>
      <Column sm={4} className="recent-seedlots-table">
        <SeedlotTable userId={userId} />
      </Column>
    </Row>
  );
};

export default RecentSeedlots;
