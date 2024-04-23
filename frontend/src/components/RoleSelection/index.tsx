import React, { useContext, useEffect, useState } from 'react';
import {
  FlexGrid, Row, Column,
  ButtonSkeleton, Search, Button,
  ContainedListItem
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import AuthContext from '../../contexts/AuthContext';
import { getForestClientByNumber } from '../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType';
import { UserClientRolesType } from '../../types/UserRoleType';
import EmptySection from '../EmptySection';

import { TEXT } from './constants';
import OrganizationItem from './OrganizationItem';

import './styles.scss';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, setClientRoles, signOut } = useContext(AuthContext);
  // A list of matched client id
  const [matchedClients, setMatchedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [clientRolesToSet, setClientRolesToSet] = useState<UserClientRolesType | null>(null);

  useQueries({
    queries: user?.clientRoles.map((clientRole) => ({
      // Not a conventional query key,
      // be we need the 'role' here to distinguish the data is for roles only,
      // used later to retrieve data related roles only.
      queryKey: ['forest-clients', 'role', clientRole.clientId],
      queryFn: () => getForestClientByNumber(clientRole.clientId),
      staleTime: THREE_HOURS,
      cacheTime: THREE_HALF_HOURS,
      refetchOnReconnect: false
    })) ?? []
  });

  const qc = useQueryClient();

  // Queries data sometime disappear after awhile, maybe from token refresh, need to refetch them.
  useEffect(() => {
    qc.refetchQueries(['forest-clients', 'role']);
  }, [user]);

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

    setSearchTerm(value);
    setMatchedClients(foundIds);
  };

  const setSelectedClientRoles = (clientId: string, clientName?: string) => {
    if (clientId) {
      const found = user!.clientRoles.find((uClientRole) => (
        uClientRole.clientId === clientId
      ));
      if (found) {
        setClientRolesToSet({
          ...found,
          clientName
        });
      }
    }
  };

  const continueToDashboard = () => {
    if (clientRolesToSet) {
      setClientRoles(clientRolesToSet);
      navigate('/');
    }
  };

  const renderOrgItem = (clientRole: UserClientRolesType) => {
    const queryKey = ['forest-clients', 'role', clientRole.clientId];
    const queryState = qc.getQueryState(queryKey);
    const queryData: ForestClientType | undefined = qc.getQueryData(queryKey);

    // Render skeleton on load
    if (queryState?.status === 'loading') {
      return (
        <Row className="org-item-skeleton-row" key={`${clientRole.clientId}-${clientRole.roles[0]}`}>
          <Column>
            <ButtonSkeleton />
          </Column>
        </Row>
      );
    }

    // Render matched
    if (
      (
        matchedClients.length === 0
        && searchTerm === ''
      )
      || matchedClients.includes(clientRole.clientId)
    ) {
      return (
        <ContainedListItem
          key={`${clientRole.clientId}-${clientRole.roles[0]}`}
          disabled={queryState?.status === 'error'}
          onClick={() => setSelectedClientRoles(clientRole.clientId, queryData?.clientName)}
        >
          <OrganizationItem
            forestClient={queryData}
            queryState={queryState}
            selected={clientRolesToSet?.clientId === clientRole.clientId}
          />
        </ContainedListItem>
      );
    }

    return null;
  };

  const renderListSection = () => {
    if (user?.clientRoles.length === 0) {
      return (
        <Column>
          <EmptySection
            title="No organization found under your user"
            description="Please contact your admin for access"
            pictogram="DoorHandle"
          />
        </Column>
      );
    }

    if (searchTerm.length > 0 && matchedClients.length === 0) {
      return (
        <Column>
          <EmptySection
            title="No organization found"
            icon="Windy"
            description={(
              <p>
                {TEXT.emptySearchPtOne}
                <br />
                {TEXT.emptySearchPtTwo}
              </p>
            )}
          />
        </Column>
      );
    }

    return (
      /*
       * <ContainedList /> from Carbon cannot handle children being null
       * so it's too painful to work with, hence the <ul>.
       */
      <Column className="org-items-col">
        <ul aria-label="List of Organization">
          {
            user?.clientRoles
              .map((clientRole) => (
                renderOrgItem(clientRole)
              ))
          }
        </ul>
      </Column>
    );
  };

  /*
   * MAIN COMPONENT
   */
  return (
    <FlexGrid className="role-selection-grid">
      <Row className="search-row">
        <Column>
          <Search
            className="search-bar"
            labelText={TEXT.searchLabel}
            placeholder={TEXT.searchLabel}
            onChange={
              (e: React.ChangeEvent<HTMLInputElement>) => filterClientsByValue(e.target.value)
            }
          />
        </Column>
      </Row>
      <Row className="org-items-row">
        {
          renderListSection()
        }
      </Row>
      <Row className="btn-row">
        <Column>
          <Button
            className="action-btn"
            kind="secondary"
            size="lg"
            onClick={signOut}
          >
            Cancel
          </Button>
        </Column>
        <Column>
          <Button
            className="action-btn"
            kind="primary"
            size="lg"
            onClick={continueToDashboard}
            renderIcon={ArrowRight}
          >
            Continue
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default RoleSelection;
