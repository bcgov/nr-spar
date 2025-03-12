import React from 'react';
import {
  FlexGrid,
  Row,
  Column,
  DatePicker,
  DatePickerInput,
  TextArea,
  ComboBox
} from '@carbon/react';
import {
  CheckmarkFilled
} from '@carbon/icons-react';
import ROUTES from '../../../../routes/constants';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../../../../components/CONSEP/ActivitySummary';
import ButtonGroup from '../ButtonGroup';
import StatusTag from '../../../../components/StatusTag';

import {
  DATE_FORMAT, fieldsConfig
} from './constants';

import './styles.scss';

const MoistureContent = () => {
  const createBreadcrumbItems = () => {
    const crumbsList = [];
    crumbsList.push({ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES });
    crumbsList.push({ name: 'Testing activities search', path: ROUTES.TESTING_REQUESTS_REPORT });
    crumbsList.push({ name: 'Testing list', path: ROUTES.TESTING_ACTIVITIES_LIST });
    return crumbsList;
  };

  return (
    <FlexGrid className="consep-moisture-content">
      <Row className="consep-moisture-content-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="consep-moisture-content-title">
        <PageTitle title={fieldsConfig.titleSection.title} />
        <>
          <StatusTag type="Accepted" renderIcon={CheckmarkFilled} />
          <StatusTag type="Completed" renderIcon={CheckmarkFilled} />
        </>
      </Row>
      <Row className="consep-moisture-content-activity-summary">
        <ActivitySummary seedlot={fieldsConfig.seedlot} isFetching={false} />
      </Row>
      <Row className="consep-moisture-content-cone-form">
        <Column className="consep-section-title">
          <h4>{fieldsConfig.moistureContentConesTitle.title}</h4>
        </Column>
      </Row>
      <Row className="consep-moisture-content-date-picker">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            onChange={() => {}}
          >
            <DatePickerInput
              id="moisture-content-start-date-picker"
              name={fieldsConfig.startDate.name}
              placeholder="yyyy/mm/dd"
              labelText={fieldsConfig.startDate.labelText}
              invalidText={fieldsConfig.startDate.invalidText}
              onClick={() => {}}
              onChange={() => {}}
              size="md"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            dateFormat="Y/m/d"
            onChange={() => {}}
          >
            <DatePickerInput
              id="moisture-content-end-date-picker"
              name={fieldsConfig.endDate.name}
              placeholder={fieldsConfig.endDate.placeholder}
              labelText={fieldsConfig.endDate.labelText}
              invalidText={fieldsConfig.endDate.invalidText}
              onClick={() => {}}
              onChange={() => {}}
              size="md"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
      </Row>
      <Row className="consep-moisture-content-category">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <ComboBox
            className="category-combobox"
            id="moisture-content-category"
            name="category"
            items={fieldsConfig.category.options}
            placeholder={fieldsConfig.category.placeholder}
            titleText={fieldsConfig.category.title}
            invalidText={fieldsConfig.category.invalid}
            onChange={() => {}}
          />
        </Column>
      </Row>
      <Row className="consep-moisture-content-comments">
        <Column sm={4} md={4} lg={10} xlg={10}>
          <TextArea
            id="moisture-content-comments"
            name={fieldsConfig.comments.name}
            labelText={fieldsConfig.comments.labelText}
            placeholder={fieldsConfig.comments.placeholder}
            rows={5}
            maxCount={500}
            enableCounter
          />
        </Column>
      </Row>
      <ButtonGroup />
    </FlexGrid>
  );
};

export default MoistureContent;
