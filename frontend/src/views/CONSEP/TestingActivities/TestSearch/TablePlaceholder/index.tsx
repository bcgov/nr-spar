import React from 'react';
import { StoragePool } from '@carbon/icons-react';
import './styles.scss';

const TablePlaceholder: React.FC = () => (
  <div className="concep-test-search-table-placehoder">
    <StoragePool size={48} />
    <p className="concep-test-search-table-placehoder-title">Nothing to show yet!</p>
    <p className="concep-test-search-table-placehoder-text">
      At least one criteria must be entered to start the search:
      <br />
      Seed or family lot numbers, test type, withdrawal date or any criteria under filters
    </p>
  </div>
);

export default TablePlaceholder;
