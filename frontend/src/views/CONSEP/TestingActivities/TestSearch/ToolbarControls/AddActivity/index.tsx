/* eslint-disable camelcase */
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  ChangeEvent
} from 'react';
import { type MRT_TableInstance } from 'material-react-table';
import {
  Button,
  ComboBox,
  Checkbox,
  DatePicker,
  DatePickerInput,
  TextInput,
  InlineNotification,
  Modal
} from '@carbon/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import GenericTable from '../../../../../../components/GenericTable';
import RequiredFormFieldLabel from '../../../../../../components/RequiredFormFieldLabel';
import {
  getActivityIds,
  getActivityRiaSkeys,
  getTestCategoryCodes,
  getActivityDurationUnits
} from '../../../../../../api-service/consep/testCodesAPI';
import { addActivities, validateAddGermTest } from '../../../../../../api-service/consep/activitiesAPI';
import isCommitmentIndicatorYes from '../../../../../../api-service/requestSeedlotAndVeglotAPI';
import {
  DATE_FORMAT,
  maxEndDate,
  minStartDate,
  toSelectedItemString,
  isFamilyLot
} from '../../constants';
import { getAddActivityTableColumns } from './constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../../../config/TimeUnits';
import ComboBoxEvent from '../../../../../../types/ComboBoxEvent';
import type {
  TestingSearchResponseType,
  ActivityIdType,
  ActivityRiaSkeyType,
  TestCodeType,
  AddGermTestValidationResponseType
} from '../../../../../../types/consep/TestingSearchType';
import type { AddActivityRequest } from './definitions';
import './styles.scss';

const toLocalDateString = (date: Date) => date.toLocaleDateString('en-CA');

