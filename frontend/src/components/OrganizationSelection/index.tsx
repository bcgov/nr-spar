import React, { useContext, useState } from 'react';
import {
  FlexGrid, Row, Column,
  ButtonSkeleton, Search, Button,
  ContainedListItem
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import AuthContext from '../../contexts/AuthContext';
import { getForestClientByNumberOrAcronym } from '../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType';
import { UserClientRolesType } from '../../types/UserRoleType';
import EmptySection from '../EmptySection';

import { MIN_CLIENTS_SHOW_SEARCH, TEXT } from './constants';
import { RoleSelectionProps } from './definitions';
import OrganizationItem from './OrganizationItem';

import './styles.scss';

const OrganizationSelection = ({ simpleView }: RoleSelectionProps) => {
  const navigate = useNavigate();
  const {
    user, setClientRoles, signOut, selectedClientRoles
  } = useContext(AuthContext);
  // A list of matched client id
  const [matchedClients, setMatchedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [
    clientRolesToSet,
    setClientRolesToSet
  ] = useState<UserClientRolesType | null>(selectedClientRoles);

  useQueries({
    queries: user?.clientRoles.map((clientRole) => ({
      // Not a conventional query key,
      // be we need the 'role' here to distinguish the data is for roles only,
      // used later to retrieve data related roles only.
      queryKey: ['role', 'forest-clients', clientRole.clientId],
      queryFn: () => getForestClientByNumberOrAcronym(clientRole.clientId),
      staleTime: THREE_HOURS,
      gcTime: THREE_HALF_HOURS,
      refetchOnReconnect: false
    })) ?? []
  });

  const qc = useQueryClient();

  const filterClientsByValue = (value: string) => {
    const forestClientsQueriesData = qc.getQueriesData(['role', 'forest-clients']);

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
        const toSet: UserClientRolesType = {
          ...found,
          clientName
        };
        setClientRolesToSet(toSet);
        if (simpleView) {
          setClientRoles(toSet);
          navigate('/');
        }
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
    const queryKey = ['role', 'forest-clients', clientRole.clientId];
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
            description={TEXT.emptyRole}
            icon="SearchLocate"
          />
        </Column>
      );
    }

    if (searchTerm.length > 0 && matchedClients.length === 0) {
      return (
        <Column>
          <EmptySection
            title="Results not found"
            icon="SearchLocate"
            description={(
              <p>
                {TEXT.emptySearch}
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
    <FlexGrid className="org-selection-grid">
      {
        user!.clientRoles.length > MIN_CLIENTS_SHOW_SEARCH
          ? (
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
          )
          : null
      }
      <Row className="org-items-row">
        {
          renderListSection()
        }
      </Row>
      {
        simpleView
          ? null
          : (
            <Row className="btn-row">
              <Column>
                <Button
                  className="action-btn"
                  kind="ghost"
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
          )
      }
    </FlexGrid>
  );
};

export default OrganizationSelection;
