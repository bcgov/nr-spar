import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import Divider from '../../../../components/Divider';
import ReadOnlyInput from '../../../../components/ReadOnlyInput';
import ClassBContext from '../../ContextContainerClassB/context';
import { SingleOwnerForm } from '../../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import { getOwnerAgencyTitle } from '../../../../components/SeedlotRegistrationSteps/OwnershipStep/utils';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import { ForestClientType } from '../../../../types/ForestClientTypes/ForestClientType';
import { getForestClientLabel } from '../../../../utils/ForestClientUtils';

const OwnershipRead = () => {
  const {
    isFetchingData, allStepData: { ownershipStep: state }
  } = useContext(ClassBContext);

  const qc = useQueryClient();

  useQueries({
    queries: state.map((curOwner) => ({
      queryKey: ['forest-clients', curOwner.ownerAgency.value],
      queryFn: () => getForestClientByNumberOrAcronym(curOwner.ownerAgency.value),
      enabled: !!curOwner.ownerAgency.value
    }))
  });

  const getFcQuery = (clientNumber: string): ForestClientType | undefined => qc.getQueryData(['forest-clients', clientNumber]);

  return (
    <FlexGrid className="sub-section-grid">
      {
        state.map((curOwner: SingleOwnerForm, index) => (
          <div key={`${curOwner.id}`}>
            <Row>
              <Column className="sub-section-title-col">
                {
                  getOwnerAgencyTitle(getFcQuery(curOwner.ownerAgency.value))
                }
              </Column>
            </Row>
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`b-review-owner-${curOwner.id}-agency`}
                  label="Owner agency"
                  value={
                    getFcQuery(curOwner.ownerAgency.value)
                      ? getForestClientLabel(getFcQuery(curOwner.ownerAgency.value)!)
                      : undefined
                    }
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`b-review-owner-${curOwner.id}-loc-code`}
                  label="Owner location code"
                  value={curOwner.ownerCode.value}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`b-review-owner-${curOwner.id}-portion`}
                  label="Owner portion (%)"
                  value={`${curOwner.ownerPortion.value}%`}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={2} md={2} lg={2}>
                <ReadOnlyInput
                  id={`b-review-owner-${curOwner.id}-reserved`}
                  label="Reserved (%)"
                  value={`${curOwner.reservedPerc.value}%`}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={2} md={2} lg={2}>
                <ReadOnlyInput
                  id={`b-review-owner-${curOwner.id}-surplus`}
                  label="Surplus (%)"
                  value={`${curOwner.surplusPerc.value}%`}
                  showSkeleton={isFetchingData}
                />
              </Column>
            </Row>
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`b-review-owner-${curOwner.id}-funding-source`}
                  label="Funding source"
                  value={curOwner.fundingSource.value.label}
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id={`b-review-owner-${curOwner.id}-payment`}
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

export default OwnershipRead;
