import React, { useContext, useEffect } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import { useQuery } from '@tanstack/react-query';

import AuthContext from '../../contexts/AuthContext';
import useWindowSize from '../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH } from '../../shared-constants/shared-constants';
import { getForestClientByNumber } from '../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import Avatar from '../Avatar';

import './styles.scss';

const UserButton = () => {
  const { user, selectedClientRoles } = useContext(AuthContext);
  const windowSize = useWindowSize();

  // Fetch forest client if client name is not available, this can happen
  // if user has only 1 org and is logged in without selecting a role
  const forestClientRoleQuery = useQuery({
    queryKey: ['role', 'forest-clients', selectedClientRoles!.clientId],
    queryFn: () => getForestClientByNumber(selectedClientRoles!.clientId),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS,
    enabled: !selectedClientRoles?.clientName,
    refetchOnReconnect: false
  });

  useEffect(() => {
    if (forestClientRoleQuery.status === 'success') {
      // This local storage value will be used by AuthProvider
      // to set the client name in selectedClientRoles.
      localStorage.setItem('selected-client-name', forestClientRoleQuery.data.clientName);
    }
  }, [forestClientRoleQuery.status]);

  return (
    <div className="user-header-btn">
      <div className="avatar-and-org-name">
        <Avatar
          size="sm"
          initial={`${user?.firstName.charAt(0).toUpperCase()}${user?.lastName.charAt(0).toUpperCase()}`}
        />
        {
          windowSize.innerWidth < MEDIUM_SCREEN_WIDTH
            ? null
            : (
              <p className="client-name">
                {selectedClientRoles?.clientName}
              </p>
            )
        }
      </div>
      {
        windowSize.innerWidth < MEDIUM_SCREEN_WIDTH
          ? null
          : <ChevronDown />
      }
    </div>
  );
};

export default UserButton;
