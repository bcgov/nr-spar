import React, { useEffect, useState } from 'react';

import { Row, Column } from '@carbon/react';

import SeedlotTable from '../SeedlotTable';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';

import api from '../../api-service/api';
import ApiConfig from '../../api-service/ApiConfig';
import Seedlot from '../../types/Seedlot';

import './styles.scss';
import recentSeedlotsText from './constants';

const RecentSeedlots = () => {
  const [seedlotsData, setSeedlotsData] = useState<Array<Seedlot>>([]);

  const getSeedlotsData = () => {
    const url = ApiConfig.seedlot;
    api.get(url)
      .then((response) => {
        setSeedlotsData(response.data.seedlotData.reverse().slice(0, 9));
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  useEffect(() => {
    getSeedlotsData();
  }, []);

  const tableHeaders: string[] = [
    'Seedlot number',
    'Lot class',
    'Lot species',
    'Form step',
    'Status',
    'Participants',
    'Created at',
    'Last modified',
    'Approved at'
  ];

  return (
    <Row className="recent-seedlots">
      <Column sm={4} className="recent-seedlots-title">
        <h2>{recentSeedlotsText.tableTitle}</h2>
        <Subtitle text={recentSeedlotsText.tableSubtitle} className="recent-seedlots-subtitle" />
      </Column>
      <Column sm={4} className="recent-seedlots-table">
        {
          seedlotsData.length !== 0
            ? (
              <SeedlotTable
                elements={seedlotsData}
                headers={tableHeaders}
              />
            )
            : (
              <div className="empty-recent-seedlots">
                <EmptySection
                  pictogram={recentSeedlotsText.emptyPictogram}
                  title={recentSeedlotsText.emptyTitle}
                  description={recentSeedlotsText.emptyDescription}
                />
              </div>
            )
        }
      </Column>
    </Row>
  );
};

export default RecentSeedlots;
