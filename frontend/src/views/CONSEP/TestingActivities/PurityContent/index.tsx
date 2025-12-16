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

import {
  ActivityRecordType, TestingActivityType, ActivitySummaryType, ReplicateType
} from '../../../../types/consep/TestingActivityType';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import testingActivitiesAPI from '../../../../api-service/consep/testingActivitiesAPI';
import { getCodesByActivity } from '../../../../api-service/consep/searchTestingActivitiesAPI';
import { deleteImpurity, patchImpurities } from '../../../../api-service/consep/impuritiesAPI';
import { initReplicatesList } from '../../../../utils/TestActivitiesUtils';
import { utcToIsoSlashStyle } from '../../../../utils/DateUtils';
import ROUTES from '../../../../routes/constants';
import { calculateAverage } from '../../../../api-service/moistureContentAPI';

import ActivityResult from '../ActivityResult';
import ButtonGroup from '../ButtonGroup';
import {
  ImpurityDisplayType, ImpurityPayload,
  RichImpurityType, SingleImpurityType
} from './definitions';
import { impuritiesPerReplicate, purityReplicatesChecker } from './utils';
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
  const [replicatesData, setReplicatesData] = useState<ReplicateType[]>([]);
  const [alert, setAlert] = useState<{ isSuccess: boolean; message: string } | null>(null);
  const [impurities, setImpurities] = useState<ImpurityDisplayType>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'complete' | 'accept'>(COMPLETE);
  const [updatedReplicates, setUpdatedReplicates] = useState<ReplicateType[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const testActivityQuery = useQuery({
    queryKey: ['riaKey', riaKey],
    queryFn: () => testingActivitiesAPI('purityTest', 'getDataByRiaKey', { riaKey }),
    refetchOnMount: true
  });

  const impurityCodesQuery = useQuery({
    queryKey: ['impurityCodes'],
    queryFn: () => getCodesByActivity('DEBRIS_TYPE_CD')
  });

  const updateImpuritiesMutation = useMutation({
    mutationFn: (impurityPayload: ImpurityPayload[]) => patchImpurities(
      riaKey || '',
      impurityPayload
    ),
    onSuccess: (updatedImpurities) => {
      setImpurities(impuritiesPerReplicate(updatedImpurities));
    },
    onError: (error: AxiosError) => {
      setAlert({
        isSuccess: false,
        message: `Failed to update activity record: ${error.message}`
      });
    }
  });

  const deleteImpuritiesMutation = useMutation({
    mutationFn: (
      { replicateNumber, debrisRank }: { replicateNumber: string; debrisRank: string }
    ) => deleteImpurity(
      riaKey || '',
      replicateNumber,
      debrisRank
    ),
    onSuccess: (updatedImpurities: RichImpurityType[]) => {
      setImpurities(impuritiesPerReplicate(updatedImpurities));
    },
    onError: (error: AxiosError) => {
      setAlert({
        isSuccess: false,
        message: `Failed to update activity record: ${error.message}`
      });
    }
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

  const averageTest = useMutation({
    mutationFn: (values: number[]) => calculateAverage(riaKey ?? '', values),
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
      setUpdatedReplicates(testActivityQuery.data.replicatesList);
      if (testActivityQuery.data.debrisList) {
        setImpurities(impuritiesPerReplicate(testActivityQuery.data.debrisList));
      }
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

  useEffect(() => {
    if (testActivity?.replicatesList && testActivity?.replicatesList.length > 0) {
      setReplicatesData(testActivity.replicatesList);
    } else {
      setReplicatesData(initReplicatesList(riaKey ?? '', 2));
    }
  }, [testActivity, riaKey]);

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

  const createBreadcrumbItems = () => {
    const crumbsList = [];
    crumbsList.push({ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES });
    crumbsList.push({ name: 'Testing activities search', path: ROUTES.TESTING_REQUESTS_REPORT });
    crumbsList.push({ name: 'Testing list', path: ROUTES.TESTING_ACTIVITIES_LIST });
    return crumbsList;
  };

  const addImpurity = (replicateNumber: number) => {
    let nextRank = 1;
    const replicateImpurities = impurities[replicateNumber] || [];

    if (replicateImpurities.length > 0) {
      const lastItem = replicateImpurities.at(-1);
      if (lastItem) {
        nextRank = lastItem.debrisRank + 1;
      }
    }

    const newImpurity = {
      debrisRank: nextRank,
      debrisCategory: ''
    };

    setImpurities((prev) => ({
      ...prev,
      [replicateNumber]: [...replicateImpurities, newImpurity]
    }));
  };

  const handleCalculateAverage = () => {
    if (tableBodyRef.current) {
      const cells = tableBodyRef.current.querySelectorAll('td[data-index="4"]');
      const acceptCells = tableBodyRef.current.querySelectorAll('td[data-index="5"]');
      const numbers = Array.from(cells).map((cell, index) => {
        const checkbox = acceptCells[index].querySelector('input[type="checkbox"]');
        if (checkbox instanceof HTMLInputElement && checkbox.checked) {
          const value = parseFloat(cell.textContent || '');
          return Number.isNaN(value) ? 0 : value;
        }
        return null;
      }).filter((num): num is number => num !== null);
      averageTest.mutate(numbers);
    } else {
      setAlert({
        isSuccess: false,
        message: 'Table body reference is not available'
      });
    }
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

  const impurityPerReplicate = (impurity: SingleImpurityType, replicateNumber: number) => (
    <Row key={`impurity-${replicateNumber}-${impurity.debrisRank}`} className="consep-impurity-content">
      <Column sm={2} md={2} lg={2} xlg={2}>
        <TextInput
          id={`impurity-rank-${impurity.debrisRank}-${impurity.debrisCategory}`}
          className="debris-rank-input"
          labelText={impurity.debrisRank === 1 ? 'Rank' : ''}
          disabled
          type="number"
          value={impurity.debrisRank}
          readOnly
        />
      </Column>
      <Column sm={4} md={4} lg={8} xlg={8} className="debris-type-column">
        <ComboBox
          className="consep-impurity-combobox"
          id={`impurity-${impurity.debrisRank}-${impurity.debrisCategory}`}
          name={fieldsConfig.impuritySection.secondaryfieldName}
          items={impurityCodesQuery.data ?? []}
          placeholder={fieldsConfig.impuritySection.placeholder}
          titleText={
            impurity.debrisRank === 1
              ? fieldsConfig.impuritySection.secondaryfieldName
              : ''
          }
          value={impurity.debrisCategory}
          onChange={(e: ComboBoxEvent) => {
            const { selectedItem } = e;
            updateImpuritiesMutation.mutate([
              {
                replicateNumber,
                debrisRank: impurity.debrisRank,
                debrisTypeCode: selectedItem
              }
            ]);
          }}
        />
      </Column>
      <Column className="consep-impurity-content-remove" sm={1} md={1} lg={2} xlg={2}>
        <Button
          kind="danger--tertiary"
          hasIconOnly
          size="md"
          onClick={() => deleteImpuritiesMutation.mutate(
            {
              replicateNumber: replicateNumber.toString(),
              debrisRank: impurity.debrisRank.toString()
            }
          )}
          renderIcon={TrashCan}
          iconDescription="Remove impurity"
        />
      </Column>
    </Row>
  );

  const impuritySection = () => (
    testActivity?.replicatesList.map((replicate) => {
      const { replicateNumber } = replicate;
      return (
        <Column
          sm={4}
          md={4}
          lg={8}
          xlg={8}
          className="consep-section-title"
          key={`impurities-for-rep-${replicateNumber}`}
        >
          <h5>
            {`Replicate ${replicateNumber}`}
          </h5>
          {
            Object.keys(impurities)
            && Object.keys(impurities).length > 0
            && impurities[replicateNumber]
            && impurities[replicateNumber].sort((a, b) => a.debrisRank - b.debrisRank).map(
              (impurity) => impurityPerReplicate(impurity, replicateNumber)
            )
          }
          <div className="consep-impurity-button">
            {
              Object.keys(impurities)
              && Object.keys(impurities).length > 0
              && impurities[replicateNumber]
              && impurities[replicateNumber].length >= 10
                ? (
                  <InlineNotification
                    kind="error"
                    title="Error"
                    role="alert"
                    subtitle="You can only add up to 10 impurities for each replicate."
                  />
                )
                : (
                  <Button
                    size="md"
                    kind="tertiary"
                    renderIcon={Add}
                    onClick={() => addImpurity(replicateNumber)}
                  >
                    {fieldsConfig.impuritySection.buttonText}
                  </Button>
                )
            }
          </div>
        </Column>
      );
    })
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
            const errors = purityReplicatesChecker(updatedReplicates);

            if (Object.keys(errors).length > 0) {
              setValidationErrors(errors);
            } else {
              validateTest.mutate();
            }
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
        <PageTitle
          title={`${fieldsConfig.titleSection.title} ${
            !seedlotNumber || seedlotNumber === '00000'
              ? testActivity?.familyLotNumber
              : seedlotNumber
          }`}
        />
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
          isFetching={testActivityQuery.isFetching}
        />
      </Row>
      <Row className="consep-purity-content-activity-result">
        <ActivityResult
          replicateType="purityTest"
          replicatesData={replicatesData}
          riaKey={Number(riaKey)}
          isEditable={!testActivity?.testCompleteInd}
          initValidationErrors={validationErrors}
          updateReplicates={setUpdatedReplicates}
          setAlert={handleAlert}
          tableBodyRef={tableBodyRef}
          hideActions
        />
      </Row>
      <Row className="consep-purity-content-date-picker">
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
              id="purity-content-start-date-picker"
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
              id="purity-content-end-date-picker"
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
      <Row className="consep-purity-content-replicate">
        {
          impuritySection()
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

export default PurityContent;
