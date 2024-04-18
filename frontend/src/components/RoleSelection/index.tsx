import React, { useContext } from 'react';
import {
  FlexGrid, Row, Column,
  TextInputSkeleton
} from '@carbon/react';
import { useIsFetching, useQueries } from '@tanstack/react-query';

import AuthContext from '../../contexts/AuthContext';
import { getForestClientByNumber } from '../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';

import './styles.scss';

const RoleSelection = () => {
  const { user, setRole } = useContext(AuthContext);

  const forestClientQueries = useQueries({
    queries: user!.roles.map((userRole) => ({
      queryKey: ['forest-clients', userRole.clientId],
      queryFn: () => getForestClientByNumber(userRole.clientId),
      staleTime: THREE_HOURS,
      cacheTime: THREE_HALF_HOURS
    }))
  });

  return (
    <FlexGrid>
      {
        user?.roles.map((roleClient) => (
          <Row key={`${roleClient.clientId}-${roleClient.role}`}>
            {
              useIsFetching(['forest-clients', roleClient.clientId])
                ? (
                  <Column>
                    <TextInputSkeleton />
                  </Column>
                )
                : (
                  <>
                    <Column>
                      {
                        roleClient.role
                      }
                    </Column>
                    <Column>
                      {
                        roleClient.clientId
                      }
                    </Column>
                  </>
                )
            }
          </Row>
        ))
      }
    </FlexGrid>
  );
};

export default RoleSelection;
