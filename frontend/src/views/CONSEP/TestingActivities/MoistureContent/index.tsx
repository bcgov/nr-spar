import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
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

import ROUTES from '../../../../routes/constants';
import {
  getMccByRiaKey, updateActivityRecord, validateResult, acceptResult
} from '../../../../api-service/moistureContentAPI';
import { getSeedlotById } from '../../../../api-service/seedlotAPI';
import { TestingActivityType, ActivityRecordType } from '../../../../types/consep/TestingActivityType';
import { ActivitySummaryType } from '../../../../types/ActivitySummaryType';
import { utcToIsoSlashStyle } from '../../../../utils/DateUtils';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../../../../components/CONSEP/ActivitySummary';
import StatusTag from '../../../../components/StatusTag';

import ButtonGroup from '../ButtonGroup';
import ActivityResult from '../ActivityResult';

import {
  DATE_FORMAT, fieldsConfig, categoryMap, categoryMapReverse
} from './constants';

import './styles.scss';

const MoistureContent = () => {
  const navigate = useNavigate();
  const { riaKey } = useParams();

  const [testActivity, setTestActivity] = useState<TestingActivityType>();
  const [seedlotNumber, setSeedlotNumber] = useState<string>('');
  const [activitySummary, setActivitySummary] = useState<ActivitySummaryType>();
  const [activityRiaKey, setActivityRiaKey] = useState<number>(0);
  const [activityRecord, setActivityRecord] = useState<ActivityRecordType>();
  const [alert, setAlert] = useState<{ isSuccess: boolean; message: string } | null>(null);

  const testActivityQuery = useQuery({
    queryKey: ['riaKey', riaKey],
    queryFn: () => getMccByRiaKey(riaKey ?? ''),
    refetchOnMount: true
  });

  const updateActivityRecordMutation = useMutation({
    mutationFn: (record?: ActivityRecordType) => updateActivityRecord(activityRiaKey, record),
    onSuccess: () => {
      setAlert({ isSuccess: true, message: 'Activity record updated successfully' });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    },
    onError: (error) => {
      setAlert({
        isSuccess: false,
        message: `Failed to update activity record: ${(error as AxiosError).message}`
      });
    }
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlotNumber', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: seedlotNumber !== '',
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!riaKey) {
      navigate(ROUTES.FOUR_OH_FOUR);
    }
    setActivityRiaKey(Number(riaKey));
  }, [riaKey]);

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
      const activityRecordData = {
        testCategoryCode: testActivityQuery.data.testCategoryCode,
        riaComment: testActivityQuery.data.riaComment,
        actualBeginDateTime: testActivityQuery.data.actualBeginDateTime,
        actualEndDateTime: testActivityQuery.data.actualEndDateTime
      };
      setActivityRecord(activityRecordData);
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

  const handleAlert = (isSuccess: boolean, message: string) => {
    setAlert({ isSuccess, message });
    setTimeout(
      () => {
        setAlert(null);
      },
      3000
    );
  };

  const handleUodateActivityRecord = (record: ActivityRecordType) => {
    setActivityRecord({
      ...activityRecord,
      ...record
    });
    updateActivityRecordMutation.mutate({
      ...activityRecord,
      ...record
    });
  };

  const validateTest = useMutation({
    mutationFn: () => validateResult(riaKey ?? ''),
    onSuccess: () => {
      const testActivityData: TestingActivityType = {
        ...testActivity!,
        testCompleteInd: 1,
        sampleDesc: testActivity?.sampleDesc || '',
        moistureStatus: testActivity?.moistureStatus || '',
        moisturePct: testActivity?.moisturePct || 0,
        acceptResult: testActivity?.acceptResult || 0,
        requestId: testActivity?.requestId || '',
        seedlotNumber: testActivity?.seedlotNumber || '',
        activityType: testActivity?.activityType || '',
        replicatesList: testActivity?.replicatesList || []
      };
      setTestActivity(testActivityData);
      setAlert({ isSuccess: true, message: 'Test validated successfully' });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    },
    onError: (error) => {
      setAlert({
        isSuccess: false,
        message: `Failed to validate test: ${(error as AxiosError).message}`
      });
    }
  });

  const acceptTest = useMutation({
    mutationFn: () => acceptResult(riaKey ?? ''),
    onSuccess: () => {
      const testActivityData: TestingActivityType = {
        ...testActivity!,
        acceptResult: 1
      };
      setTestActivity(testActivityData);
      setAlert({ isSuccess: true, message: 'Test accepted successfully' });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    },
    onError: (error) => {
      setAlert({
        isSuccess: false,
        message: `Failed to accept test: ${(error as AxiosError).message}`
      });
    }
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
      icon: Checkmark,
      disabled: !!testActivity?.testCompleteInd,
      action: () => validateTest.mutate()
    },
    {
      id: 'accept-test',
      text: 'Accept test',
      kind: 'tertiary',
      size: 'lg',
      icon: CheckmarkOutline,
      disabled: !testActivity?.testCompleteInd || !!testActivity?.acceptResult,
      action: () => acceptTest.mutate()
    },
    {
      id: 'test-history',
      text: 'Test history',
      kind: 'tertiary',
      size: 'lg',
      icon: Time,
      disabled: true
    },
    {
      id: 'copy-results',
      text: 'Copy results',
      kind: 'tertiary',
      size: 'lg',
      icon: CopyFile,
      disabled: true
    }
  ];
  const initReplicatesList = () => {
    const emptyRows = [];
    for (let i = 0; i < 4; i += 1) {
      emptyRows.push({
        riaKey: activityRiaKey,
        replicateNumber: i + 1,
        replicateAccInd: 1
      });
    }
    return emptyRows;
  };

  return (
    <FlexGrid className="consep-moisture-content">
      {alert?.message
        && (<Alert className="consep-moisture-content-alert" severity={alert?.isSuccess ? 'success' : 'error'}>{alert?.message}</Alert>)}

      <Row className="consep-moisture-content-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="consep-moisture-content-title">
        <PageTitle title={`${fieldsConfig.titleSection.title} ${activitySummary && activitySummary.seedlotNumber}`} />
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
          replicatesData={testActivity?.replicatesList || initReplicatesList()}
          riaKey={activityRiaKey}
          isEditable={!testActivity?.testCompleteInd}
          setAlert={handleAlert}
        />
      </Row>
      <Row className="consep-moisture-content-form">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            onChange={(e: Array<Date>) => {
              handleUodateActivityRecord({
                actualBeginDateTime: e[0].toISOString()
              });
            }}
          >
            <DatePickerInput
              id="moisture-content-start-date-picker"
              name={fieldsConfig.startDate.name}
              placeholder="yyyy/mm/dd"
              labelText={fieldsConfig.startDate.labelText}
              invalidText={fieldsConfig.startDate.invalidText}
              value={utcToIsoSlashStyle(activityRecord?.actualBeginDateTime)}
              size="md"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            dateFormat="Y/m/d"
            onChange={(e: Array<Date>) => {
              handleUodateActivityRecord({
                actualEndDateTime: e[0].toISOString()
              });
            }}
          >
            <DatePickerInput
              id="moisture-content-end-date-picker"
              name={fieldsConfig.endDate.name}
              placeholder={fieldsConfig.endDate.placeholder}
              labelText={fieldsConfig.endDate.labelText}
              invalidText={fieldsConfig.endDate.invalidText}
              value={utcToIsoSlashStyle(activityRecord?.actualEndDateTime)}
              size="md"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column sm={2} md={2} lg={5} xlg={5}>
          <ComboBox
            className="category-combobox"
            id="moisture-content-category"
            name="category"
            items={fieldsConfig.category.options as Array<string>}
            placeholder={fieldsConfig.category.placeholder as string}
            titleText={fieldsConfig.category.title as string}
            invalidText={fieldsConfig.category.invalid as string}
            value={
              activityRecord?.testCategoryCode
              && activityRecord.testCategoryCode in categoryMap
                ? categoryMap[activityRecord.testCategoryCode as keyof typeof categoryMap]
                : 'Quality assurance'
            }
            onChange={(e: { selectedItem: string }) => {
              handleUodateActivityRecord({
                testCategoryCode: categoryMapReverse[
                  e.selectedItem as keyof typeof categoryMapReverse
                ]
              });
            }}
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
            value={activityRecord?.riaComment}
            onChange={(e: { target: { value: string } }) => {
              handleUodateActivityRecord({
                riaComment: e.target.value
              });
            }}
          />
        </Column>
      </Row>
      <ButtonGroup buttons={buttons} />
    </FlexGrid>
  );
};

export default MoistureContent;
