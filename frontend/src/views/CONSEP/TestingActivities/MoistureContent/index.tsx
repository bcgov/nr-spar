import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AxiosError } from 'axios';
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
  CheckmarkFilled,
  Calculator,
  Checkmark,
  CheckmarkOutline,
  Time,
  CopyFile
} from '@carbon/icons-react';

import { useQuery } from '@tanstack/react-query';
import ROUTES from '../../../../routes/constants';
import { getMccByRiaKey } from '../../../../api-service/moistureContentAPI';
import { getSeedlotById } from '../../../../api-service/seedlotAPI';
import { TestingActivityType } from '../../../../types/consep/TestingActivityType';
import { ActivitySummaryType } from '../../../../types/ActivitySummaryType';
import { utcToIsoSlashStyle } from '../../../../utils/DateUtils';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../../../../components/CONSEP/ActivitySummary';
import StatusTag from '../../../../components/StatusTag';

import ButtonGroup from '../ButtonGroup';
import ActivityResult from '../ActivityResult';

import {
  DATE_FORMAT, fieldsConfig
} from './constants';

import './styles.scss';

const MoistureContent = () => {
  const navigate = useNavigate();
  const { riaKey } = useParams();

  const [testActivity, setTestActivity] = useState<TestingActivityType>();
  const [seedlotNumber, setSeedlotNumber] = useState<string>('');
  const [activitySummary, setActivitySummary] = useState<ActivitySummaryType>();
  
   useEffect(() => {
    if (
      testActivityQuery.isFetched
      && testActivityQuery.status === 'error'
      && (testActivityQuery.error as AxiosError).response?.status === 404
    ) {
      navigate(ROUTES.FOUR_OH_FOUR);
    } else if (testActivityQuery.data) {
      setTestActivity(testActivityQuery.data);
      setSeedlotNumber(testActivityQuery.data.seedlotNumber);
    }
  }, [testActivityQuery.status, testActivityQuery.isFetched]);

  useEffect(() => {
    if (
      seedlotQuery.isFetched
      && seedlotQuery.status === 'error'
      && (seedlotQuery.error as AxiosError).response?.status === 404
    ) {
      navigate(ROUTES.FOUR_OH_FOUR);
    } else if (testActivity && seedlotQuery.data) {
      setActivitySummary(
        {
          activity: testActivity.activityType,
          seedlotNumber,
          requestId: testActivity.requestId,
          speciesAndClass: `${seedlotQuery.data.seedlot.vegetationCode} | ${seedlotQuery.data.seedlot.geneticClass.geneticClassCode}` || '',
          testResult: testActivity.moisturePct.toString()
        }
      );
    }
  }, [seedlotQuery.status, seedlotQuery.isFetched, testActivity]);

  const testActivityQuery = useQuery({
    queryKey: ['riaKey', riaKey],
    queryFn: () => getMccByRiaKey(riaKey ?? ''),
    refetchOnMount: true
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlotNumber', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: seedlotNumber !== '',
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const createBreadcrumbItems = () => {
    const crumbsList = [];
    crumbsList.push({ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES });
    crumbsList.push({ name: 'Testing activities search', path: ROUTES.TESTING_REQUESTS_REPORT });
    crumbsList.push({ name: 'Testing list', path: ROUTES.TESTING_ACTIVITIES_LIST });
    return crumbsList;
  };

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
    },
    {
      id: 'copy-results',
      text: 'Copy results',
      kind: 'tertiary',
      size: 'lg',
      icon: CopyFile
    }
  ];

  return (
    <FlexGrid className="consep-moisture-content">
      <Row className="consep-moisture-content-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="consep-moisture-content-title">
        <PageTitle title={fieldsConfig.titleSection.title} />
        <>
          {
            testActivity?.testCompleteInd
              ? (
                <StatusTag type="Completed" renderIcon={CheckmarkFilled} />
              )
              : null
          }
          {
            testActivity?.acceptResult
              ? (
                <StatusTag type="Accepted" renderIcon={CheckmarkFilled} />
              )
              : null
          }
        </>
      </Row>
      <Row className="consep-moisture-content-activity-summary">
        <ActivitySummary
          item={activitySummary}
          isFetching={testActivityQuery.isFetching || seedlotQuery.isFetching}
        />
      </Row>
      <Row className="consep-moisture-content-activity-result">
        <ActivityResult
          replicatesData={testActivity?.replicatesList || []}
        />
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
              value={utcToIsoSlashStyle(testActivity?.actualBeginDateTime)}
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
              value={utcToIsoSlashStyle(testActivity?.actualEndDateTime)}
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
            value={testActivity?.testCategoryCode || ''}
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
            value={testActivity?.riaComment ?? ''}
          />
        </Column>
      </Row>
      <ButtonGroup buttons={buttons} />
    </FlexGrid>
  );
};

export default MoistureContent;
