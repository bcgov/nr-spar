import React from 'react';

import { Row, Column } from '@carbon/react';

import SeedlotTable from '../SeedlotTable';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';

import MySeedlotsItems from '../../mock-api/fixtures/MySeedlotsItems';

import './styles.scss';

const MySeedlots = () => {
  const listItems = MySeedlotsItems;

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
    <Row className="my-seedlots">
      <Column sm={4} className="my-seedlots-title">
        <h2>My seedlots</h2>
        <Subtitle text="Check a summary of your recent seedlots" className="my-seedlots-subtitle" />
      </Column>
      <Column sm={4} className="my-seedlots-table">
        {
          listItems.length
            ? (
              <SeedlotTable
                elements={listItems}
                headers={tableHeaders}
              />
            )
            : (
              <div className="empty-my-seedlots">
                <EmptySection
                  pictogram="Magnify"
                  title="There is no seedlot to show yet!"
                  description="Your recent seedlots will appear here once you generate one"
                />
              </div>
            )
        }
      </Column>
    </Row>
  );
};

export default MySeedlots;
