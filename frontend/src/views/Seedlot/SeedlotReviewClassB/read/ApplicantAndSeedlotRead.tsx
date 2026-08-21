import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import Divider from '../../../../components/Divider';
import ReadOnlyInput from '../../../../components/ReadOnlyInput';
import EmailDisplay from '../../../../components/EmailDisplay';
import ClassBContext from '../../ContextContainerClassB/context';
import getVegCodes from '../../../../api-service/vegetationCodeAPI';
import { getForestClientByNumberOrAcronym } from '../../../../api-service/forestClientsAPI';
import { getForestClientLabel } from '../../../../utils/ForestClientUtils';
import { getMultiOptList } from '../../../../utils/MultiOptionsUtils';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';

const ApplicantAndSeedlotRead = () => {
  const { seedlotData, isFetchingData } = useContext(ClassBContext);

  const clientNumber = seedlotData?.applicantClientNumber;

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', clientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(clientNumber!),
    enabled: !!clientNumber,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (fc) => getForestClientLabel(fc)
  });

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: getVegCodes,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const speciesLabel = vegCodeQuery.data?.find(
    (opt) => opt.code === seedlotData?.vegetationCode
  )?.label ?? seedlotData?.vegetationCode;

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Applicant agency
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-applicant-agency"
            label="Applicant agency"
            value={forestClientQuery.data}
            showSkeleton={isFetchingData || forestClientQuery.fetchStatus === 'fetching'}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-applicant-loc-code"
            label="Applicant location code"
            value={seedlotData?.applicantLocationCode}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col">
          <EmailDisplay
            label="Email address"
            value={seedlotData?.applicantEmailAddress ?? ''}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Seedlot information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-species"
            label="Seedlot species"
            value={speciesLabel}
            showSkeleton={isFetchingData || vegCodeQuery.isFetching}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-superior-provenance"
            label="Superior provenance?"
            value={seedlotData?.superiorProvenanceInd === 'Y' ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-to-be-registered"
            label="To be registered at the Tree Seed Centre?"
            value={seedlotData?.intendedForCrownLand ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-within-bc"
            label="Collected from a location within B.C.?"
            value={seedlotData?.sourceInBc ? 'Yes' : 'No'}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ApplicantAndSeedlotRead;
