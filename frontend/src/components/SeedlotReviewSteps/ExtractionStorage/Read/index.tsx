import React, { useContext } from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';
import { DateTime as luxon } from 'luxon';

import Divider from '../../../Divider';
import ReadOnlyInput from '../../../ReadOnlyInput';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import { MONTH_DAY_YEAR } from '../../../../config/DateFormat';

const ExtractionStorageReviewRead = () => {
  const {
    isFetchingData, allStepData: { extractionStorageStep: state }
  } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Extraction information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="extraction-agency-name"
            label="Extractory agency acronym"
            value={state.extraction.agency.value.label}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="extraction-agency-loc-code"
            label="Extractory agency location code"
            value={state.extraction.locationCode.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {
        state.extraction.startDate.value && state.extraction.endDate.value
          ? (
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="extraction-start-date"
                  label="Extraction start date"
                  value={
                    luxon.fromISO(state.extraction.startDate.value.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                  }
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="extraction-end-date"
                  label="Extraction end date"
                  value={
                    luxon.fromISO(state.extraction.endDate.value.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                  }
                  showSkeleton={isFetchingData}
                />
              </Column>
            </Row>
          )
          : null
      }

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Temporary seed storage
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="storage-agency-name"
            label="Seed storage agency acronym"
            value={state.seedStorage.agency.value.label}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="storage-agency-loc-code"
            label="Seed storage location code"
            value={state.seedStorage.locationCode.value}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {
        state.seedStorage.startDate.value && state.seedStorage.endDate.value
          ? (
            <Row>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="storage-start-date"
                  label="Storage start date"
                  value={
                    luxon.fromISO(state.seedStorage.startDate.value.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                  }
                  showSkeleton={isFetchingData}
                />
              </Column>
              <Column className="info-col" sm={4} md={4} lg={4}>
                <ReadOnlyInput
                  id="storage-end-date"
                  label="Storage end date"
                  value={
                    luxon.fromISO(state.seedStorage.endDate.value.replaceAll('/', '-')).toFormat(MONTH_DAY_YEAR)
                  }
                  showSkeleton={isFetchingData}
                />
              </Column>
            </Row>
          )
          : null
      }
    </FlexGrid>
  );
};

export default ExtractionStorageReviewRead;
