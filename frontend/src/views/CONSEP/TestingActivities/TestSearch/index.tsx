import React, {
  ChangeEvent,
  useRef,
  useState,
  useEffect
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  Column,
  DatePicker,
  DatePickerInput,
  Button,
  TextInput,
  InlineNotification,
  FormLabel,
  FilterableMultiSelect
} from '@carbon/react';
import { Search } from '@carbon/icons-react';
// eslint-disable-next-line import/no-unresolved
import { mkConfig, generateCsv, download } from 'export-to-csv';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import { searchTestingActivities } from '../../../../api-service/consep/searchTestingActivitiesAPI';
import { getTestTypeCodes, getActivityIds } from '../../../../api-service/consep/testCodesAPI';
import type {
  TestingSearchResponseType,
  PaginatedTestingSearchResponseType,
  PaginationInfoType,
  TestCodeType,
  ActivityIdType
} from '../../../../types/consep/TestingSearchType';
import TestListTable from './TestListTable';
import TablePlaceholder from './TablePlaceholder';
import AdvancedFilters from './AdvancedFilter';
import {
  DATE_FORMAT,
  testSearchCrumbs,
  iniActSearchValidation,
  errorMessages,
  dateField,
  formatExportData,
  columnVisibilityLocalStorageKey,
  isFamilyLot
} from './constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import {
  ActivitySearchRequest,
  ActivitySearchValidation,
  Sorting,
  ExportMutationVariables,
  VisibilityConfig
} from './definitions';
import './styles.scss';

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
  filename: `Testing_Activity_Search_${new Date().toISOString().split('T')[0]}`
});
const LOT_INPUT_KEYS = ['lot-input-1', 'lot-input-2', 'lot-input-3', 'lot-input-4', 'lot-input-5'] as const;
const toDate = (value?: string) => (value ? new Date(`${value}T00:00:00`) : undefined);

