import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Alert from '@mui/material/Alert';
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
  TextInput,
  Modal
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
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../../../../components/CONSEP/ActivitySummary';
import StatusTag from '../../../../components/StatusTag';

import { ActivityRecordType, TestingActivityType, ActivitySummaryType } from '../../../../types/consep/TestingActivityType';
import testingActivitiesAPI from '../../../../api-service/testingActivitiesAPI';
import { getSeedlotById } from '../../../../api-service/seedlotAPI';
import { initReplicatesList } from '../../../../utils/TestActivitiesUtils';
import { utcToIsoSlashStyle } from '../../../../utils/DateUtils';
import ROUTES from '../../../../routes/constants';

import ActivityResult from '../ActivityResult';
import ButtonGroup from '../ButtonGroup';

import { ImpurityType } from './definitions';
import {
  DATE_FORMAT, fieldsConfig, actionModalOptions, COMPLETE, ACCEPT
} from './constants';
import './styles.scss';

const PurityContent = () => {
  const navigate = useNavigate();
  const { riaKey } = useParams();

  const [testActivity, setTestActivity] = useState<TestingActivityType>();
  const [seedlotNumber, setSeedlotNumber] = useState<string>('');
  const [activityRecord, setActivityRecord] = useState<ActivityRecordType>();
  const [activitySummary, setActivitySummary] = useState<ActivitySummaryType>();
  const [alert, setAlert] = useState<{ isSuccess: boolean; message: string } | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'complete' | 'accept'>(COMPLETE);

  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const testActivityQuery = useQuery({
    queryKey: ['riaKey', riaKey],
    queryFn: () => testingActivitiesAPI('purityTest', 'getDataByRiaKey', { riaKey }),
    refetchOnMount: true
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlotNumber', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: seedlotNumber !== '',
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const updateActivityRecordMutation = useMutation({
    mutationFn: (record?: ActivityRecordType) => testingActivitiesAPI(
      'purityTest',
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

  const validateTest = useMutation({
    mutationFn: () => testingActivitiesAPI(
      'purityTest',
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
      'purityTest',
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

  useEffect(() => {
    if (!riaKey) {
      navigate(ROUTES.FOUR_OH_FOUR);
    }
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
          speciesAndClass: `${seedlotQuery.data.seedlot.vegetationCode} | ${seedlotQuery.data.seedlot.geneticClass.geneticClassCode}`,
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

  const handleCompleteTestModal = () => {
    setModalType(COMPLETE);
    setModalOpen(true);
  };

  const handleAcceptTestModal = () => {
    setModalType(ACCEPT);
    setModalOpen(true);
  };

  const buttons = [
    {
      id: 'calculate-average',
      text: 'Calculate average',
      kind: 'primary',
      size: 'lg',
      icon: Calculator,
      action: handleCalculateAverage
    },
    {
      id: 'complete-test',
      text: 'Complete test',
      kind: 'tertiary',
      size: 'lg',
      icon: Checkmark,
      disabled: testActivity?.testCompleteInd === 1,
      action: handleCompleteTestModal
    },
    {
      id: 'accept-test',
      text: 'Accept test',
      kind: 'tertiary',
      size: 'lg',
      icon: CheckmarkOutline,
      disabled: testActivity?.acceptResult === 1 || testActivity?.testCompleteInd !== 1,
      action: handleAcceptTestModal
    },
    {
      id: 'test-history',
      text: 'Test history',
      kind: 'tertiary',
      size: 'lg',
      icon: Time
    }
  ];

  const impurityPerReplicate = (replicate: number) => impurities[replicate].map((impurity) => (
    <Row key={impurity.id} className="consep-impurity-content">
      <Column sm={1} md={1} lg={2} xlg={2}>
        <TextInput
          labelText="Rank"
          disabled
          type="number"
          value={impurities[replicate].indexOf(impurity) + 1}
          readOnly
        />
      </Column>
      <Column sm={4} md={4} lg={10} xlg={10}>
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
      <Column className="consep-impurity-content-remove" sm={1} md={1} lg={2} xlg={2}>
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

  const impuritySection = (replicate: number) => (
    <Column sm={4} md={4} lg={8} xlg={8}>
      {/* Title for the replicate section */}
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
        impurityPerReplicate(replicate)
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
    </Column>
  );

  return (
    <FlexGrid className="consep-purity-content">
      {
        alert?.message
        && (
          <Alert
            className="consep-moisture-content-alert"
            severity={alert?.isSuccess ? 'success' : 'error'}
          >
            {alert?.message}
          </Alert>
        )
      }
      <Modal
        className="action-modal"
        modalLabel={actionModalOptions[modalType].modalLabel}
        modalHeading={actionModalOptions[modalType].modalHeading}
        primaryButtonText={actionModalOptions[modalType].primaryButtonText}
        secondaryButtonText={actionModalOptions[modalType].secondaryButtonText}
        open={isModalOpen}
        onRequestClose={() => {
          setModalOpen(false);
        }}
        onRequestSubmit={() => {
          if (modalType === COMPLETE) {
            validateTest.mutate();
          } else if (modalType === ACCEPT) {
            acceptTest.mutate();
          }
          setModalOpen(false);
        }}
        size="sm"
        danger
      />
      <Row className="consep-purity-content-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="consep-purity-content-title">
        <PageTitle title={`${fieldsConfig.titleSection.title} ${seedlotNumber}`} />
        <>
          {
            testActivity?.testCompleteInd === 1
              ? (
                <StatusTag type="Completed" renderIcon={CheckmarkFilled} />
              )
              : null
          }
          {
            testActivity?.acceptResult === 1
              ? (
                <StatusTag type="Accepted" renderIcon={CheckmarkFilled} />
              )
              : null
          }
        </>
      </Row>
      <Row className="consep-purity-content-activity-summary">
        <ActivitySummary
          item={activitySummary}
          isFetching={testActivityQuery.isFetching || seedlotQuery.isFetching}
        />
      </Row>
      <Row className="consep-purity-content-activity-result">
        <ActivityResult
          replicateType="purityTest"
          replicatesData={testActivity?.replicatesList || initReplicatesList(riaKey ?? '', 4)}
          riaKey={Number(riaKey)}
          isEditable={!testActivity?.testCompleteInd}
          setAlert={handleAlert}
          tableBodyRef={tableBodyRef}
        />
      </Row>
      <Row className="consep-purity-content-date-picker">
        <Column sm={2} md={2} lg={5} xlg={5}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            onChange={(e: Array<Date>) => {
              handleUpdateActivityRecord({
                actualBeginDateTime: e[0].toISOString()
              });
            }}
          >
            <DatePickerInput
              id="purity-content-start-date-picker"
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
              handleUpdateActivityRecord({
                actualEndDateTime: e[0].toISOString()
              });
            }}
          >
            <DatePickerInput
              id="purity-content-end-date-picker"
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
            id="purity-content-category"
            name="category"
            items={fieldsConfig.category.options}
            placeholder={fieldsConfig.category.placeholder}
            titleText={fieldsConfig.category.title}
            invalidText={fieldsConfig.category.invalid}
            value={
              activityRecord?.testCategoryCode ?? 'QA'
            }
            onChange={(e: { selectedItem: string }) => {
              handleUpdateActivityRecord({
                testCategoryCode: e.selectedItem
              });
            }}
          />
        </Column>
      </Row>
      <Row className="consep-impurity-title">
        <Column className="consep-section-title">
          <h4>{fieldsConfig.impuritySection.title}</h4>
        </Column>
      </Row>
      <Row>
        {
          impuritySection(1)
        }
        {
          impuritySection(2)
        }
      </Row>
      <Row className="consep-purity-content-comments">
        <Column sm={4} md={4} lg={10} xlg={10}>
          <TextArea
            id="purity-content-comments"
            name={fieldsConfig.comments.name}
            labelText={fieldsConfig.comments.labelText}
            placeholder={fieldsConfig.comments.placeholder}
            rows={1}
            maxCount={500}
            enableCounter
            value={activityRecord?.riaComment}
            onChange={(e: { target: { value: string } }) => {
              handleUpdateActivityRecord({
                riaComment: e.target.value
              });
            }}
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
