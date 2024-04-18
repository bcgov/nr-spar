import React, { useContext, useState } from 'react';
import {
  FlexGrid, Row, Column,
  ButtonSkeleton, Search
} from '@carbon/react';
import { useIsFetching, useQueries, useQueryClient } from '@tanstack/react-query';

import AuthContext from '../../contexts/AuthContext';
import { getForestClientByNumber } from '../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';

import './styles.scss';
import { TEXT } from './constants';
import OrganizationItem from './OrganizationItem';

const RoleSelection = () => {
  const { user, setRole } = useContext(AuthContext);

  useQueries({
    queries: user!.roles.map((userRole) => ({
      queryKey: ['forest-clients', userRole.clientId],
      queryFn: () => getForestClientByNumber(userRole.clientId),
      staleTime: THREE_HOURS,
      cacheTime: THREE_HALF_HOURS
    }))
  });

  const qc = useQueryClient();

  // const filterClientsBySearchTerm = (searchTerm )

  return (
    <FlexGrid className="role-selection-grid">
      <Row className="search-row">
        <Column>
          <Search
            labelText={TEXT.searchLabel}
            placeholder={TEXT.searchLabel}
            onChange={(a) => console.log(a.target.value)}
          />
        </Column>
      </Row>
      {
        user?.roles.map((roleClient) => (
          <Row key={`${roleClient.clientId}-${roleClient.role}`}>
            {
              useIsFetching(['forest-clients', roleClient.clientId])
                ? (

                  <Column>
                    <ButtonSkeleton />
                  </Column>

                )
                : (
                  <OrganizationItem forestClient={qc.getQueryData(['forest-clients', roleClient.clientId])} />
                )
            }
          </Row>
        ))
      }
    </FlexGrid>
  );
};

export default RoleSelection;
