import React from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import GenericTable from '../../../../components/GenericTable';

import { columns, data } from './constants';

import './styles.scss';

const ActivityResult = () => {
  const TITLE = 'Activity results per replicate';

  const actions = [
    {
      label: 'Clear data',
      icon: <Icons.TrashCan size={15} />
    },
    {
      label: 'Accept all',
      icon: <Icons.CheckboxChecked size={15} />
    },
    {
      label: 'Add row',
      icon: <Icons.AddAlt size={15} />
    }
  ];

  return (
    <FlexGrid className="activity-result">
      <Row>
        <h3 className="activity-result-title">{TITLE}</h3>
      </Row>
      <Row className="activity-result-actions">
        <Column lg={8} />
        <Column lg={4} className="activity-result-actions">
          {actions.map((action) => (
            <span key={action.label} className="action-item">
              {action.label}
              {action.icon}
            </span>
          ))}

        </Column>
      </Row>
      <Row>
        <GenericTable columns={columns} data={data} />
      </Row>
    </FlexGrid>
  );
};

export default ActivityResult;
