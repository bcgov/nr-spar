import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { DateTime as luxon } from 'luxon';

import ReadOnlyInput from '../../ReadOnlyInput';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { MONTH_DAY_YEAR } from '../../../config/DateFormat';

const AuditInfo = () => {
  const {
    isFetchingData, seedlotData
  } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Users and dates
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="created-by"
            label="Created by:"
            value={seedlotData?.auditInformation.entryUserId}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="created-at"
            label="Created at:"
            value={
              seedlotData
                ? luxon.fromISO(seedlotData.auditInformation.entryTimestamp.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                : '--'
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="last-updated-by"
            label="Last uptated by:"
            value={seedlotData?.auditInformation.updateUserId}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="last-updated-at"
            label="Last uptated at:"
            value={
              seedlotData
                ? luxon.fromISO(seedlotData.auditInformation.updateTimestamp.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                : '--'
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="submitted-by"
            label="Submitted by:"
            value={seedlotData?.declarationOfTrueInformationUserId}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="submitted-at"
            label="Submitted at:"
            value={
              seedlotData
                ? luxon.fromISO(seedlotData.declarationOfTrueInformationTimestamp.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                : '--'
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="approved-by"
            label="Approved by:"
            value={seedlotData?.approvedUserId ? seedlotData.approvedUserId : '--'}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="approved-at"
            label="Approved at:"
            value={
              seedlotData?.approvedTimestamp
                ? luxon.fromISO(seedlotData.approvedTimestamp.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                : '--'
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default AuditInfo;
