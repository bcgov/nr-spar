import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  Column,
  TextArea,
  ComboBox,
  InlineNotification
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
  TestingActivityType, ActivitySummaryType
} from '../../../../types/consep/TestingActivityType';
import { initReplicatesList } from '../../../../utils/TestActivitiesUtils';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../../../../components/CONSEP/ActivitySummary';
import StatusTag from '../../../../components/StatusTag';

import ButtonGroup from '../ButtonGroup';
import ActivityResult from '../ActivityResult';
import ActivityDateField from '../ActivityDateField';
import { mccReplicatesChecker } from './utils';
import useTestAutosave from '../hooks/useTestAutosave';
import ConflictNotification from '../../../../components/CONSEP/ConflictNotification';

import {
  fieldsConfig, mccVariations
} from './constants';

import './styles.scss';

const MoistureContent = () => {
  const navigate = useNavigate();
  const { riaKey } = useParams();

  const [testActivity, setTestActivity] = useState<TestingActivityType>();
  const [seedlotNumber, setSeedlotNumber] = useState<string>('');
  const [activitySummary, setActivitySummary] = useState<ActivitySummaryType>();
  const [activityRiaKey, setActivityRiaKey] = useState<number>(0);
  const [mcType, setMCType] = useState<string>('MCC');
  const [alert, setAlert] = useState<{
    isSuccess: boolean;
    message: string;
  } | null>();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const mcVariation = mccVariations[mcType as keyof typeof mccVariations];

  // Any non-zero indicator counts: SPAR writes 1, legacy CONSEP wrote -1. Once completed
  // or accepted, nothing on the page is editable (#2784).
  const isCompleted = !!testActivity?.testCompleteInd;
  const isAccepted = !!testActivity?.acceptResult;
  const isLocked = isCompleted || isAccepted;

  const {
    activityRecord, updateActivityRecord, replicates, setReplicates, setReplicatesBlocked,
    hydrate, isDateRangeValid, isConflict, clearConflict
  } = useTestAutosave(
    'moistureTest',
    riaKey,
    !isLocked,
    (message) => setAlert({ isSuccess: false, message })
  );

  // Reference to the table body for extracting MC Values
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const testActivityQuery = useQuery({
    queryKey: ['riaKey', riaKey],
    queryFn: () => testingActivitiesAPI('moistureTest', 'getDataByRiaKey', { riaKey }),
    refetchOnMount: true
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
      setMCType(testActivityQuery.data.standardActivityType);
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
    }
  }, [testActivity]);

  // Hydrate from query cache only (initial load and Reload); local setTestActivity must not
  // reset the activity record or the table replicates.
  useEffect(() => {
    const { data } = testActivityQuery;
    if (!data) {
      return;
    }
    const variation = mccVariations[data.standardActivityType as keyof typeof mccVariations];
    let replicatesList = data.replicatesList ?? [];
    if (replicatesList.length === 0 && variation) {
      replicatesList = initReplicatesList(riaKey ?? '', variation.defaultNumberOfRows ?? 1);
    }
    hydrate(
      data,
      replicatesList
    );
  }, [testActivityQuery.data, riaKey]);

  const handleAlert = (isSuccess: boolean, message: string) => {
    setAlert({ isSuccess, message });
    setTimeout(
      () => {
        setAlert(null);
      },
      3000
    );
  };

  const handleReloadOnConflict = async () => {
    const result = await testActivityQuery.refetch();
    if (result.status === 'success') {
      clearConflict();
    }
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
          const acceptCells = tableBodyRef.current.querySelectorAll('td[data-index="7"]');
          const numbers = Array.from(cells).map((cell, index) => {
            const checkbox = acceptCells[index].querySelector('input[type="checkbox"]');
            if (checkbox instanceof HTMLInputElement && checkbox.checked) {
              const value = parseFloat(cell.textContent || '');
              return Number.isNaN(value) ? 0 : value;
            }
            return null;
          }).filter((num): num is number => num !== null);
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
      disabled: isLocked,
      action: () => {
        const errors = mccReplicatesChecker(replicates);
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
      disabled: isAccepted || !isCompleted,
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

  return (
    <FlexGrid className="consep-moisture-content">
      {isConflict && (
        <ConflictNotification
          className="consep-moisture-content-conflict"
          onReload={handleReloadOnConflict}
        />
      )}
      {alert?.message
        && (
        <InlineNotification
          lowContrast
          className="consep-moisture-content-alert"
          kind={alert?.isSuccess ? 'success' : 'error'}
          title={alert?.isSuccess ? 'Success' : 'Error'}
          subtitle={alert?.message}
        />
        )}

      <Row className="consep-moisture-content-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="consep-moisture-content-title">
        <PageTitle
          title={`${mcVariation?.description} for lot 
          ${!seedlotNumber || seedlotNumber === '00000'
            ? testActivity?.familyLotNumber
            : seedlotNumber
            }`}
        />
        <>
          {
            isCompleted
              ? (
                <StatusTag type="Completed" renderIcon={CheckmarkFilled} />
              )
              : null
          }
          {
            isAccepted
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
          replicatesData={replicates}
          replicateType="moistureTest"
          riaKey={activityRiaKey}
          isEditable={!isLocked}
          initValidationErrors={validationErrors}
          updateReplicates={setReplicates}
          setAlert={handleAlert}
          tableBodyRef={tableBodyRef}
          onSaveBlockedChange={setReplicatesBlocked}
        />
      </Row>
      <Row className="consep-moisture-content-form">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <ActivityDateField
            id="moisture-content-start-date-picker"
            config={fieldsConfig.startDate}
            value={activityRecord?.actualBeginDateTime}
            invalid={!isDateRangeValid}
            disabled={isLocked}
            onChange={(value) => updateActivityRecord({ actualBeginDateTime: value })}
          />
        </Column>
        <Column sm={2} md={2} lg={5} xlg={5}>
          <ActivityDateField
            id="moisture-content-end-date-picker"
            config={fieldsConfig.endDate}
            value={activityRecord?.actualEndDateTime}
            invalid={!isDateRangeValid}
            disabled={isLocked}
            onChange={(value) => updateActivityRecord({ actualEndDateTime: value })}
          />
        </Column>
        <Column sm={2} md={2} lg={5} xlg={5}>
          <ComboBox
            className="category-combobox"
            disabled={isLocked}
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
              updateActivityRecord({
                testCategoryCode: e.selectedItem
              });
            }}
          />
        </Column>
      </Row>
      <Row className="consep-moisture-content-comments">
        <Column>
          <TextArea
            id="moisture-content-comments"
            name={fieldsConfig.comments.name}
            labelText={fieldsConfig.comments.labelText}
            rows={2}
            maxCount={500}
            enableCounter
            disabled={isLocked}
            value={activityRecord?.riaComment || ''}
            onChange={(e: { target: { value: string } }) => {
              updateActivityRecord({
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
