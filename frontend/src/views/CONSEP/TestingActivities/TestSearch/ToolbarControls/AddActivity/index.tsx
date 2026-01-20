/* eslint-disable camelcase */
import React, { useRef, useMemo, useState, ChangeEvent } from 'react';
import { type MRT_TableInstance } from 'material-react-table';
import { ComboBox, Checkbox, DatePicker, DatePickerInput, TextInput } from '@carbon/react';
import GenericTable from '../../../../../../components/GenericTable';
import { getAddActivityTableColumns } from './constants';
import { DATE_FORMAT, maxEndDate, minStartDate } from '../../constants';
import type { TestingSearchResponseType } from '../../../../../../types/consep/TestingSearchType';
import ComboBoxEvent from '../../../../../../types/ComboBoxEvent';
import RequiredFormFieldLabel from '../../../../../../components/RequiredFormFieldLabel';
import type { AddActivityRequest } from './definitions';
import './styles.scss';

const activityOptions = [
  { id: 'ACT1', text: 'Activity One' },
  { id: 'ACT2', text: 'Activity Two' },
  { id: 'ACT3', text: 'Activity Three' }
];

const activityRiaKeyOptions = [
  { id: 'PRC', text: 'Process' },
  { id: 'TST', text: 'Test' },
  { id: 'OTH', text: 'Other' }
];

const testCategoryOptions = [
  { id: 'CAT1', text: 'Category One' },
  { id: 'CAT2', text: 'Category Two' },
  { id: 'CAT3', text: 'Category Three' }
];

const durationUnitOptions = [
  { id: 'HR', text: 'Hours' },
  { id: 'DY', text: 'Days' },
  { id: 'WK', text: 'Weeks' }
];

const AddActivity = ({ table }: { table: MRT_TableInstance<TestingSearchResponseType> }) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const columns = useMemo(() => getAddActivityTableColumns(), []);

  const [addActivityData, setAddActivityData] = useState<Partial<AddActivityRequest>>({});
  const todayString = new Date().toISOString().split('T')[0];

  const getDatePickerValue = (date?: string): string[] => [date ?? todayString];

  const updateField = <K extends keyof AddActivityRequest>(
    field: K,
    value: AddActivityRequest[K]
  ) => {
    console.log(`Updating field ${field} to value ${value}`);
    setAddActivityData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <GenericTable
        columns={columns}
        data={table.getSelectedRowModel()?.rows.map((item) => item.original) ?? []}
        tableBodyRef={tableBodyRef}
      />
      <div className="add-activity-form">
        <ComboBox
          required
          id="add-activity-activity-id-select"
          className="add-activity-select"
          titleText={<RequiredFormFieldLabel text="Activity" />}
          items={activityOptions}
          itemToString={(item) => item?.id ?? ''}
          selectedItem={activityOptions.find((o) => o.id === addActivityData.standardActivityId)}
          onChange={(e: ComboBoxEvent) => updateField('standardActivityId', e.selectedItem?.id)}
        />
        <ComboBox
          id="add-activity-part-of-activity-select"
          className="add-activity-select"
          titleText="Part of activity"
          items={activityRiaKeyOptions}
          itemToString={(item) => item?.id ?? ''}
          selectedItem={activityRiaKeyOptions.find(
            (o) => o.id === addActivityData.associatedRiaKey
          )}
          onChange={(e: ComboBoxEvent) => updateField('associatedRiaKey', e.selectedItem?.id)}
        />
        <ComboBox
          id="add-activity-test-category-select"
          className="add-activity-select"
          titleText="Test category"
          items={testCategoryOptions}
          itemToString={(item) => item?.id ?? ''}
          selectedItem={testCategoryOptions.find((o) => o.id === addActivityData.testCategoryCd)}
          onChange={(e: ComboBoxEvent) => updateField('testCategoryCd', e.selectedItem?.id)}
        />
        <div className="add-activity-date-picker">
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            minDate={minStartDate}
            maxDate={maxEndDate}
            value={getDatePickerValue(addActivityData.plannedStartDate)}
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
            value={getDatePickerValue(addActivityData.plannedEndDate)}
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
            items={durationUnitOptions}
            itemToString={(item) => item?.text ?? ''}
            selectedItem={durationUnitOptions.find(
              (o) => o.id === addActivityData.activityTimeUnit
            )}
            onChange={(e: ComboBoxEvent) => updateField('activityTimeUnit', e.selectedItem?.id)}
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
    </div>
  );
};

export default AddActivity;