const TestSearch = () => {
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<ActivitySearchRequest>({});
  const [sorting, setSorting] = useState<Sorting[]>([]);
  const [rawLotInput, setRawLotInput] = useState<string[]>(['', '', '', '', '']);
  const [validateSearch, setValidateSearch] = useState<ActivitySearchValidation>(
    iniActSearchValidation
  );
  const [openAdvSearch, setOpenAdvSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<TestingSearchResponseType[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 100
  });
  const [alert, setAlert] = useState<{
    status: 'error' | 'info' | 'success' | 'warning';
    message: string;
  } | null>(null);
  const [modalAnchor, setModalAnchor] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Track which date picker needs refocus after auto-filling today's date via shortcut
  const [pendingDatePickerFocus, setPendingDatePickerFocus] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    // Refocus input after state updates to reopen calendar picker with the correct month
    if (pendingDatePickerFocus) {
      const inputElement = document.getElementById(
        `withdrawal-${pendingDatePickerFocus}-date-input`
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        setPendingDatePickerFocus(null);
      }
    }
  }, [searchParams.seedWithdrawalStartDate,
    searchParams.seedWithdrawalEndDate,
    pendingDatePickerFocus]);

  const advSearchRef = useRef<HTMLButtonElement>(null);

  const resetAlert = () => {
    if (alert) {
      setAlert(null);
    }
  };

  const searchMutation = useMutation({
    mutationFn: ({
      filter,
      page = 0,
      size = 100,
      sortBy,
      sortDirection
    }: {
      filter: ActivitySearchRequest;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    }) => searchTestingActivities(filter, sortBy, sortDirection, false, size, page),
    onMutate: () => {
      resetAlert();
      setHasSearched(true);
    },
    onSuccess: (data: PaginatedTestingSearchResponseType) => {
      setSearchResults(data.content);
      setPaginationInfo({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize
      });
      if (data.missingLotNumbers && data.missingLotNumbers.length > 0) {
        setAlert({
          status: 'warning',
          message: `The following lot numbers were not found: ${data.missingLotNumbers.join(
            ', '
          )}. Please check the lot numbers and try again.`
        });
      }
    },
    onError: (error: unknown) => {
      let errorMessage = 'Search failed.';
      if (error instanceof Error && error.message) {
        errorMessage = `Search failed with the error: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Search failed with the error: ${error}`;
      }
      setAlert({
        status: 'error',
        message: errorMessage
      });
    }
  });

  const exportMutation = useMutation({
    mutationFn: (
      { filter, sortBy, sortDirection }: ExportMutationVariables
    ) => searchTestingActivities(filter, sortBy, sortDirection, true, 0, 0),

    onSuccess: (data: PaginatedTestingSearchResponseType) => {
      const visibilityConfig: VisibilityConfig = JSON.parse(
        localStorage.getItem(columnVisibilityLocalStorageKey) || '{}'
      );

      const isVisible = (key: string) => visibilityConfig[key] !== false;

      const formattedContent = data.content.map((row: TestingSearchResponseType) => {
        const out: Record<string, string | number | null> = {};
        (
          Object.entries(formatExportData) as Array<
            [
              keyof typeof formatExportData,
              (typeof formatExportData)[keyof typeof formatExportData]
            ]
          >
        ).forEach(([key, cfg]) => {
          if (!isVisible(String(key))) return;
          out[cfg.header] = cfg.value(row);
        });
        return out;
      });

      const csv = generateCsv(csvConfig)(formattedContent);
      download(csvConfig)(csv);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error && error.message ? error.message : 'Unknown error';
      setAlert({
        status: 'error',
        message: `Failed to export data: ${message}`
      });
    }
  });

  const handleSortingChange = (newSorting: Sorting[]) => {
    setSorting(newSorting);

    const sort = newSorting[0];
    searchMutation.mutate({
      filter: searchParams,
      page: paginationInfo.pageNumber,
      size: paginationInfo.pageSize,
      sortBy: sort?.id,
      sortDirection: sort?.desc ? 'desc' : 'asc'
    });
  };

  const handleExportData = () => {
    const sort = sorting[0];
    exportMutation.mutate({
      filter: searchParams,
      sortBy: sort?.id,
      sortDirection: sort?.desc ? 'desc' : 'asc'
    });
  };

  const testTypeQuery = useQuery({
    queryKey: ['test-type-codes'],
    queryFn: getTestTypeCodes,
    staleTime: THREE_HOURS, // data is fresh for 3 hours
    gcTime: THREE_HALF_HOURS, // data is cached 3.5 hours then deleted
    select: (data: TestCodeType[]) => data?.map((testCode) => testCode.code) ?? []
  });

  const activityIdQuery = useQuery({
    queryKey: ['activity-ids'],
    queryFn: () => getActivityIds(),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data: ActivityIdType[]) => data?.map((activity) => activity.standardActivityId) ?? []
  });

  useEffect(() => {
    if (testTypeQuery.error) {
      setAlert({
        status: 'error',
        message: `Failed to load test types: ${testTypeQuery.error?.message}`
      });
    }
    if (activityIdQuery.error) {
      setAlert({
        status: 'error',
        message: `Failed to load activity IDs: ${activityIdQuery.error?.message}`
      });
    }
  }, [testTypeQuery.error, activityIdQuery.error]);

  const testTypeItems = React.useMemo(
    () => (
      testTypeQuery.data
        ? testTypeQuery.data.map((type: string) => ({
          id: type,
          text: type
        }))
        : []
    ),
    [testTypeQuery.data]
  );

  const activityIdItems = React.useMemo(
    () => (activityIdQuery.data ? activityIdQuery.data.map((id) => ({ id, text: id })) : []),
    [activityIdQuery.data]
  );

  const handlePageChange = (pageIndex: number, pageSize: number) => {
    const sort = sorting[0];
    searchMutation.mutate(
      {
        filter: searchParams,
        page: pageIndex,
        size: pageSize,
        sortBy: sort?.id,
        sortDirection: sort?.desc ? 'desc' : 'asc'
      },
      {
        onSuccess: (data: PaginatedTestingSearchResponseType) => {
          setSearchResults(data.content);
          setPaginationInfo({
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize
          });
        }
      }
    );
  };

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

  const padSeedlotNumber = (value: string): string => {
    if (/^f/i.test(value)) {
      return value;
    }

    // Seedlot must be numeric
    if (!/^\d+$/.test(value)) {
      return value;
    }

    return value.padStart(5, '0');
  };

  const validateLotNumbers = (lots: string[]) => {
    const normalizeLot = (lot: string) => {
      const trimmed = lot.trim();
      if (!trimmed) return '';
      const upper = trimmed.toUpperCase();
      return /^F/i.test(upper) ? upper : padSeedlotNumber(upper);
    };

    const normalizedLots = lots.map(normalizeLot);
    const duplicates = new Set<string>();

    // Find duplicates
    normalizedLots.forEach((lot, index) => {
      if (lot && normalizedLots.indexOf(lot) !== index) {
        duplicates.add(lot);
      }
    });

    return lots.map((lot) => {
      if (!lot.trim()) {
        return { error: false, errorMessage: '' };
      }

      const normalizedLot = normalizeLot(lot);

      // Check for duplicates
      if (duplicates.has(normalizedLot)) {
        return {
          error: true,
          errorMessage: errorMessages.lotDuplicate
        };
      }

      const isFamily = isFamilyLot(lot);
      const limit = isFamily ? 13 : 5;
      return lot.length > limit
        ? {
          error: true,
          errorMessage: isFamily ? errorMessages.familyLotMaxChar : errorMessages.lotMaxChar
        }
        : { error: false, errorMessage: '' };
    });
  };

  const handleLotInputChange = (index: number, value: string) => {
    // Allow only alphanumeric characters
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');

    const updatedInputs = [...rawLotInput];
    updatedInputs[index] = sanitizedValue;
    setRawLotInput(updatedInputs);

    const lots = updatedInputs.map((val) => val.trim()).filter((val) => val.length > 0);

    setSearchParams((prev) => updateSearchParams(prev, 'lotNumbers', lots.length > 0 ? lots : null));

    const validationResults = validateLotNumbers(updatedInputs);
    setValidateSearch((prev) => ({
      ...prev,
      lotNumbers: validationResults
    }));
    // Auto-tab to next input if current input is valid and has reached max length
    const maxLength = isFamilyLot(sanitizedValue) ? 13 : 5;

    if (
      !validationResults[index].error
      && sanitizedValue.trim().length === maxLength
      && index < rawLotInput.length - 1
    ) {
      const nextInput = document.getElementById(`lot-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
    resetAlert();
  };

  const handleMultiSelectChanges = (
    searchField: keyof ActivitySearchRequest,
    data: string[] | null
  ) => {
    setSearchParams(
      (prev) => updateSearchParams(prev, searchField, data && data.length > 0 ? data : null)
    );
    resetAlert();
  };

  const handleGermTrayIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const parsed = value === '' ? undefined : parseInt(value, 10);

    let error = false;
    let errorMessage = '';

    if (parsed && parsed >= 100000) {
      error = true;
      errorMessage = errorMessages.germTrayMax;
    }

    setSearchParams((prev) => updateSearchParams(prev, 'germinatorTrayId', Number.isNaN(parsed) ? undefined : parsed));
    setValidateSearch((prev) => ({
      ...prev,
      germinatorTray: {
        error,
        errorMessage
      }
    }));
    resetAlert();
  };

  const handleWithdrawalDateChange = (dates: Date[], type: 'start' | 'end') => {
    const raw = dates?.[0];
    const value = raw instanceof Date ? raw.toISOString().slice(0, 10) : undefined;
    const maxEnd = dateField.maxEndDate instanceof Date
      ? dateField.maxEndDate.toISOString().slice(0, 10)
      : dateField.maxEndDate;
    const minStart = dateField.minStartDate instanceof Date
      ? dateField.minStartDate.toISOString().slice(0, 10)
      : dateField.minStartDate;

    setSearchParams((prev) => {
      const currentStart = prev.seedWithdrawalStartDate;
      const currentEnd = prev.seedWithdrawalEndDate;

      let seedWithdrawalStartDate = currentStart;
      let seedWithdrawalEndDate = currentEnd;

      if (type === 'start') {
        seedWithdrawalStartDate = value || undefined;
        seedWithdrawalEndDate = seedWithdrawalStartDate
          && !seedWithdrawalEndDate ? maxEnd : currentEnd;
      }

      if (type === 'end') {
        seedWithdrawalEndDate = value || undefined;
        seedWithdrawalStartDate = seedWithdrawalEndDate
          && !seedWithdrawalStartDate ? minStart : currentStart;
      }

      return {
        ...prev,
        seedWithdrawalStartDate,
        seedWithdrawalEndDate
      };
    });
    resetAlert();
  };

  // prevent user from typing '-'
  // & allow ctrl/cmd + ';' to auto-fill today's date in date inputs
  const handleDatePicker = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'start' | 'end'
  ) => {
    if (e.key === '-') {
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === ';') {
      e.preventDefault();
      const inputElement = e.currentTarget;
      inputElement.blur();
      handleWithdrawalDateChange([dateField.todayDate], type);
      setPendingDatePickerFocus(type);
    }
  };

  const handleCloseAdvSearch = () => {
    setOpenAdvSearch(false);
    setModalAnchor(null);
  };

  const toggleAdvSearch = () => {
    if (openAdvSearch) {
      setOpenAdvSearch(false);
      setModalAnchor(null);
    } else {
      const rect = advSearchRef.current?.getBoundingClientRect();
      if (rect) {
        setModalAnchor({
          top: rect.bottom + window.scrollY,
          left: rect.right + window.scrollX,
          width: rect.width
        });
        setOpenAdvSearch(true);
      }
    }
  };

  const hasValidationErrors = (): boolean => Object.values(validateSearch).some(
    (field) => (Array.isArray(field) ? field.some((f) => f.error) : field.error)
  );

  const handleSearchClick = () => {
    if (Object.keys(searchParams).length === 0) {
      setAlert({
        status: 'error',
        message: 'At least one criteria must be entered to start the search'
      });
      return;
    }

    const paddedLotNumbers = rawLotInput.reduce<string[]>(
      (result, inputValue) => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
          result.push(padSeedlotNumber(trimmedValue));
        }
        return result;
      },
      []
    );

    if (paddedLotNumbers.length > 0) {
      setRawLotInput((prev) => prev.map((val) => (val.trim() ? padSeedlotNumber(val) : '')));
      setSearchParams((prev) => ({
        ...prev,
        lotNumbers: paddedLotNumbers.length > 0 ? paddedLotNumbers : undefined
      }));
    }

    const searchParamstoSend = {
      ...searchParams,
      lotNumbers: paddedLotNumbers.length > 0 ? paddedLotNumbers : undefined,
      ...(searchParams.testTypes?.length
        ? {
          testTypes: searchParams.testTypes.map((t: string) => {
            const v = (t ?? '').toLowerCase();
            if (v === 'sa') return 'GSA';
            if (v === 'se') return 'GSE';
            return t;
          })
        }
        : {})
    };

    searchMutation.mutate({ filter: searchParamstoSend });
  };

  return (
    <div className="consep-test-search-content">
      <FlexGrid className="consep-test-search-content">
        <Row className="consep-test-search-breadcrumb">
          <Column>
            <Breadcrumbs crumbs={testSearchCrumbs} />
          </Column>
        </Row>
        <Row className="consep-test-search-title">
          <PageTitle title="Testing activities" />
        </Row>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!hasValidationErrors()) {
              handleSearchClick();
            }
          }}
        >
          <Row className="consep-test-search-lot-numbers-filter">
            <FormLabel className="lot-inputs-label">Lot #</FormLabel>
            <div className="lot-inputs">
              {rawLotInput.map((value, index) => (
                <TextInput
                  key={`${LOT_INPUT_KEYS[index]}`}
                  id={`lot-input-${index}`}
                  value={value}
                  labelText={`Lot # ${index + 1}`}
                  hideLabel
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleLotInputChange(index, e.target.value);
                  }}
                  invalid={validateSearch.lotNumbers[index]?.error}
                  invalidText={validateSearch.lotNumbers[index]?.errorMessage}
                />
              ))}
            </div>
          </Row>
          <Row className="consep-test-search-filters">
            <Column className="filters-row">
              <FilterableMultiSelect
                id="test-type-input"
                className="test-type-input"
                titleText="Test type"
                items={testTypeItems}
                itemToString={(item: { id: string; text: string } | null) => (item ? item.text : '')}
                onChange={(event: { selectedItems: Array<{ id: string }> }) => {
                  handleMultiSelectChanges('testTypes', event.selectedItems.map((it: { id: string }) => it.id));
                }}
                selectionFeedback="top-after-reopen"
              />
              <FilterableMultiSelect
                id="activity-type-input"
                className="activity-type-input"
                titleText="Choose activity"
                items={activityIdItems}
                itemToString={(item: { id: string; text: string } | null) => (item ? item.text : '')}
                onChange={(event: { selectedItems: Array<{ id: string }> }) => {
                  handleMultiSelectChanges('activityIds', event.selectedItems.map((it: { id: string }) => it.id));
                }}
                selectionFeedback="top-after-reopen"
              />
              <TextInput
                id="germ-tray-input"
                className="germ-tray-input"
                labelText="Germ tray ID"
                type="number"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleGermTrayIdChange(e);
                }}
                value={searchParams.germinatorTrayId}
                invalid={validateSearch.germinatorTray.error}
                invalidText={validateSearch.germinatorTray.errorMessage}
              />
              <DatePicker
                datePickerType="single"
                className="withdrawal-date-input"
                dateFormat={DATE_FORMAT}
                onChange={(dates: Date[]) => {
                  handleWithdrawalDateChange(dates, 'start');
                }}
                minDate={dateField.minStartDate}
                maxDate={dateField.todayDate}
                value={
                  searchParams.seedWithdrawalStartDate
                    && searchParams.seedWithdrawalStartDate
                    !== dateField.minStartDate.toISOString().slice(0, 10)
                    ? toDate(searchParams.seedWithdrawalStartDate)
                    : undefined
                }
                style={{ minWidth: '9rem' }}
              >
                <DatePickerInput
                  id="withdrawal-start-date-input"
                  labelText="Withdrawal start"
                  autoComplete="off"
                  placeholder={dateField.placeholderText}
                  helperText={dateField.helperText}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleDatePicker(e, 'start')}
                />
              </DatePicker>
              <DatePicker
                datePickerType="single"
                className="withdrawal-date-input"
                dateFormat={DATE_FORMAT}
                onChange={(dates: Date[]) => {
                  handleWithdrawalDateChange(dates, 'end');
                }}
                minDate={searchParams.seedWithdrawalStartDate || undefined}
                maxDate={dateField.maxEndDate}
                value={
                  searchParams.seedWithdrawalEndDate
                    !== dateField.maxEndDate.toISOString().slice(0, 10)
                    ? toDate(searchParams.seedWithdrawalEndDate)
                    : undefined
                }
                style={{ minWidth: '9rem' }}
              >
                <DatePickerInput
                  id="withdrawal-end-date-input"
                  labelText="Withdrawal end"
                  autoComplete="off"
                  placeholder={dateField.placeholderText}
                  helperText={dateField.helperText}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleDatePicker(e, 'end')}
                />
              </DatePicker>
              <div className="filters-row-buttons">
                <Button ref={advSearchRef} size="md" kind="tertiary" onClick={toggleAdvSearch}>
                  Filters
                </Button>
                <Button
                  type="submit"
                  renderIcon={Search}
                  iconDescription="Search activity"
                  size="md"
                  disabled={hasValidationErrors()}
                >
                  Search activity
                </Button>
              </div>
            </Column>
          </Row>
          {openAdvSearch && modalAnchor && (
            <AdvancedFilters
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              validateSearch={validateSearch}
              setValidateSearch={setValidateSearch}
              alignTo={modalAnchor}
              onClose={handleCloseAdvSearch}
              anchorRef={advSearchRef}
            />
          )}
        </form>
      </FlexGrid>
      <FlexGrid>
        <Row className="consep-test-search-alert">
          {hasValidationErrors() ? (
            <Column>
              <InlineNotification
                lowContrast
                kind="error"
                subtitle="Errors must be fixed to search activities"
              />
            </Column>
          ) : null}
        </Row>
        <Row>
          <Column>
            {alert?.message && (
              <InlineNotification
                lowContrast
                kind={alert.status}
                subtitle={alert?.message}
                onCloseButtonClick={() => setAlert(null)}
              />
            )}
          </Column>
        </Row>
      </FlexGrid>
      {hasSearched ? (
        <TestListTable
          data={searchResults}
          onAddActivitySuccess={(newActivity) => {
            setSearchResults((prev) => [newActivity, ...prev]);
            setPaginationInfo((prev) => ({
              ...prev,
              totalElements: prev.totalElements + 1
            }));
          }}
          isLoading={searchMutation.isPending}
          paginationInfo={paginationInfo}
          sorting={sorting}
          onPageChange={handlePageChange}
          onExportData={handleExportData}
          onSortingChange={handleSortingChange}
        />
      ) : (
        <TablePlaceholder />
      )}
    </div>
  );
};

export default TestSearch;
