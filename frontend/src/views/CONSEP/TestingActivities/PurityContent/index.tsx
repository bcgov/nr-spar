import React, { useState } from 'react';
import {
  FlexGrid,
  Row,
  Column,
  DatePicker,
  DatePickerInput,
  TextArea,
  ComboBox,
  Button
} from '@carbon/react';
import {
  CheckmarkFilled,
  Calculator,
  Checkmark,
  CheckmarkOutline,
  Time,
  Add,
  TrashCan
} from '@carbon/icons-react';
import ROUTES from '../../../../routes/constants';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../../../../components/CONSEP/ActivitySummary';
import { ImpurityType } from './definations';
import ButtonGroup from '../ButtonGroup';
import StatusTag from '../../../../components/StatusTag';

import {
  DATE_FORMAT, fieldsConfig
} from './constants';

import './styles.scss';

const PurityContent = () => {
  const [impurities, setImpurities] = useState<ImpurityType[]>([]);

  const addImpurity = () => {
    setImpurities((prev) => [
      ...prev,
      { id: crypto.randomUUID(), value: '' } // Unique ID for each dropdown
    ]);
  };

  const removeImpurity = (id: string) => {
    setImpurities((prev) => prev.filter((item) => item.id !== id));
  };

  const createBreadcrumbItems = () => {
    const crumbsList = [];
    crumbsList.push({ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES });
    crumbsList.push({ name: 'Testing activities search', path: ROUTES.TESTING_REQUESTS_REPORT });
    crumbsList.push({ name: 'Testing list', path: ROUTES.TESTING_ACTIVITIES_LIST });
    return crumbsList;
  };

  // Function to create the impurity dropdowns dynamically
  // Each impurity will have a unique ID and can be removed individually
  const impurityDropdown = () => impurities.map((impurity) => (
    <Row key={impurity.id} className="consep-impurity-content">
      <Column sm={2} md={2} lg={5} xlg={5}>
        <ComboBox
          className="impurity-combobox"
          id={`impurity-${impurity.id}`}
          name={fieldsConfig.impuritySection.secondaryfieldName}
          items={fieldsConfig.impuritySection.options}
          placeholder={fieldsConfig.impuritySection.placeholder}
          titleText={fieldsConfig.impuritySection.secondaryfieldName}
          onChange={() => { }}
        />
      </Column>
      <Column className="consep-impurity-content-remove" sm={2}>
        <Button
          kind="danger--tertiary"
          size="sm"
          hasIconOnly
          onClick={() => removeImpurity(impurity.id)}
          renderIcon={TrashCan}
          iconDescription="Remove impurity"
        />
      </Column>
    </Row>
  ));

  const replicateSection = (replicate: number) => (
    <>
      <Row className="consep-impurity-button">
        <Column sm={4} md={4} lg={10}>
          <Button
            size="md"
            kind="tertiary"
            renderIcon={Add}
            onClick={() => addImpurity()}
          >
            {fieldsConfig.impuritySection.buttonText}
          </Button>
        </Column>
      </Row>
      <Row className="consep-purity-content-cone-form">
        <Column className="consep-section-title">
          <h4>
            {replicate === 1
              ? fieldsConfig.impuritySection.firstSubtitle
              : fieldsConfig.impuritySection.secondSubtitle}
          </h4>
        </Column>
      </Row>
      {
        impurityDropdown()
      }
    </>
  );

  const buttons = [
    {
      id: 'calculate-average',
      text: 'Calculate average',
      kind: 'primary',
      size: 'lg',
      icon: Calculator
    },
    {
      id: 'complete-test',
      text: 'Complete test',
      kind: 'tertiary',
      size: 'lg',
      icon: Checkmark
    },
    {
      id: 'accept-test',
      text: 'Accept test',
      kind: 'tertiary',
      size: 'lg',
      icon: CheckmarkOutline
    },
    {
      id: 'test-history',
      text: 'Test history',
      kind: 'tertiary',
      size: 'lg',
      icon: Time
    }
  ];

  return (
    <FlexGrid className="consep-purity-content">
      <Row className="consep-purity-content-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="consep-purity-content-title">
        <PageTitle title={fieldsConfig.titleSection.title} />
        <>
          <StatusTag type="Accepted" renderIcon={CheckmarkFilled} />
          <StatusTag type="Completed" renderIcon={CheckmarkFilled} />
        </>
      </Row>
      <Row className="consep-purity-content-activity-summary">
        <ActivitySummary item={fieldsConfig.activityItem} isFetching={false} />
      </Row>
      <Row className="consep-purity-content-cone-form">
        <Column className="consep-section-title">
          <h3>{fieldsConfig.puritySection.title}</h3>
        </Column>
      </Row>
      <Row className="consep-purity-content-date-picker">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            onChange={() => {}}
          >
            <DatePickerInput
              id="purity-content-start-date-picker"
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
              id="purity-content-end-date-picker"
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
      <Row className="consep-purity-content-category">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <ComboBox
            className="category-combobox"
            id="purity-content-category"
            name="category"
            items={fieldsConfig.category.options}
            placeholder={fieldsConfig.category.placeholder}
            titleText={fieldsConfig.category.title}
            invalidText={fieldsConfig.category.invalid}
            onChange={() => {}}
          />
        </Column>
      </Row>
      <Row className="consep-impurity-content-cone-form">
        <Column className="consep-section-title">
          <h3>{fieldsConfig.impuritySection.title}</h3>
        </Column>
      </Row>
      {
        replicateSection(1)
      }
      {
        replicateSection(2)
      }
      <Row className="consep-purity-content-comments">
        <Column sm={4} md={4} lg={10} xlg={10}>
          <TextArea
            id="purity-content-comments"
            name={fieldsConfig.comments.name}
            labelText={fieldsConfig.comments.labelText}
            placeholder={fieldsConfig.comments.placeholder}
            rows={5}
            maxCount={500}
            enableCounter
          />
        </Column>
      </Row>
      <ButtonGroup buttons={buttons} />
    </FlexGrid>
  );
};

export default PurityContent;
