import React from 'react';

import { Row, Column } from '@carbon/react';

import SeedlotTable from '../SeedlotTable';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';

import ExistingSeedlotItems from '../../mock-data/ExistingSeedlotItems';

import './styles.scss';

const ExistingSeedlot = () => {
  const listItems = ExistingSeedlotItems;

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
    <Row className="existing-seedlot">
      <Column sm={4} className="existing-seedlot-title">
        <h3>Existing seedlot</h3>
        <Subtitle text="Check a summary of your recent seedlots" className="existing-seedlot-subtitle" />
      </Column>
      <Column sm={4} className="existing-seedlot-table">
        <SeedlotTable
          elements={listItems}
          headers={tableHeaders}
        />
        {(listItems.length === 0) && (
        <div className="empty-existing-seedlot">
          <EmptySection
            icon="Application"
            title="There is no seedlot to show yet!"
            description="Your recent seedlots will appear here once you generate one"
          />
        </div>
        )}
      </Column>
    </Row>
  );
};

export default ExistingSeedlot;
