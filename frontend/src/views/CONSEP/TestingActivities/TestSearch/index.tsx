import React, { ChangeEvent, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  Column,
  DatePicker,
  DatePickerInput,
  ComboBox,
  Button,
  TextInput,
  InlineNotification
} from '@carbon/react';
import { Search } from '@carbon/icons-react';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import { searchTestingActivities } from '../../../../api-service/consep/searchTestingActivitiesAPI';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import type {
  TestingSearchResponseType,
  PaginatedTestingSearchResponseType,
  PaginationInfoType
} from '../../../../types/consep/TestingSearchResponseType';
import TestListTable from './TestListTable';
import TablePlaceholder from './TablePlaceholder';
import AdvancedFilters from './AdvancedFilter';
import {
  DATE_FORMAT, activityIds,
  testSearchCrumbs, testTypesCd, iniActSearchValidation,
  errorMessages, minStartDate, maxEndDate
} from './constants';
import { ActivitySearchRequest, ActivitySearchValidation } from './definitions';
import './styles.scss';

const TestSearch = () => {
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<ActivitySearchRequest>(
    {}
  );
  const [rawLotInput, setRawLotInput] = useState('');
  const [validateSearch, setValidateSearch] = useState<ActivitySearchValidation>(
    iniActSearchValidation
  );
  const [openAdvSearch, setOpenAdvSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<TestingSearchResponseType[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 20
  });
  const [alert, setAlert] = useState<{
    status: string;
    message: string;
  } | null>(null);
  const [modalAnchor, setModalAnchor] = useState<{
    top: number;
    left: number;
    width: number
  } | null>(null);

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
      size = 20
    }: {
      filter: ActivitySearchRequest;
      page?: number;
      size?: number;
    }) => searchTestingActivities(filter, page, size),
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
    },
    onError: (error) => {
      setAlert({
        status: 'error',
        message: `Search failed with the error: ${error.message}`
      });
    }
  });

  const handlePageChange = (pageIndex: number, pageSize: number) => {
    searchMutation.mutate(
      { filter: searchParams, page: pageIndex, size: pageSize },
      {
        onSuccess: (data) => {
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

  const handleLotInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setRawLotInput(value);

    const lots = value
      .split(',')
      .map((val) => val.trim())
      .filter((val) => val.length > 0);

    let error = false;
    let errorMessage = '';

    if (lots.length > 5) {
      error = true;
      errorMessage = errorMessages.lotMax;
    } else if (lots.some((lot) => (lot.startsWith('F') || lot.startsWith('f')) && lot.length > 13)) {
      error = true;
      errorMessage = errorMessages.familyLotMaxChar;
    } else if (lots.some((lot) => lot.length > 5)) {
      error = true;
      errorMessage = errorMessages.lotMaxChar;
    }

    setSearchParams((prev) => updateSearchParams(prev, 'lotNumbers', lots.length > 0 ? lots : null));
    setValidateSearch((prev) => ({
      ...prev,
      lotNumbers: {
        error,
        errorMessage
      }
    }));
    resetAlert();
  };

  const handleComboBoxesChanges = (
    searchField: keyof ActivitySearchRequest,
    data: ComboBoxEvent
  ) => {
    setSearchParams((prev) => updateSearchParams(prev, searchField, data.selectedItem));
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

    setSearchParams((prev) => updateSearchParams(
      prev,
      'germinatorTrayId',
      Number.isNaN(parsed) ? undefined : parsed
    ));
    setValidateSearch((prev) => ({
      ...prev,
      germinatorTray: {
        error,
        errorMessage
      }
    }));
    resetAlert();
  };

  const handleWithdrawalDateChange = (
    dates: (string | Date)[],
    type: 'start' | 'end'
  ) => {
    const raw = dates?.[0];
    const value = typeof raw === 'string' ? raw : raw?.toISOString().slice(0, 10);

    setSearchParams((prev) => {
      const currentStart = prev.seedWithdrawalStartDate;
      const currentEnd = prev.seedWithdrawalEndDate;

      let seedWithdrawalStartDate = currentStart;
      let seedWithdrawalEndDate = currentEnd;

      if (type === 'start') {
        seedWithdrawalStartDate = value || undefined;
        seedWithdrawalEndDate = (
          seedWithdrawalStartDate && !seedWithdrawalEndDate
        )
          ? maxEndDate
          : undefined;
      }

      if (type === 'end') {
        seedWithdrawalEndDate = value || undefined;
        seedWithdrawalStartDate = (
          seedWithdrawalEndDate && !seedWithdrawalStartDate
        )
          ? minStartDate
          : undefined;
      }

      return {
        ...prev,
        seedWithdrawalStartDate,
        seedWithdrawalEndDate
      };
    });
    resetAlert();
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

  const hasValidationErrors = (): boolean => Object.values(
    validateSearch
  ).some((field) => field.error);

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
        <Row className="consep-test-search-filters">
          <Column md={1} lg={2}>
            <TextInput
              id="lot-input"
              className="lot-input"
              labelText="Lot #"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleLotInputChange(e);
              }}
              value={rawLotInput}
              invalid={validateSearch.lotNumbers.error}
              invalidText={validateSearch.lotNumbers.errorMessage}
            />
          </Column>
          <Column md={1} lg={2}>
            <ComboBox
              id="test-type-input"
              className="test-type-input"
              titleText="Test type"
              items={testTypesCd}
              selectedItem={searchParams.testType}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('testType', e);
              }}
            />
          </Column>
          <Column md={1} lg={2}>
            <ComboBox
              id="activity-type-input"
              className="activity-type-input"
              titleText="Choose activity"
              items={activityIds}
              selectedItem={searchParams.activityId}
              onChange={(e: ComboBoxEvent) => {
                handleComboBoxesChanges('activityId', e);
              }}
            />
          </Column>
          <Column md={1} lg={2}>
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
          </Column>
          <Column md={1} lg={2}>
            <DatePicker
              datePickerType="single"
              className="withdrawal-date-input"
              dateFormat={DATE_FORMAT}
              onChange={(e: Array<Date>) => {
                handleWithdrawalDateChange(e, 'start');
              }}
              value={
                searchParams.seedWithdrawalStartDate !== minStartDate
                  ? searchParams.seedWithdrawalStartDate
                  : undefined
              }
            >
              <DatePickerInput
                id="withdrawal-start-date-input"
                labelText="Withdrawal start date"
                autoComplete="off"
              />
            </DatePicker>
          </Column>
          <Column md={1} lg={2}>
            <DatePicker
              datePickerType="single"
              className="withdrawal-date-input"
              dateFormat={DATE_FORMAT}
              onChange={(e: Array<Date>) => {
                handleWithdrawalDateChange(e, 'end');
              }}
              minDate={searchParams.seedWithdrawalStartDate ?? undefined}
              value={
                searchParams.seedWithdrawalEndDate !== maxEndDate
                  ? searchParams.seedWithdrawalEndDate
                  : undefined
              }
            >
              <DatePickerInput
                id="withdrawal-end-date-input"
                labelText="Withdrawal end date"
                autoComplete="off"
              />
            </DatePicker>
          </Column>
          <Column className="advanced-search" md={1} lg={2}>
            <Button
              ref={advSearchRef}
              size="md"
              kind="tertiary"
              onClick={toggleAdvSearch}
            >
              Filters
            </Button>
          </Column>
          <Column className="search-button" md={1} lg={2}>
            <Button
              renderIcon={Search}
              iconDescription="Search activity"
              size="md"
              onClick={() => {
                if (Object.keys(searchParams).length > 0) {
                  searchMutation.mutate({ filter: searchParams });
                } else {
                  setAlert({
                    status: 'error',
                    message: 'At least one criteria must be entered to start the search'
                  });
                }
              }}
              disabled={hasValidationErrors()}
            >
              Search activity
            </Button>
          </Column>
        </Row>
        {
          openAdvSearch && modalAnchor && (
            <AdvancedFilters
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              validateSearch={validateSearch}
              setValidateSearch={setValidateSearch}
              alignTo={modalAnchor}
              onClose={handleCloseAdvSearch}
              anchorRef={advSearchRef}
            />
          )
        }
      </FlexGrid>
      <FlexGrid>
        <Row className="consep-test-search-alert">
          {
            hasValidationErrors()
              ? (
                <Column>
                  <InlineNotification
                    lowContrast
                    kind="error"
                    title="Error fields:"
                    subtitle="Search activities is disabled until all fields are filled in
                              correctly."
                  />
                </Column>
              )
              : null
          }
        </Row>
        <Row>
          <Column>
            {alert?.message && (
              <InlineNotification
                lowContrast
                kind={alert.status}
                subtitle={alert?.message}
              />
            )}
          </Column>
        </Row>
      </FlexGrid>
      {
        hasSearched
          ? (
            <TestListTable
              data={searchResults}
              isLoading={searchMutation.isPending}
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
            />
          ) : (
            <TablePlaceholder />
          )
      }
    </div>
  );
};

export default TestSearch;
