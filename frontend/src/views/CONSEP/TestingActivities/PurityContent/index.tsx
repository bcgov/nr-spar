import React, { useState } from 'react';
import {
  FlexGrid,
  Row,
  Column,
  DatePicker,
  DatePickerInput,
  TextArea,
  ComboBox,
  Button,
  InlineNotification,
  TextInput
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
  const [impurities, setImpurities] = useState<{ [key: number]: ImpurityType[] }>({
    1: [], // Impurities for replicate 1
    2: [] // Impurities for replicate 2
  });
  const [average, setAverage] = useState<number | null>(null);

  const createBreadcrumbItems = () => {
    const crumbsList = [];
    crumbsList.push({ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES });
    crumbsList.push({ name: 'Testing activities search', path: ROUTES.TESTING_REQUESTS_REPORT });
    crumbsList.push({ name: 'Testing list', path: ROUTES.TESTING_ACTIVITIES_LIST });
    return crumbsList;
  };

  const addImpurity = (replicate: number) => {
    setImpurities((prev) => {
      // Check if the replicate already has 10 dropdowns
      if (prev[replicate].length >= 10) {
        return prev; // Return the current state without changes
      }
      // Add a new impurity if the limit is not reached
      return {
        ...prev,
        [replicate]: [
          ...prev[replicate],
          { id: crypto.randomUUID(), value: '' } // Unique ID for each dropdown
        ]
      };
    });
  };

  const removeImpurity = (replicate: number, id: string) => {
    setImpurities((prev) => ({
      ...prev,
      [replicate]: prev[replicate].filter((item) => item.id !== id)
    }));
  };

  const handleCalculateAverage = () => {
    setAverage(7.8); // Set the test average value from the API response
  };

  const impurityDropdown = (replicate: number) => impurities[replicate].map((impurity) => (
    <Row key={impurity.id} className="consep-impurity-content">
      <Column>
        <TextInput
          labelText="Rank"
          disabled
          type="number"
          value={impurities[replicate].indexOf(impurity) + 1}
          readOnly
        />
      </Column>
      <Column sm={2} md={2} lg={5} xlg={5}>
        <ComboBox
          className="consep-impurity-combobox"
          id={`impurity-${replicate}-${impurity.id}`}
          name={fieldsConfig.impuritySection.secondaryfieldName}
          items={fieldsConfig.impuritySection.options}
          placeholder={fieldsConfig.impuritySection.placeholder}
          titleText={fieldsConfig.impuritySection.secondaryfieldName}
          onChange={() => {}}
        />
      </Column>
      <Column className="consep-impurity-content-remove" sm={2}>
        <Button
          kind="danger--tertiary"
          size="sm"
          hasIconOnly
          onClick={() => removeImpurity(replicate, impurity.id)}
          renderIcon={TrashCan}
          iconDescription="Remove impurity"
        />
      </Column>
    </Row>
  ));

  const replicateSection = (replicate: number) => (
    <>
      <Row className="consep-purity-content-replicate">
        <Column className="consep-section-title">
          <h5>
            {replicate === 1
              ? fieldsConfig.impuritySection.firstSubtitle
              : fieldsConfig.impuritySection.secondSubtitle}
          </h5>
        </Column>
      </Row>
      {/* Render dropdowns for the specific replicate */}
      {
        impurityDropdown(replicate)
      }
      <Row className="consep-impurity-button">
        <Column sm={4} md={4} lg={10}>
          <Button
            size="md"
            kind="tertiary"
            renderIcon={Add}
            onClick={() => addImpurity(replicate)} // Add impurity for the specific replicate
          >
            {fieldsConfig.impuritySection.buttonText}
          </Button>
        </Column>
      </Row>
      {impurities[replicate].length >= 10
      // Show error message if the limit is reached
      && (
      <InlineNotification
        kind="error"
        title="Error"
        role="alert"
        subtitle="You can only add up to 10 impurities for each replicate."
      />
      )}
    </>
  );

  const buttons = [
    {
      id: 'calculate-average',
      text: 'Calculate average',
      kind: 'primary',
      size: 'lg',
      icon: Calculator,
      onClick: handleCalculateAverage
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
          <h4>{fieldsConfig.puritySection.title}</h4>
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
      <Row className="consep-impurity-title">
        <Column className="consep-section-title">
          <h4>{fieldsConfig.impuritySection.title}</h4>
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
      {average !== null && (
        <Row className="consep-average-result">
          <Column>
            <h5>
              Calculated Average:
              {' '}
              {average}
            </h5>
          </Column>
        </Row>
      )}
      <ButtonGroup buttons={buttons} />
    </FlexGrid>
  );
};

export default PurityContent;