const AddActivity = ({
  table,
  closeModal,
  onAddActivitySuccess = () => {}
}: {
  table: MRT_TableInstance<TestingSearchResponseType>;
  closeModal: () => void;
  onAddActivitySuccess?: (newActivity: TestingSearchResponseType) => void;
}
) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const columns = useMemo(() => getAddActivityTableColumns(), []);
  const selectedRows = table.getSelectedRowModel()?.rows.map((row) => row.original) ?? [];
  const requestSkey = selectedRows[0]?.requestSkey;
  const itemId = selectedRows[0]?.itemId;
  const lot = selectedRows[0]?.seedlotDisplay ?? '';
  const isFamilyLotNumber = isFamilyLot(lot);
  const todayString = toLocalDateString(new Date());

  const [addActivityData, setAddActivityData] = useState<Partial<AddActivityRequest>>({
    plannedStartDate: todayString,
    requestSkey: selectedRows[0]?.requestSkey,
    requestId: selectedRows[0]?.reqId,
    itemId: selectedRows[0]?.itemId,
    vegetationState: selectedRows[0]?.species,
    significantStatusIndicator: 0,
    processCommitIndicator: 0
  });
  const [alert, setAlert] = useState<{
    status: 'error' | 'info' | 'success' | 'warning';
    message: string;
  } | null>(null);
  const [showGermTestWarning, setShowGermTestWarning] = useState(false);

  const isCommitmentIndicatorYesQuery = useQuery({
    queryKey: ['request-commitment-indicator', requestSkey, itemId],
    queryFn: () => {
      if (!requestSkey || !itemId) {
        throw new Error('requestSkey or itemId is missing');
      }
      return isCommitmentIndicatorYes(requestSkey, itemId);
    },
    enabled: Boolean(requestSkey && itemId),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const activityIdQuery = useQuery({
    queryKey: ['activity-ids-by-type', isFamilyLotNumber],
    queryFn: () => getActivityIds({
      isFamilyLot: isFamilyLotNumber,
      isSeedlot: !isFamilyLotNumber,
    }),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: ActivityIdType[]) => data.map((activity) => ({
      id: activity.standardActivityId,
      text: activity.activityDescription,
      activityTypeCd: activity.activityTypeCd,
      testCategoryCd: activity.testCategoryCd
    }))
  });

  const activityRiaSkeyQuery = useQuery({
    queryKey: ['activity-riaSkeys', requestSkey, itemId],
    queryFn: () => {
      if (!requestSkey || !itemId) {
        throw new Error('requestSkey or itemId is missing');
      }
      return getActivityRiaSkeys(requestSkey, itemId);
    },
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: ActivityRiaSkeyType[]) => data.map((activity) => ({
      id: activity.riaSkey,
      text: activity.activityDescription
    }))
  });

  const testCategoryQuery = useQuery({
    queryKey: ['test-category-codes'],
    queryFn: getTestCategoryCodes,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: TestCodeType[]) => data?.map((testCode) => ({
      id: testCode.code,
      text: testCode.description
    }))
  });

  const activityDurationUnitQuery = useQuery({
    queryKey: ['activity-duration-units'],
    queryFn: getActivityDurationUnits,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const addActivityMutation = useMutation({
    mutationFn: (payload: AddActivityRequest) => addActivities(payload),
    onSuccess: (data: TestingSearchResponseType) => {
      onAddActivitySuccess(data);
      closeModal();
    },
    onError: (error: unknown) => {
      setAlert({
        status: 'error',
        message: `Failed to add activity: ${error}`
      });
    }
  });

  const validateAddGermTestMutation = useMutation({
    mutationFn: ({
      activityTypeCd,
      seedlotNumber,
      familyLotNumber
    }: {
      activityTypeCd: string;
      seedlotNumber?: string;
      familyLotNumber?: string;
    }) => validateAddGermTest(activityTypeCd, seedlotNumber, familyLotNumber),
    onSuccess: (data: AddGermTestValidationResponseType) => {
      if (data.germTest && !data.matchesCurrentTypeCode) {
        setShowGermTestWarning(true);
      } else {
        handleAddActivity();
      }
    },
    onError: (error: unknown) => {
      setAlert({
        status: 'error',
        message: `Failed to validate the new activity: ${error}`
      });
    }
  });

  useEffect(() => {
    const failedMessages: string[] = [];
    if (activityIdQuery.isError && activityIdQuery.error instanceof Error) {
      failedMessages.push(`Activity IDs: ${activityIdQuery.error.message}`);
    }
    if (activityRiaSkeyQuery.isError && activityRiaSkeyQuery.error instanceof Error) {
      failedMessages.push(`Activity RiaSkeys: ${activityRiaSkeyQuery.error.message}`);
    }
    if (testCategoryQuery.isError && testCategoryQuery.error instanceof Error) {
      failedMessages.push(`Test Category Codes: ${testCategoryQuery.error.message}`);
    }
    if (activityDurationUnitQuery.isError && activityDurationUnitQuery.error instanceof Error) {
      failedMessages.push(`Activity Duration Units: ${activityDurationUnitQuery.error.message}`);
    }
    if (
      isCommitmentIndicatorYesQuery.isError
      && isCommitmentIndicatorYesQuery.error instanceof Error
    ) {
      failedMessages.push(`Process Commitment Indicator: ${isCommitmentIndicatorYesQuery.error.message}`);
    }

    setAlert(failedMessages.length > 0
      ? { status: 'error', message: `Failed to load: ${failedMessages.join('; ')}.` }
      : null);
  }, [
    activityIdQuery.isError, activityIdQuery.error,
    activityRiaSkeyQuery.isError, activityRiaSkeyQuery.error,
    testCategoryQuery.isError, testCategoryQuery.error,
    activityDurationUnitQuery.isError, activityDurationUnitQuery.error,
    isCommitmentIndicatorYesQuery.isError, isCommitmentIndicatorYesQuery.error
  ]);

  const selectedActivity = useMemo(() => {
    return activityIdQuery.data?.find(
      (a) => a.id === addActivityData.standardActivityId
    );
  }, [activityIdQuery.data, addActivityData.standardActivityId]);
  const isTestActivity = Boolean(selectedActivity?.testCategoryCd);
  const REQUIRED_FIELDS = useMemo<(keyof AddActivityRequest)[]>(() => {
    const baseFields: (keyof AddActivityRequest)[] = [
      'standardActivityId',
      'plannedStartDate',
      'plannedEndDate',
      'activityDuration',
      'activityTimeUnit',
      'requestSkey',
      'requestId',
      'itemId',
      'vegetationState',
      'significantStatusIndicator',
      'processCommitIndicator'
    ];

    if (isTestActivity) {
      baseFields.push('testCategoryCd');
    }

    return baseFields;
  }, [isTestActivity]);

  const isAddActivityValid = REQUIRED_FIELDS.every((field) => {
    const value = addActivityData[field];
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== undefined && value !== null;
  });

  const updateField = <K extends keyof AddActivityRequest>(
    field: K,
    value: AddActivityRequest[K] | undefined
  ) => {
    setAddActivityData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddActivity = () => {
    const requestPayload: AddActivityRequest = {
      ...addActivityData,
      standardActivityId: addActivityData.standardActivityId!,
      activityTypeCd: addActivityData.activityTypeCd!,
      plannedStartDate: addActivityData.plannedStartDate!,
      plannedEndDate: addActivityData.plannedEndDate!,
      revisedEndDate: addActivityData.plannedEndDate,
      revisedStartDate: addActivityData.plannedStartDate,
      activityDuration: addActivityData.activityDuration!,
      activityTimeUnit: addActivityData.activityTimeUnit!,
      significantStatusIndicator: addActivityData.significantStatusIndicator!,
      processCommitIndicator: addActivityData.processCommitIndicator!,
      requestSkey: addActivityData.requestSkey!,
      requestId: addActivityData.requestId!,
      itemId: addActivityData.itemId!,
      vegetationState: addActivityData.vegetationState!,
      ...(isFamilyLotNumber ? { familyLotNumber: lot } : { seedlotNumber: lot })
    };

    addActivityMutation.mutate(requestPayload);
  };

  return (
    <div>
      {showGermTestWarning && (
        <Modal
          className="add-activity-germ-test-warning-modal"
          open={showGermTestWarning}
          modalHeading="Add activity validation warning: test type mismatch"
          primaryButtonText="Okay"
          secondaryButtonText="Cancel"
          onRequestClose={() => {
            setShowGermTestWarning(false);
          }}
          onRequestSubmit={() => {
            handleAddActivity();
            setShowGermTestWarning(false);
          }}
        >
          <p style={{ margin: '1rem' }}>Test Type does not match current A-Rank for Seedlot.</p>
        </Modal>
      )}
      <GenericTable columns={columns} data={selectedRows} tableBodyRef={tableBodyRef} />
      {alert?.message && (
        <InlineNotification lowContrast kind={alert.status} subtitle={alert?.message} />
      )}
      <div className="add-activity-form">
        <ComboBox
          required
          id="add-activity-activity-id-select"
          className="add-activity-select"
          titleText={<RequiredFormFieldLabel text="Activity" />}
          items={activityIdQuery.data ?? []}
          itemToString={(item: { id: string; text: string } | null) => item?.text ?? ''}
          selectedItem={activityIdQuery.data?.find(
            (o) => o.id === addActivityData.standardActivityId
          )}
          onChange={(e: ComboBoxEvent) => {
            if (e.selectedItem) {
              updateField('standardActivityId', e.selectedItem.id);
              updateField('activityTypeCd', e.selectedItem.activityTypeCd);
            } else {
              updateField('standardActivityId', undefined);
              updateField('activityTypeCd', undefined);
            }
          }}
        />
        <ComboBox
          id="add-activity-part-of-activity-select"
          className="add-activity-select"
          titleText="Part of activity"
          items={activityRiaSkeyQuery.data ?? []}
          itemToString={(item: { id: number; text: string } | null) => item?.text ?? ''}
          selectedItem={activityRiaSkeyQuery.data?.find(
            (o) => o.id === addActivityData.associatedRiaKey
          )}
          onChange={(e: ComboBoxEvent) => updateField('associatedRiaKey', e.selectedItem ? e.selectedItem.id : undefined)}
        />
        {isTestActivity && <ComboBox
          id="add-activity-test-category-select"
          className="add-activity-select"
          titleText={<RequiredFormFieldLabel text="Test category" />}
          items={testCategoryQuery.data ?? []}
          itemToString={(item: { id: string; text: string } | null) => item?.text ?? ''}
          selectedItem={testCategoryQuery.data?.find(
            (o) => o.id === addActivityData.testCategoryCd
          )}
          onChange={(e: ComboBoxEvent) => updateField('testCategoryCd', e.selectedItem ? e.selectedItem.id : undefined)}
        />}
        <div className="add-activity-date-picker">
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            minDate={minStartDate}
            maxDate={addActivityData.plannedEndDate ?? maxEndDate}
            value={[addActivityData.plannedStartDate ?? todayString]}
            onChange={(dates: Date[]) => {
              if (dates[0]) {
                updateField('plannedStartDate', toLocalDateString(dates[0]));
              } else {
                updateField('plannedStartDate', undefined);
              }
            }}
          >
            <DatePickerInput
              id="add-activity-planned-start-date"
              placeholder="yyyy/mm/dd"
              labelText={<RequiredFormFieldLabel text="Planned start date" />}
              autoComplete="off"
            />
          </DatePicker>
          <DatePicker
            datePickerType="single"
            minDate={addActivityData.plannedStartDate ?? minStartDate}
            maxDate={maxEndDate}
            dateFormat={DATE_FORMAT}
            value={addActivityData.plannedEndDate ? [addActivityData.plannedEndDate] : []}
            onChange={(dates: Date[]) => {
              if (dates[0]) {
                updateField('plannedEndDate', toLocalDateString(dates[0]));
              } else {
                updateField('plannedEndDate', undefined);
              }
            }}
          >
            <DatePickerInput
              id="add-activity-planned-end-date"
              placeholder="yyyy/mm/dd"
              labelText={<RequiredFormFieldLabel text="Planned end date" />}
              autoComplete="off"
            />
          </DatePicker>
        </div>
        <div className="add-activity-duration">
          <TextInput
            id="add-activity-duration-input"
            labelText={<RequiredFormFieldLabel text="Activity duration" />}
            type="number"
            min={0}
            max={999}
            invalid={
              !!addActivityData.activityDuration
              && (addActivityData.activityDuration < 0
                || addActivityData.activityDuration > 999)
              }
            invalidText="Activity duration must be between 0 and 999"
            value={addActivityData.activityDuration ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              updateField('activityDuration', value === '' ? undefined : Number(value));
            }}
          />
          <ComboBox
            id="add-activity-duration-unit-select"
            aria-label="Time unit"
            items={activityDurationUnitQuery.data ?? []}
            selectedItem={toSelectedItemString(addActivityData.activityTimeUnit)}
            itemToString={(item: string | null) => item ?? ''}
            onChange={(e: ComboBoxEvent) => updateField('activityTimeUnit', e.selectedItem)}
          />
        </div>
        <Checkbox
          labelText="Significant"
          id="add-activity-significant-checkbox"
          checked={(addActivityData.significantStatusIndicator ?? 0) === -1}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            updateField('significantStatusIndicator', e.target.checked ? -1 : 0);
          }}
        />
        <Checkbox
          labelText="Process commitment"
          id="add-activity-process-commitment-checkbox"
          disabled={isCommitmentIndicatorYesQuery.data === false}
          checked={(addActivityData.processCommitIndicator ?? 0) === -1}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            updateField('processCommitIndicator', e.target.checked ? -1 : 0);
          }}
        />
      </div>
      <div className="add-activity-footer">
        <Button
          kind="secondary"
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          kind="primary"
          disabled={!isAddActivityValid}
          onClick={() => {
            if (!addActivityData.activityTypeCd) {
              setAlert({
                status: 'error',
                message: 'Activity Type Code is missing.'
              });
              return;
            }

            validateAddGermTestMutation.mutate({
              activityTypeCd: addActivityData.activityTypeCd,
              seedlotNumber: isFamilyLotNumber ? undefined : lot,
              familyLotNumber: isFamilyLotNumber ? lot : undefined
            });
          }}
        >
          Add Activity
        </Button>
      </div>
    </div>
  );
};

export default AddActivity;
