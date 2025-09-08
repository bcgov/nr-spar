import React from 'react';
import EmptySection from '../../../../../components/EmptySection';
import './styles.scss';

const TablePlaceholder: React.FC = () => (
  <div className="concep-test-search-table-placehoder">
    <EmptySection
      pictogram="Summit"
      title="Nothing to show yet!"
      description={(
        <>
          At least one criteria must be entered to start the search:
          <br />
          Seed or family lot numbers, test type, withdrawal date or any criteria under filters
        </>
      )}
    />
  </div>
);

export default TablePlaceholder;
