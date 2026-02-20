import React, { ChangeEvent, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactDOM from 'react-dom';
import {
  FlexGrid,
  Row,
  Column,
  CheckboxGroup,
  Checkbox,
  DatePicker,
  DatePickerInput,
  ComboBox,
  Button,
  TextInput,
  InlineNotification
} from '@carbon/react';

import ComboBoxEvent from '../../../../../types/ComboBoxEvent';
import { capitalizeFirstLetter } from '../../../../../utils/StringUtils';
import useWindowSize from '../../../../../hooks/UseWindowSize';
import getVegCodes from '../../../../../api-service/vegetationCodeAPI';
import { getMultiOptList } from '../../../../../utils/MultiOptionsUtils';
import { getRequestTypes, getTestCategoryCodes } from '../../../../../api-service/consep/testCodesAPI';

import type { TestCodeType } from '../../../../../types/consep/TestingSearchType';
import {
  advDateTypes, DATE_FORMAT, errorMessages, initialErrorValue,
  SAFE_MARGIN, testRanks, toSelectedItemString, dateField
} from '../constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../../config/TimeUnits';
import { ActivitySearchRequest, ActivitySearchValidation } from '../definitions';
import './styles.scss';

type AdvancedFiltersProps = {
  searchParams: ActivitySearchRequest;
  setSearchParams: React.Dispatch<React.SetStateAction<ActivitySearchRequest>>;
  validateSearch: ActivitySearchValidation;
  setValidateSearch: React.Dispatch<React.SetStateAction<ActivitySearchValidation>>;
  alignTo: { top: number; left: number; width: number };
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
};

const AdvancedFilters = ({
  searchParams,
  setSearchParams,
  validateSearch,
  setValidateSearch,
  alignTo,
  onClose,
  anchorRef
}: AdvancedFiltersProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const windowSize = useWindowSize();

  const testCategoryQuery = useQuery({
    queryKey: ['test-category-codes'],
    queryFn: getTestCategoryCodes,
    staleTime: THREE_HOURS, // data is fresh for 3 hours
    gcTime: THREE_HALF_HOURS, // data is cached 3.5 hours then deleted
    select: (data: TestCodeType[]) => data?.map((testCode) => testCode.code) ?? []
  });

  const requestTypeQuery = useQuery({
    queryKey: ['request-types'],
    queryFn: getRequestTypes,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: TestCodeType[]) => data?.map((requestType) => requestType.code) ?? []
  });

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: getVegCodes,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (modalRef.current?.contains(target)) return;

      // This is necessary because the datepicker calendar and combobox options
      // are considered "out of the modal", because they are rendered by a react portal
      // attached to the body element, thus being outside of the modal,
      // but a click on them should not close the modal
      const el = target as HTMLElement;
      if (el.closest('.flatpickr-calendar')) return;
      if (el.closest('.cds--list-box__menu')) return;

      // Necessary to properly close the modal when the button is clicked
      if (anchorRef.current?.contains(target)) return;

      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose, anchorRef]);

  const updateSearchParams = <K extends keyof ActivitySearchRequest>(
    prev: ActivitySearchRequest,
    key: K,
    value: ActivitySearchRequest[K] | null
  ) => {
    const updated = { ...prev };

    if (value != null) {
      updated[key] = value;
    } else {
      delete updated[key];
    }

    return updated;
  };

  const handleCheckboxesChanges = (
    searchField: 'includeHistoricalTests' | 'germTestsOnly' | 'familyLotsOnly',
    value: boolean
  ) => {
    setSearchParams((prev) => (
      updateSearchParams(prev, searchField, value ? true : null)
    ));
  };

  const handleRequestIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    let error = false;
    let errorMessage = '';

    if (value.length > 5) {
      error = true;
      errorMessage = errorMessages.reqId;
    }

    setSearchParams((prev) => (updateSearchParams(prev, 'requestId', value || null)));

    setValidateSearch((prev) => ({
      ...prev,
      requestId: {
        error,
        errorMessage
      }
    }));
  };

  const handleComboBoxesChanges = (
    searchField: keyof ActivitySearchRequest,
    selectedItem: string | undefined
  ) => {
    setSearchParams((prev) => (
      updateSearchParams(
        prev,
        searchField,
        selectedItem && selectedItem !== '' ? selectedItem : null
      )
    ));
  };

  const handleRequestYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const parsed = value === '' ? undefined : parseInt(value, 10);

    let error = false;
    let errorMessage = '';

    if (parsed && value !== '') {
      if (!/^\d{4}$/.test(value)) {
        error = true;
        errorMessage = errorMessages.reqYearSize;
      } else if (parsed < 1900 || parsed > 9999) {
        error = true;
        errorMessage = errorMessages.reqYearInterval;
      }
    }

    setSearchParams((prev) => (
      updateSearchParams(
        prev,
        'requestYear',
        Number.isNaN(parsed) ? null : parsed ?? null
      )
    ));

    setValidateSearch((prev) => ({
      ...prev,
      requestYear: {
        error,
        errorMessage
      }
    }));
  };

  const handleOrchardIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    let error = false;
    let errorMessage = '';

    if (value.length > 3) {
      error = true;
      errorMessage = errorMessages.reqId;
    }

    setSearchParams((prev) => (
      updateSearchParams(
        prev,
        'orchardId',
        value || null
      )
    ));

    setValidateSearch((prev) => ({
      ...prev,
      orchardId: {
        error,
        errorMessage
      }
    }));
  };

  const formatDate = (raw: string | Date | undefined): string | undefined => {
    if (!raw) {
      return undefined;
    }

    if (typeof raw === 'string') {
      return raw;
    }

    if (raw instanceof Date) {
      return raw.toISOString().slice(0, 10);
    }

    return undefined;
  };

  const handleAdvDateChange = (
    dates: (string | Date)[],
    group: 'actual' | 'revised',
    field: 'BeginDate' | 'StartDate'| 'EndDate',
    range: 'From' | 'To'
  ) => {
    const raw = dates?.[0];
    const value = formatDate(raw);

    const fromKey = `${group}${field}From` as keyof ActivitySearchRequest;
    const toKey = `${group}${field}To` as keyof ActivitySearchRequest;

    setSearchParams((prev) => {
      let updated = prev;

      if (range === 'From') {
        updated = updateSearchParams(updated, fromKey, value ?? null);
      }

      if (range === 'To') {
        updated = updateSearchParams(updated, toKey, value ?? null);
      }

      return updated;
    });
  };

  const handleCheckboxGroupsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    groupKey: keyof ActivitySearchRequest
  ) => {
    const { id, checked } = e.target;

    setSearchParams((prev) => {
      let value: any;

      switch (groupKey) {
        case 'germTrayAssignment':
          if (checked) {
            value = id === 'germ-tray-assigned' ? -1 : 0;
          } else {
            value = undefined;
          }
          break;

        case 'completeStatus':
          if (checked) {
            value = id === 'completion-complete' ? -1 : 0;
          } else {
            value = undefined;
          }
          break;

        case 'acceptanceStatus':
          if (checked) {
            value = id === 'acception-accepted' ? -1 : 0;
          } else {
            value = undefined;
          }
          break;

        case 'seedlotClass':
          if (checked) {
            value = id === 'seed-class-a' ? 'A' : 'B';
          } else {
            value = undefined;
          }
          break;

        default:
          value = undefined;
      }

      return updateSearchParams(prev, groupKey, value ?? null);
    });
  };

  const toDatePickerValue = (date?: string, sentinel?: string): string[] => {
    if (!date) return [];
    if (sentinel && date === sentinel) return [];
    return [date];
  };

  const toInputValue = (
    v: string | number | undefined | null
  ) => (v === undefined || v === null ? '' : String(v));

  const clearFilters = () => {
    setSearchParams(() => ({} as ActivitySearchRequest));

    setValidateSearch((prev) => ({
      ...prev,
      requestId: initialErrorValue,
      requestYear: initialErrorValue,
      orchardId: initialErrorValue
    }));
  };

  const getSidebarWidth = () => {
    const el = document.querySelector('.spar-side-nav');
    return el ? (el as HTMLElement).getBoundingClientRect().width : 256; // fallback razoável
  };

  const positionStyle: React.CSSProperties = React.useMemo(() => {
    const sidebarWidth = getSidebarWidth();
    const rightOffset = Math.max(window.innerWidth - alignTo.left, 0);
    const spaceLeftOfAnchor = alignTo.left - sidebarWidth - SAFE_MARGIN;
    const MIN_WIDTH = 480;

    const maxWidthPx = Math.max(spaceLeftOfAnchor, MIN_WIDTH);

    return {
      position: 'absolute',
      top: alignTo.top,
      right: rightOffset,
      zIndex: 1000,
      width: 'auto',
      maxWidth: `${maxWidthPx}px`,
      minWidth: `${MIN_WIDTH}px`
    };
  }, [alignTo.left, alignTo.top, windowSize.innerWidth]);

  const advSearchComponent = (
    <div
      ref={modalRef}
      style={positionStyle}
      className="consep-test-filters-modal"
    >
      <FlexGrid className="consep-test-search-content">
        {(requestTypeQuery.isError || testCategoryQuery.isError || vegCodeQuery.isError) && (
          <InlineNotification
            lowContrast
            kind="error"
            subtitle={`Failed to load dropdown list options: ${
              (
                (requestTypeQuery.error ?? testCategoryQuery.error ?? vegCodeQuery.error) as any
              )?.response?.data?.message
            }`}
          />
        )}
        <Row>
          <Column>
            <CheckboxGroup
              className="search-for-fields"
              legendText="Search for"
              orientation="horizontal"
            >
              <Checkbox
                id="historical-tests"
                labelText="Historical tests"
                checked={!!searchParams.includeHistoricalTests}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleCheckboxesChanges('includeHistoricalTests', e.target.checked);
                }}
              />
              <Checkbox
                id="germination-only"
                labelText="Germination tests only"
                checked={!!searchParams.germTestsOnly}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleCheckboxesChanges('germTestsOnly', e.target.checked);
                }}
              />
              <Checkbox
                id="family-lots-only"
                labelText="Family lot # only"
                checked={!!searchParams.familyLotsOnly}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleCheckboxesChanges('familyLotsOnly', e.target.checked);
                }}
              />
            </CheckboxGroup>
          </Column>
        </Row>
        <Row>
          <Column md={2} lg={4}>
            <TextInput
              id="request-id-input"
              className="request-id-input"
              labelText="Request ID"
              value={toInputValue(searchParams.requestId)}
              invalid={validateSearch.requestId.error}
              invalidText={validateSearch.requestId.errorMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleRequestIdChange(e);
              }}
            />
          </Column>
          <Column md={2} lg={4}>
            <ComboBox
              id="request-type-input"
              className="request-type-input"
              titleText="Request type"
              items={requestTypeQuery.data ?? []}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('requestType', e.selectedItem);
              }}
              selectedItem={toSelectedItemString(searchParams.requestType)}
            />
          </Column>
          <Column md={2} lg={4}>
            <TextInput
              id="request-year-input"
              className="request-year-input"
              labelText="Request year"
              type="number"
              invalid={validateSearch.requestYear.error}
              invalidText={validateSearch.requestYear.errorMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleRequestYearChange(e);
              }}
              value={toInputValue(searchParams.requestYear)}
            />
          </Column>
          <Column md={2} lg={4}>
            <TextInput
              id="orchard-id-input"
              className="orchard-id-input"
              labelText="Orchard ID"
              type="number"
              invalid={validateSearch.orchardId.error}
              invalidText={validateSearch.orchardId.errorMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleOrchardIdChange(e);
              }}
              value={toInputValue(searchParams.orchardId)}
            />
          </Column>
        </Row>
        <Row>
          <Column md={2} lg={4}>
            <ComboBox
              id="category-input"
              className="category-input"
              titleText="Category"
              items={testCategoryQuery.data ?? []}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('testCategoryCd', e.selectedItem);
              }}
              selectedItem={toSelectedItemString(searchParams.testCategoryCd)}
            />
          </Column>
          <Column md={2} lg={4}>
            <ComboBox
              id="rank-input"
              className="rank-input"
              titleText="Rank"
              items={testRanks}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('testRank', e.selectedItem);
              }}
              selectedItem={toSelectedItemString(searchParams.testRank)}
            />
          </Column>
          <Column md={2} lg={4}>
            <ComboBox
              id="species-input"
              className="species-input"
              titleText="Species"
              items={vegCodeQuery.data ?? []}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('species', e.selectedItem ? e.selectedItem.code : undefined);
              }}
              selectedItem={vegCodeQuery.data?.find(
                (o) => o.code === searchParams.species
              )}
            />
          </Column>
        </Row>
        {
          advDateTypes.map((dateType) => (
            <Row key={`${dateType}-date-row`}>
              <Column md={2} lg={4}>
                <DatePicker
                  datePickerType="single"
                  className="advanced-date-input"
                  dateFormat={DATE_FORMAT}
                  minDate={dateField.minStartDate}
                  maxDate={dateField.maxEndDate}
                  onChange={(e: Array<Date>) => {
                    const fromField = dateType === 'revised' ? 'StartDate' : 'BeginDate';
                    handleAdvDateChange(e, dateType as 'actual' | 'revised', fromField, 'From');
                  }}
                  value={toDatePickerValue(
                    dateType === 'actual'
                      ? searchParams.actualBeginDateFrom
                      : searchParams.revisedStartDateFrom,
                    dateField.minStartDate.toISOString().slice(0, 10)
                  )}
                >
                  <DatePickerInput
                    id={`${dateType}-begin-from-input`}
                    placeholder="yyyy/mm/dd"
                    labelText={`${capitalizeFirstLetter(dateType)} begin date from`}
                    autoComplete="off"
                  />
                </DatePicker>
              </Column>
              <Column md={2} lg={4}>
                <DatePicker
                  datePickerType="single"
                  className="advanced-date-input"
                  dateFormat={DATE_FORMAT}
                  minDate={
                    dateType === 'actual'
                      ? searchParams.actualBeginDateFrom ?? undefined
                      : searchParams.revisedStartDateFrom ?? undefined
                  }
                  maxDate={dateField.maxEndDate}
                  onChange={(e: Array<Date>) => {
                    const fromField = dateType === 'revised' ? 'StartDate' : 'BeginDate';
                    handleAdvDateChange(e, dateType as 'actual' | 'revised', fromField, 'To');
                  }}
                  value={toDatePickerValue(
                    dateType === 'actual'
                      ? searchParams.actualBeginDateTo
                      : searchParams.revisedStartDateTo,
                    dateField.maxEndDate.toISOString().slice(0, 10)
                  )}
                >
                  <DatePickerInput
                    id={`${dateType}-begin-to-input`}
                    placeholder="yyyy/mm/dd"
                    labelText={`${capitalizeFirstLetter(dateType)} begin date to`}
                    autoComplete="off"
                  />
                </DatePicker>
              </Column>
              <Column md={2} lg={4}>
                <DatePicker
                  datePickerType="single"
                  className="advanced-date-input"
                  dateFormat={DATE_FORMAT}
                  minDate={dateField.minStartDate}
                  maxDate={dateField.maxEndDate}
                  onChange={(e: Array<Date>) => {
                    handleAdvDateChange(e, dateType as 'actual' | 'revised', 'EndDate', 'From');
                  }}
                  value={toDatePickerValue(
                    dateType === 'actual'
                      ? searchParams.actualEndDateFrom
                      : searchParams.revisedEndDateFrom,
                    dateField.minStartDate.toISOString().slice(0, 10)
                  )}
                >
                  <DatePickerInput
                    id={`${dateType}-end-from-input`}
                    placeholder="yyyy/mm/dd"
                    labelText={`${capitalizeFirstLetter(dateType)} end date from`}
                    autoComplete="off"
                  />
                </DatePicker>
              </Column>
              <Column md={2} lg={4}>
                <DatePicker
                  datePickerType="single"
                  className="advanced-date-input"
                  dateFormat={DATE_FORMAT}
                  minDate={
                    dateType === 'actual'
                      ? searchParams.actualBeginDateTo ?? undefined
                      : searchParams.revisedStartDateTo ?? undefined
                  }
                  onChange={(e: Array<Date>) => {
                    handleAdvDateChange(e, dateType as 'actual' | 'revised', 'EndDate', 'To');
                  }}
                  value={toDatePickerValue(
                    dateType === 'actual'
                      ? searchParams.actualEndDateTo
                      : searchParams.revisedEndDateTo,
                    dateField.maxEndDate.toISOString().slice(0, 10)
                  )}
                >
                  <DatePickerInput
                    id={`${dateType}-end-to-input`}
                    placeholder="yyyy/mm/dd"
                    labelText={`${capitalizeFirstLetter(dateType)} end date to`}
                    autoComplete="off"
                  />
                </DatePicker>
              </Column>
            </Row>
          ))
        }
        <Row>
          <Column md={2} lg={4}>
            <CheckboxGroup
              className="germ-tray-status"
              legendText="Germ tray assignment status"
              orientation="horizontal"
            >
              <Checkbox
                id="germ-tray-assigned"
                labelText="Assigned"
                checked={searchParams.germTrayAssignment === -1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'germTrayAssignment')}
              />
              <Checkbox
                id="germ-tray-unassigned"
                labelText="Unassigned"
                checked={searchParams.germTrayAssignment === 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'germTrayAssignment')}
              />
            </CheckboxGroup>
          </Column>
          <Column md={2} lg={4}>
            <CheckboxGroup
              className="completion-status"
              legendText="Completion status"
              orientation="horizontal"
            >
              <Checkbox
                id="completion-complete"
                labelText="Complete"
                checked={searchParams.completeStatus === -1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'completeStatus')}
              />
              <Checkbox
                id="completion-incomplete"
                labelText="Incomplete"
                checked={searchParams.completeStatus === 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'completeStatus')}
              />
            </CheckboxGroup>
          </Column>
          <Column md={2} lg={4}>
            <CheckboxGroup
              className="accepted-status"
              legendText="Accepted status"
              orientation="horizontal"
            >
              <Checkbox
                id="acception-accepted"
                labelText="Accepted"
                checked={searchParams.acceptanceStatus === -1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'acceptanceStatus')}
              />
              <Checkbox
                id="acception-unaccepted"
                labelText="Unaccepted"
                checked={searchParams.acceptanceStatus === 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'acceptanceStatus')}
              />
            </CheckboxGroup>
          </Column>
          <Column md={2} lg={4}>
            <CheckboxGroup
              className="seed-class"
              legendText="Seed class"
              orientation="horizontal"
            >
              <Checkbox
                id="seed-class-a"
                labelText="A class"
                checked={searchParams.seedlotClass === 'A'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'seedlotClass')}
              />
              <Checkbox
                id="seed-class-b"
                labelText="B class"
                checked={searchParams.seedlotClass === 'B'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxGroupsChange(e, 'seedlotClass')}
              />
            </CheckboxGroup>
          </Column>
        </Row>
        <Row className="button-row">
          <Button
            size="md"
            kind="tertiary"
            onClick={() => {}}
          >
            Save search criteria
          </Button>
          <Button
            size="md"
            kind="tertiary"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </Row>
      </FlexGrid>
    </div>
  );

  return ReactDOM.createPortal(
    advSearchComponent,
    document.body
  );
};

export default AdvancedFilters;
