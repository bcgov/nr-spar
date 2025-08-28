import React, { ChangeEvent, useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { AxiosError } from 'axios';
// import Alert from '@mui/material/Alert';
import {
  FlexGrid,
  Row,
  Column,
  DatePicker,
  DatePickerInput,
  ComboBox,
  Button,
  TextInput
} from '@carbon/react';
import {
  Search
} from '@carbon/icons-react';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';

import {
  DATE_FORMAT, testActivityCodes, testCategoryCodes,
  testSearchCrumbs
} from './constants';
import { ActivitySearchRequest } from './definitions';
import './styles.scss';

const TestSearch = () => {
  const [searchParams, setSearchParams] = useState<ActivitySearchRequest>();

  const handleLotInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lots = e.target.value
      .split(',')
      .map((val) => val.trim())
      .filter((val) => val.length > 0);

    setSearchParams((prev) => ({
      ...prev,
      lotNumbers: lots
    }));
  };

  const handleTestTypeChange = (data: ComboBoxEvent) => {
    setSearchParams((prev) => ({
      ...prev,
      testCategoryCd: data.selectedItem ?? undefined
    }));
  };

  const handleActivityIdChange = (data: ComboBoxEvent) => {
    setSearchParams((prev) => ({
      ...prev,
      activityId: data.selectedItem ?? undefined
    }));
  };

  const handleGermTrayIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const parsed = value === '' ? undefined : parseInt(value, 10);

    setSearchParams((prev) => ({
      ...prev,
      germinatorTrayId: Number.isNaN(parsed) ? undefined : parsed
    }));
  };

  const handleWithdrawalStartDateChange = (dates: (string | Date)[]) => {
    const raw = dates?.[0];
    const value = typeof raw === 'string' ? raw : raw?.toISOString().slice(0, 10);
    setSearchParams((prev) => ({
      ...prev,
      seedWithdrawalStartDate: value ?? undefined
    }));
  };

  const handleWithdrawalEndDateChange = (dates: (string | Date)[]) => {
    const raw = dates?.[0];
    const value = typeof raw === 'string' ? raw : raw?.toISOString().slice(0, 10);
    setSearchParams((prev) => ({
      ...prev,
      seedWithdrawalEndDate: value ?? undefined
    }));
  };

  return (
    <FlexGrid className="consep-test-search-content">
      <Row className="consep-test-search-breadcrumb">
        <Column>
          <Breadcrumbs crumbs={testSearchCrumbs} />
        </Column>
      </Row>
      <Row className="consep-test-search-title">
        <PageTitle title="Testing activities" />
      </Row>
      <Row className="consep-test-search-filters">
        <Column md={1} lg={2}>
          <TextInput
            id="lot-input"
            className="lot-input"
            labelText="Lot #"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleLotInputChange(e);
            }}
          />
        </Column>
        <Column md={1} lg={2}>
          <ComboBox
            id="test-type-input"
            className="test-type-input"
            titleText="Test type"
            items={testCategoryCodes}
            placeholder="Choose test type"
            onChange={(e: ComboBoxEvent) => {
              handleTestTypeChange(e);
            }}
          />
        </Column>
        <Column md={1} lg={2}>
          <ComboBox
            id="activity-type-input"
            className="activity-type-input"
            titleText="Choose activity"
            items={testActivityCodes}
            placeholder="Choose activity"
            onChange={(e: ComboBoxEvent) => {
              handleActivityIdChange(e);
            }}
          />
        </Column>
        <Column md={1} lg={2}>
          <TextInput
            id="germ-tray-input"
            className="germ-tray-input"
            placeholder="Enter germ tray ID"
            labelText="Germ tray ID"
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleGermTrayIdChange(e);
            }}
          />
        </Column>
        <Column md={1} lg={2}>
          <DatePicker
            datePickerType="single"
            className="withdrawal-date-input"
            dateFormat={DATE_FORMAT}
            onChange={(e: Array<Date>) => {
              handleWithdrawalStartDateChange(e);
            }}
          >
            <DatePickerInput
              id="withdrawal-start-date-input"
              placeholder="Withdrawal date"
              labelText="Withdrawal start date"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column md={1} lg={2}>
          <DatePicker
            datePickerType="single"
            className="withdrawal-date-input"
            dateFormat={DATE_FORMAT}
            onChange={(e: Array<Date>) => {
              handleWithdrawalEndDateChange(e);
            }}
          >
            <DatePickerInput
              id="withdrawal-end-date-input"
              placeholder="Withdrawal date"
              labelText="Withdrawal end date"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column className="advanced-search-input" md={1} lg={2}>
          <ComboBox
            id="advanced-search-input"
            items={[]}
            placeholder="Advanced search"
            onChange={() => {}}
          />
        </Column>
        <Column className="search-button" md={1} lg={2}>
          <Button
            renderIcon={Search}
            iconDescription="Search activity"
            size="md"
            onClick={() => {
              console.log(searchParams);
            }}
          >
            Search activity
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default TestSearch;
