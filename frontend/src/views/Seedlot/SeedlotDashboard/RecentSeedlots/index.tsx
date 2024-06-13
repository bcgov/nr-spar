import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { Row, Column, IconButton } from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';

import ROUTES from '../../../../routes/constants';
import AuthContext from '../../../../contexts/AuthContext';
import SeedlotTable from '../../../../components/SeedlotTable';
import Subtitle from '../../../../components/Subtitle';

import { getSubTitle, getTitle } from './constants';

import './styles.scss';

const RecentSeedlots = () => {
  const { user, isTscAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const userId = user?.userId ?? '';

  return (
    <Row className="recent-seedlots">
      <Column sm={4} className="recent-seedlots-title-section">
        <div>
          <h2>{getTitle(isTscAdmin)}</h2>
          <Subtitle text={getSubTitle(isTscAdmin)} className="recent-seedlots-subtitle" />
        </div>
        {
          isTscAdmin
            ? (
              <IconButton className="std-card-button" kind="ghost" label="Go" align="bottom" onClick={() => { navigate(ROUTES.TSC_SEEDLOTS_TABLE); }}>
                <ArrowRight />
              </IconButton>
            )
            : null
        }
      </Column>
      <Column sm={4} className="recent-seedlots-table">
        <SeedlotTable userId={userId} isTscAdmin={isTscAdmin} />
      </Column>
    </Row>
  );
};

export default RecentSeedlots;
