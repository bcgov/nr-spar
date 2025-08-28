import React from 'react';
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

import {
  DATE_FORMAT, testActivityCodes, testCategoryCodes,
  testSearchCrumbs
} from './constants';
import './styles.scss';

const TestSearch = () => {
  console.log('test');
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
            labelText="Seedlot and family lot number(s)"
          />
        </Column>
        <Column md={1} lg={2}>
          <ComboBox
            id="test-type-input"
            className="test-type-input"
            titleText="Test type"
            items={testCategoryCodes}
            placeholder="Choose test type"
            onChange={() => {}}
          />
        </Column>
        <Column md={1} lg={2}>
          <ComboBox
            id="activity-type-input"
            className="activity-type-input"
            titleText="Choose activity"
            items={testActivityCodes}
            placeholder="Choose activity"
            onChange={() => {}}
          />
        </Column>
        <Column md={1} lg={2}>
          <TextInput
            id="germ-tray-input"
            className="germ-tray-input"
            placeholder="Enter germ tray ID"
            labelText="Germ tray ID"
            type="number"
          />
        </Column>
        <Column md={1} lg={2}>
          <DatePicker
            datePickerType="single"
            className="withdrawal-date-input"
            dateFormat={DATE_FORMAT}
            onChange={() => {}}
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
            onChange={() => {}}
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
            onClick={() => {}}
          >
            Search activity
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default TestSearch;
