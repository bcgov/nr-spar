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
import { getTestCategoryCodes } from '../../../../../api-service/consep/searchTestingActivitiesAPI';

import type { TestCodeType } from '../../../../../types/consep/TestingSearchType';
import {
  advDateTypes, DATE_FORMAT, errorMessages, initialErrorValue, maxEndDate,
  minStartDate, requestTypeSt, SAFE_MARGIN, species, testRanks
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

  const handleCheckboxesChanges = (
    searchField: keyof ActivitySearchRequest,
    value: boolean
  ) => {
    setSearchParams((prev) => {
      // If unchecked, remove the field by setting undefined
      if (!value) {
        return {
          ...prev,
          [searchField]: undefined
        };
      }

      return {
        ...prev,
        [searchField]: true
      };
    });
  };
  const handleRequestIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    let error = false;
    let errorMessage = '';

    if (value.length > 5) {
      error = true;
      errorMessage = errorMessages.reqId;
    }

    setSearchParams((prev) => ({
      ...prev,
      requestId: value
    }));

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
    data: ComboBoxEvent
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      [searchField]: data.selectedItem ?? undefined
    }));
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

    setSearchParams((prev) => ({
      ...prev,
      requestYear: Number.isNaN(parsed) ? undefined : parsed
    }));
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

    setSearchParams((prev) => ({
      ...prev,
      orchardId: value
    }));
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
      const currentFrom = prev[fromKey];
      const currentTo = prev[toKey];

      let newFrom = currentFrom;
      let newTo = currentTo;

      if (range === 'From') {
        newFrom = value || undefined;
        newTo = (
          newFrom && !newTo
        )
          ? maxEndDate
          : newTo;
      }

      if (range === 'To') {
        newTo = value || undefined;
        newFrom = (
          newTo && !newFrom
        )
          ? minStartDate
          : newFrom;
      }

      return {
        ...prev,
        [fromKey]: newFrom,
        [toKey]: newTo
      };
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

      return {
        ...prev,
        [groupKey]: value
      };
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

  const toSelectedItemString = (v?: string | null) => (v ?? null);

  const clearFilters = () => {
    setSearchParams((prev) => ({
      ...prev,
      requestId: undefined,
      requestType: undefined,
      requestYear: undefined,
      orchardId: undefined,
      testCategoryCd: undefined,
      testRank: undefined,
      species: undefined,
      actualBeginDateFrom: undefined,
      actualBeginDateTo: undefined,
      actualEndDateFrom: undefined,
      actualEndDateTo: undefined,
      revisedStartDateFrom: undefined,
      revisedStartDateTo: undefined,
      revisedEndDateFrom: undefined,
      revisedEndDateTo: undefined,
      germTrayAssignment: undefined,
      completeStatus: undefined,
      acceptanceStatus: undefined,
      seedlotClass: undefined,
      includeHistoricalTests: undefined,
      germTestsOnly: undefined,
      familyLotsOnly: undefined
    }));

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
        {testCategoryQuery.isError && (
          <InlineNotification
            lowContrast
            kind="error"
            subtitle={`Failed to load test categories: ${testCategoryQuery.error?.message}`}
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
                id="familylots-only"
                labelText="Family lot numbers only"
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
              items={requestTypeSt}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('requestType', e);
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
                handleComboBoxesChanges('testCategoryCd', e);
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
                handleComboBoxesChanges('testRank', e);
              }}
              selectedItem={toSelectedItemString(searchParams.testRank)}
            />
          </Column>
          <Column md={2} lg={4}>
            <ComboBox
              id="species-input"
              className="species-input"
              titleText="Species"
              items={species}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('species', e);
              }}
              selectedItem={toSelectedItemString(searchParams.species)}
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
                  onChange={(e: Array<Date>) => {
                    const fromField = dateType === 'revised' ? 'StartDate' : 'BeginDate';
                    handleAdvDateChange(e, dateType as 'actual' | 'revised', fromField, 'From');
                  }}
                  value={toDatePickerValue(
                    dateType === 'actual'
                      ? searchParams.actualBeginDateFrom
                      : searchParams.revisedStartDateFrom,
                    minStartDate
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
                  onChange={(e: Array<Date>) => {
                    const fromField = dateType === 'revised' ? 'StartDate' : 'BeginDate';
                    handleAdvDateChange(e, dateType as 'actual' | 'revised', fromField, 'To');
                  }}
                  value={toDatePickerValue(
                    dateType === 'actual'
                      ? searchParams.actualBeginDateTo
                      : searchParams.revisedStartDateTo,
                    maxEndDate
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
                  onChange={(e: Array<Date>) => {
                    handleAdvDateChange(e, dateType as 'actual' | 'revised', 'EndDate', 'From');
                  }}
                  value={toDatePickerValue(
                    dateType === 'actual'
                      ? searchParams.actualEndDateFrom
                      : searchParams.revisedEndDateFrom,
                    minStartDate
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
                    maxEndDate
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
