import React from 'react';
import { AxiosError } from 'axios';
import { Row, Column } from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import * as Pictograms from '@carbon/pictograms-react';

import { OrganizationItemProps } from './definitions';
import { ClientTypeIconMap } from './constants';

import './styles.scss';

const OrganizationItem = ({ forestClient, queryState, selected }: OrganizationItemProps) => {
  if (queryState?.status === 'error') {
    return (
      <Column className="org-item-col-container">
        <Row>
          <Column className="icon-and-name-col">
            <Icons.ErrorOutline className="icon-error" />
            <p className="client-name">Cannot fetch this organization at the moment</p>
          </Column>
        </Row>
        <Row>
          <Column className="sub-info-col">
            {
              `${(queryState.error! as AxiosError).message}, code: ${(queryState.error! as AxiosError).response?.status}`
            }
          </Column>
        </Row>
      </Column>
    );
  }

  if (!forestClient) {
    return null;
  }

  const renderIcon = () => {
    const clientTypeConfig = ClientTypeIconMap[forestClient.clientTypeCode];
    let Img = null;
    if (selected) {
      Img = Icons.CheckmarkFilled;
      return <Img className="org-item-icon" />;
    }
    if (clientTypeConfig) {
      Img = clientTypeConfig.isIcon
        ? Icons[clientTypeConfig.img]
        : Pictograms[clientTypeConfig.img];

      return <Img className={`org-item-${clientTypeConfig.isIcon ? 'icon' : 'pictogram'}`} />;
    }

    Img = Icons.Help;
    return <Img className="org-item-icon" />;
  };

  return (
    <Column className="org-item-col-container">
      <Row>
        <Column className="icon-and-name-col">
          {
            renderIcon()
          }
          <p className="client-name">{forestClient.clientName}</p>
        </Column>
      </Row>
      <Row>
        <Column className="sub-info-col">
          {
            `ID ${forestClient.clientNumber}`
          }
        </Column>
      </Row>
    </Column>
  );
};

export default OrganizationItem;
