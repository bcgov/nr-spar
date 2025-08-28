import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { calculateAverage } from '../../../../api-service/moistureContentAPI';
import testingActivitiesAPI from '../../../../api-service/consep/testingActivitiesAPI';
import {
  TestingActivityType, ActivityRecordType, ActivitySummaryType, ReplicateType
} from '../../../../types/consep/TestingActivityType';
import { utcToIsoSlashStyle } from '../../../../utils/DateUtils';
import { initReplicatesList } from '../../../../utils/TestActivitiesUtils';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../../../../components/CONSEP/ActivitySummary';
import StatusTag from '../../../../components/StatusTag';

import ButtonGroup from '../ButtonGroup';
import ActivityResult from '../ActivityResult';
import { mccReplicatesChecker } from './utils';

import {
  DATE_FORMAT, fieldsConfig, mccVariations
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
  const [mcType, setMCType] = useState<string>('MCC');
  const [alert, setAlert] = useState<{ isSuccess: boolean; message: string } | null>(null);
  const [updatedReplicates, setUpdatedReplicates] = useState<ReplicateType[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reference to the table body for extracting MC Values
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const testActivityQuery = useQuery({
    queryKey: ['riaKey', riaKey],
    queryFn: () => testingActivitiesAPI('moistureTest', 'getDataByRiaKey', { riaKey }),
    refetchOnMount: true
  });

  const updateActivityRecordMutation = useMutation({
    mutationFn: (record?: ActivityRecordType) => testingActivitiesAPI(
      'moistureTest',
      'updateActivityRecord',
      { riaKey, record }
    ),
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
      setMCType(testActivityQuery.data.activityType);
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
    if (testActivity) {
      setActivitySummary(
        {
          activity: testActivity.activityType,
          seedlotNumber,
          familyLotNumber: testActivity.familyLotNumber,
          requestId: testActivity.requestId,
          speciesAndClass: `${testActivity.vegetationCode} | ${testActivity.geneticClassCode}`,
          testResult: testActivity.moisturePct?.toString()
        }
      );
      setUpdatedReplicates(testActivityQuery.data.replicatesList);
    }
  }, [testActivity]);

  const handleAlert = (isSuccess: boolean, message: string) => {
    setAlert({ isSuccess, message });
    setTimeout(
      () => {
        setAlert(null);
      },
      3000
    );
  };

  const handleUpdateActivityRecord = (record: ActivityRecordType) => {
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
    mutationFn: () => testingActivitiesAPI(
      'moistureTest',
      'validateTestResult',
      { riaKey }
    ),
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
        familyLotNumber: testActivity?.familyLotNumber || '',
        geneticClassCode: testActivity?.geneticClassCode || '',
        vegetationCode: testActivity?.vegetationCode || '',
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
    mutationFn: () => testingActivitiesAPI(
      'moistureTest',
      'acceptResult',
      { riaKey }
    ),
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

  const averageTest = useMutation({
    mutationFn: (mcValues: number[]) => calculateAverage(riaKey ?? '', mcValues),
    onSuccess: (data) => {
      const testActivityData: TestingActivityType = {
        ...testActivity!,
        moisturePct: data.data
      };
      setTestActivity(testActivityData);
    },
    onError: (error: AxiosError) => {
      setAlert({
        isSuccess: false,
        message: `Failed to calculate average: ${error.message}`
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
      icon: Calculator,
      action: () => {
        if (tableBodyRef.current) {
          // Extract cell values from the table
          const cells = tableBodyRef.current.querySelectorAll('td[data-index="6"]');
          const numbers = Array.from(cells).map((cell) => parseFloat(cell.textContent?.trim() || '0'));
          // Call the mutate function with the extracted numbers
          averageTest.mutate(numbers);
        } else {
          setAlert({
            isSuccess: false,
            message: 'Table body reference is not available'
          });
        }
      }
    },
    {
      id: 'complete-test',
      text: 'Complete test',
      kind: 'tertiary',
      size: 'lg',
      icon: Checkmark,
      disabled: testActivity?.testCompleteInd === 1,
      action: () => {
        const errors = mccReplicatesChecker(updatedReplicates);
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
        } else {
          validateTest.mutate();
        }
      }
    },
    {
      id: 'accept-test',
      text: 'Accept test',
      kind: 'tertiary',
      size: 'lg',
      icon: CheckmarkOutline,
      disabled: testActivity?.acceptResult === 1 || testActivity?.testCompleteInd !== 1,
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

  const mcVariation = mccVariations[mcType as keyof typeof mccVariations];

  return (
    <FlexGrid className="consep-moisture-content">
      {alert?.message
        && (<Alert className="consep-moisture-content-alert" severity={alert?.isSuccess ? 'success' : 'error'}>{alert?.message}</Alert>)}

      <Row className="consep-moisture-content-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="consep-moisture-content-title">
        <PageTitle
          title={`${mcVariation?.description} for lot 
          ${
            !seedlotNumber || seedlotNumber === '00000'
              ? testActivity?.familyLotNumber
              : seedlotNumber
          }`}
        />
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
          isFetching={testActivityQuery.isFetching}
        />
      </Row>
      <Row className="consep-moisture-content-activity-result">
        <ActivityResult
          replicatesData={testActivity?.replicatesList || initReplicatesList(riaKey ?? '', mcVariation.defaultNumberOfRows)}
          replicateType="moistureTest"
          riaKey={activityRiaKey}
          isEditable={!testActivity?.testCompleteInd}
          initValidationErrors={validationErrors}
          updateReplicates={setUpdatedReplicates}
          setAlert={handleAlert}
          tableBodyRef={tableBodyRef}
        />
      </Row>
      <Row className="consep-moisture-content-form">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            allowInput
            dateFormat={DATE_FORMAT}
            onChange={(e: Array<Date>, strDates: string[]) => {
              const date = e[0] || new Date(strDates[0]);
              if (date) {
                handleUpdateActivityRecord({
                  actualBeginDateTime: date.toISOString()
                });
              }
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                handleUpdateActivityRecord({
                  actualBeginDateTime: new Date(e.target.value).toISOString()
                });
              }}
            />
          </DatePicker>
        </Column>
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            allowInput
            dateFormat="Y/m/d"
            onChange={(e: Array<Date>, strDates: string[]) => {
              const date = e[0] || new Date(strDates[0]);
              if (date) {
                handleUpdateActivityRecord({
                  actualEndDateTime: date.toISOString()
                });
              }
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                handleUpdateActivityRecord({
                  actualEndDateTime: new Date(e.target.value).toISOString()
                });
              }}
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
              activityRecord?.testCategoryCode ?? mcVariation.defaultCategory
            }
            onChange={(e: { selectedItem: string }) => {
              handleUpdateActivityRecord({
                testCategoryCode: e.selectedItem
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
            value={activityRecord?.riaComment || ''}
            onChange={(e: { target: { value: string } }) => {
              handleUpdateActivityRecord({
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
