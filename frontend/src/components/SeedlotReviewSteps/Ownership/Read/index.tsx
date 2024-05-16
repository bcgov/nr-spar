import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import Divider from '../../../Divider';
import ReadOnlyInput from '../../../ReadOnlyInput';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import { ForestClientType } from '../../../../types/ForestClientTypes/ForestClientType';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { THREE_HOURS, THREE_HALF_HOURS } from '../../../../config/TimeUnits';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import { SingleOwnerForm } from '../../../SeedlotRegistrationSteps/OwnershipStep/definitions';

const OwnershipReviewRead = () => {
  const {
    isFetchingData, allStepData: { ownershipStep: state }
  } = useContext(ClassAContext);

  useQueries({
    queries: state.map((owner) => owner.ownerAgency.value.code).map(
      (client) => ({
        queryKey: ['forest-clients', client],
        queryFn: () => getForestClientByNumberOrAcronym(client),
        enabled: !isFetchingData,
        staleTime: THREE_HOURS,
        cacheTime: THREE_HALF_HOURS
      })
    )
  });

  const qc = useQueryClient();

  const getOwnerAgencyTitle = (ownerAgency: MultiOptionsObj) => {
    const clientData: ForestClientType | undefined = qc.getQueryData(['forest-clients', ownerAgency.code]);
    if (clientData) {
      return clientData.clientName
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return '';
  };

  const getOwnerAgencyAcronym = (ownerAgency: MultiOptionsObj) => {
    const clientData: ForestClientType | undefined = qc.getQueryData(['forest-clients', ownerAgency.code]);
    if (clientData) {
      return clientData.acronym;
    }
    return '';
  };

  return (
    <FlexGrid className="sub-section-grid">
      {
        state.map((curOwner: SingleOwnerForm, index) => (
          <div key={`${curOwner.id}`}>
            <Row>
              <Column className="sub-section-title-col">
                {
                  getOwnerAgencyTitle(curOwner.ownerAgency.value)
                }
              </Column>
            </Row>
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`owner-${curOwner.id}-agency`}
                  label="Owner agency acronym"
                  value={getOwnerAgencyAcronym(curOwner.ownerAgency.value)}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`owner-${curOwner.id}-loc-code`}
                  label="Owner location code"
                  value={curOwner.ownerCode.value}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`owner-${curOwner.id}-portion`}
                  label="Owner portion (%)"
                  value={`${curOwner.ownerPortion.value}%`}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={2} md={2} lg={2}>
                <ReadOnlyInput
                  id={`owner-${curOwner.id}-reserved`}
                  label="Reserved (%)"
                  value={`${curOwner.reservedPerc.value}%`}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={2} md={2} lg={2}>
                <ReadOnlyInput
                  id={`owner-${curOwner.id}-surplus`}
                  label="Surplus (%)"
                  value={`${curOwner.surplusPerc.value}%`}
                  showSkeleton={isFetchingData}
                />
              </Column>
            </Row>
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`owner-${curOwner.id}-funding-source`}
                  label="Funding source"
                  value={curOwner.fundingSource.value.label}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`owner-${curOwner.id}-payment`}
                  label="Method of payment"
                  value={curOwner.methodOfPayment.value.label}
                  showSkeleton={isFetchingData}
                />
              </Column>
            </Row>
            {
              state.length !== index + 1
                ? (
                  <Divider />
                )
                : null
            }
          </div>
        ))
      }
    </FlexGrid>
  );
};

export default OwnershipReviewRead;
