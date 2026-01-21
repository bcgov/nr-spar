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
  InlineNotification
} from '@carbon/react';
import { useQuery } from '@tanstack/react-query';
import GenericTable from '../../../../../../components/GenericTable';
import RequiredFormFieldLabel from '../../../../../../components/RequiredFormFieldLabel';
import {
  getActivityIds,
  getActivityRiaSkeys,
  getTestCategoryCodes,
  getActivityDurationUnits
} from '../../../../../../api-service/consep/testCodesAPI';
import {
  DATE_FORMAT,
  maxEndDate,
  minStartDate,
  toSelectedItemString
} from '../../constants';
import { getAddActivityTableColumns } from './constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../../../config/TimeUnits';
import ComboBoxEvent from '../../../../../../types/ComboBoxEvent';
import type {
  TestingSearchResponseType,
  ActivityIdType,
  ActivityRiaSkeyType,
  TestCodeType
} from '../../../../../../types/consep/TestingSearchType';
import type { AddActivityRequest } from './definitions';
import './styles.scss';

const AddActivity = (
  { table, closeModal }:
  { table: MRT_TableInstance<TestingSearchResponseType>; closeModal: () => void }
) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const columns = useMemo(() => getAddActivityTableColumns(), []);
  const selectedRows = table.getSelectedRowModel()?.rows.map((row) => row.original) ?? [];
  const requestSkey = selectedRows[0]?.requestSkey;
  const itemId = selectedRows[0]?.itemId;
  const isTestActivity = Boolean(selectedRows[0]?.testCategoryCd);
  const todayString = new Date().toISOString().split('T')[0];
  const REQUIRED_FIELDS = useMemo<(keyof AddActivityRequest)[]>(() => {
    const baseFields: (keyof AddActivityRequest)[] = [
      'riaKey',
      'standardActivityId',
      'plannedStartDate',
      'plannedEndDate',
      'activityDuration',
      'activityTimeUnit',
      'requestSkey',
      'requestId',
      'itemId',
      'vegetationState'
    ];

    if (isTestActivity) {
      baseFields.push('testCategoryCd');
    }

    return baseFields;
  }, [isTestActivity]);

  const [addActivityData, setAddActivityData] = useState<Partial<AddActivityRequest>>({
    riaKey: selectedRows[0].riaSkey,
    plannedStartDate: todayString,
    requestSkey: selectedRows[0].requestSkey,
    requestId: selectedRows[0].reqId,
    itemId: selectedRows[0].itemId,
    vegetationState: selectedRows[0].species
  });
  const [alert, setAlert] = useState<{
    status: 'error' | 'info' | 'success' | 'warning';
    message: string;
  } | null>(null);
  const isAddActivityValid = REQUIRED_FIELDS.every(
    (field) => addActivityData[field] !== undefined && addActivityData[field] !== null && addActivityData[field] !== ''
  );

  const activityIdQuery = useQuery({
    queryKey: ['activity-ids'],
    queryFn: getActivityIds,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: ActivityIdType[]) => data?.map((activity) => activity.standardActivityId) ?? []
  });

  const activityRiaSkeyQuery = useQuery({
    queryKey: ['activity-riaSkeys', requestSkey, itemId],
    queryFn: () => getActivityRiaSkeys(requestSkey, itemId),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: ActivityRiaSkeyType[]) => data.map((activity) => ({
      id: activity.riaSkey,
      text: String(activity.riaSkey)
    }))
  });

  const testCategoryQuery = useQuery({
    queryKey: ['test-category-codes'],
    queryFn: getTestCategoryCodes,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: TestCodeType[]) => data?.map((testCode) => testCode.code) ?? []
  });

  const activityDurationUnitQuery = useQuery({
    queryKey: ['activity-duration-units'],
    queryFn: getActivityDurationUnits,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
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
    if (failedMessages.length > 0) {
      setAlert({
        status: 'error',
        message: `Failed to load: ${failedMessages.join('; ')}.`
      });
    } else {
      setAlert(null);
    }
  }, [
    activityIdQuery.error,
    activityRiaSkeyQuery.error,
    testCategoryQuery.error,
    activityDurationUnitQuery.error
  ]);

  const updateField = <K extends keyof AddActivityRequest>(
    field: K,
    value: AddActivityRequest[K]
  ) => {
    console.log('selectedRows', selectedRows[0]);
    setAddActivityData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto calculate plannedEndDate when is not set
      if (
        field === 'activityDuration'
        || field === 'activityTimeUnit'
        || field === 'plannedStartDate'
      ) {
        if (
          !newData.plannedEndDate
          && newData.plannedStartDate
          && newData.activityDuration
          && newData.activityTimeUnit
        ) {
          const startDate = new Date(newData.plannedStartDate);
          const duration = Number(newData.activityDuration);

          const endDate = new Date(startDate);

          switch (newData.activityTimeUnit) {
            case 'HR':
              endDate.setHours(endDate.getHours() + duration);
              break;
            case 'DY':
              endDate.setDate(endDate.getDate() + duration);
              break;
            case 'WK':
              endDate.setDate(endDate.getDate() + duration * 7);
              break;
            case 'MO':
              endDate.setMonth(endDate.getMonth() + duration);
              break;
            case 'YR':
              endDate.setFullYear(endDate.getFullYear() + duration);
              break;
            default:
              endDate.setDate(endDate.getDate() + duration);
          }

          const [dateString] = endDate.toISOString().split('T');
          newData.plannedEndDate = dateString;
        }
      }

      console.log('newData', newData);
      return newData;
    });
  };

  return (
    <div>
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
          selectedItem={toSelectedItemString(addActivityData.standardActivityId)}
          onChange={(e: ComboBoxEvent) => updateField('standardActivityId', e.selectedItem)}
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
          onChange={(e: ComboBoxEvent) => updateField('associatedRiaKey', e.selectedItem.id)}
        />
        <ComboBox
          id="add-activity-test-category-select"
          className="add-activity-select"
          titleText={isTestActivity ? <RequiredFormFieldLabel text="Test category" /> : 'Test category'}
          items={testCategoryQuery.data ?? []}
          selectedItem={toSelectedItemString(addActivityData.testCategoryCd)}
          onChange={(e: ComboBoxEvent) => updateField('testCategoryCd', e.selectedItem)}
        />
        <div className="add-activity-date-picker">
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            minDate={minStartDate}
            maxDate={addActivityData.plannedEndDate ?? maxEndDate}
            value={[addActivityData.plannedStartDate ?? todayString]}
            onChange={(dates: Date[]) => {
              if (dates[0]) {
                updateField('plannedStartDate', dates[0].toISOString().split('T')[0]);
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
            value={[addActivityData.plannedEndDate]}
            onChange={(dates: Date[]) => {
              if (dates[0]) {
                updateField('plannedEndDate', dates[0].toISOString().split('T')[0]);
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
            value={addActivityData.activityDuration ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              updateField('activityDuration', Number(e.target.value));
            }}
          />
          <ComboBox
            id="add-activity-duration-unit-select"
            items={activityDurationUnitQuery.data ?? []}
            selectedItem={toSelectedItemString(addActivityData.activityTimeUnit)}
            onChange={(e: ComboBoxEvent) => updateField('activityTimeUnit', e.selectedItem)}
          />
        </div>
        <Checkbox
          labelText="Significant"
          id="add-activity-significant-checkbox"
          checked={addActivityData.significantStatusIndicator ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            updateField('significantStatusIndicator', e.target.checked);
          }}
        />
        <Checkbox
          labelText="Process commitment"
          id="add-activity-process-commitment-checkbox"
          checked={addActivityData.processResultIndicator ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            updateField('processResultIndicator', e.target.checked);
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
            console.log('Submitting Add Activity:', addActivityData);
            // Call API here if needed
          }}
        >
          Add Activity
        </Button>
      </div>
    </div>
  );
};

export default AddActivity;
