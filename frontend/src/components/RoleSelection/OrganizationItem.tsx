import React from 'react';
import { Row, Column } from '@carbon/react';

import { OrganizationItemProps } from './definitions';

const OrganizationItem = ({ forestClient }: OrganizationItemProps) => {
  if (!forestClient) {
    return null;
  }

  return (
    <Column>
      <Row>
        <Column>
          {
            forestClient.clientName
          }
        </Column>
      </Row>
      <Row>
        <Column>
          {
            `ID: ${forestClient.clientNumber}`
          }
        </Column>
      </Row>
    </Column>
  );
};

export default OrganizationItem;
