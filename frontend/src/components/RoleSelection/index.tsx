import React, { useContext, useState } from 'react';
import {
  FlexGrid, Row, Column,
  ButtonSkeleton, Search
} from '@carbon/react';
import { QueryKey, useIsFetching, useQueries, useQueryClient } from '@tanstack/react-query';

import AuthContext from '../../contexts/AuthContext';
import { getForestClientByNumber } from '../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';

import './styles.scss';
import { TEXT } from './constants';
import OrganizationItem from './OrganizationItem';
import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType';
import { UserRoleType } from '../../types/UserRoleType';

const RoleSelection = () => {
  const { user, setRole } = useContext(AuthContext);
  // A list of matched client id
  const [matchedClients, setMatchedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleToSet, setRoleToSet] = useState<UserRoleType | null>(null);

  useQueries({
    queries: user!.roles.map((userRole) => ({
      // Not a conventional query key,
      // be we need the 'role' here to distinguish the data is for roles only,
      // used later to retrieve data related roles only.
      queryKey: ['forest-clients', 'role', userRole.clientId],
      queryFn: () => getForestClientByNumber(userRole.clientId),
      staleTime: THREE_HOURS,
      cacheTime: THREE_HALF_HOURS
    }))
  });

  const qc = useQueryClient();

  const filterClientsByValue = (value: string) => {
    const forestClientsQueriesData = qc.getQueriesData(['forest-clients', 'role']);

    const forestClients = forestClientsQueriesData.map((qData) => (
      qData.at(1) as ForestClientType
    ));

    const loweredSearchTerm = value.toLowerCase();

    const foundByName = forestClients
      .filter((fc) => (fc.clientName.toLowerCase().includes(loweredSearchTerm)));

    const foundById = forestClients
      .filter((fc) => (fc.clientNumber.includes(loweredSearchTerm)));

    const foundCombined = foundByName.concat(foundById);

    const foundIds = foundCombined.map((fc) => fc.clientNumber);

    console.log(foundIds, searchTerm);

    setSearchTerm(value);
    setMatchedClients(foundIds);
  };

  const renderOrgItem = (roleClient: UserRoleType) => {
    // Render skeletons
    if (useIsFetching(['forest-clients', 'role', roleClient.clientId])) {
      return (
        (
          <Column>
            <ButtonSkeleton />
          </Column>
        )
      );
    }
    // Render Matched
    if (
      (
        matchedClients.length === 0
        && searchTerm === ''
      )
      || matchedClients.includes(roleClient.clientId)
    ) {
      return (
        <OrganizationItem forestClient={qc.getQueryData(['forest-clients', 'role', roleClient.clientId])} />
      );
    }
    return null;
  };

  return (
    <FlexGrid className="role-selection-grid">
      <Row className="search-row">
        <Column>
          <Search
            labelText={TEXT.searchLabel}
            placeholder={TEXT.searchLabel}
            onChange={
              (e: React.ChangeEvent<HTMLInputElement>) => filterClientsByValue(e.target.value)
            }
          />
        </Column>
      </Row>
      {
        user?.roles
          .map((roleClient) => (
            <Row key={`${roleClient.clientId}-${roleClient.role}`}>
              {
                renderOrgItem(roleClient)
              }
            </Row>
          ))
      }
    </FlexGrid>
  );
};

export default RoleSelection;
