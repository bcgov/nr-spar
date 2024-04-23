import React, { useContext } from 'react';
import { ChevronDown } from '@carbon/icons-react';

import AuthContext from '../../contexts/AuthContext';
import useWindowSize from '../../hooks/UseWindowSize';
import Avatar from '../Avatar';

import './styles.scss';
import { MEDIUM_SCREEN_WIDTH } from '../../shared-constants/shared-constants';

const UserButton = () => {
  const { user, selectedClientRoles } = useContext(AuthContext);
  const windowSize = useWindowSize();
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
