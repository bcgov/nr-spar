import React, { useContext } from 'react';

import { Row, Column } from '@carbon/react';

import AuthContext from '../../../../contexts/AuthContext';
import SeedlotTable from '../../../../components/SeedlotTable';
import Subtitle from '../../../../components/Subtitle';

import { getSubTitle, getTitle } from './constants';

import './styles.scss';

const RecentSeedlots = () => {
  const { user, isTscAdmin } = useContext(AuthContext);

  const userId = user?.userId ?? '';

  return (
    <Row className="recent-seedlots">
      <Column sm={4} className="recent-seedlots-title">
        <h2>{getTitle(isTscAdmin)}</h2>
        <Subtitle text={getSubTitle(isTscAdmin)} className="recent-seedlots-subtitle" />
      </Column>
      <Column sm={4} className="recent-seedlots-table">
        <SeedlotTable userId={userId} />
      </Column>
    </Row>
  );
};

export default RecentSeedlots;
