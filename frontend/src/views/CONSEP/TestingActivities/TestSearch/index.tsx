import React, { ChangeEvent, useState } from 'react';
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
import {
  DATE_FORMAT, testActivityCodes, testCategoryCodes, testSearchCrumbs
} from './constants';
import { ActivitySearchRequest } from './definitions';
import TestListTable from './TestListTable';
import TablePlaceholder from './TablePlaceholder';

import './styles.scss';

const TestSearch = () => {
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<ActivitySearchRequest>({});
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

  const updateSearchParams = <T extends object, K extends keyof T>(
    prev: T,
    key: K,
    value: T[K] | null
  ): T => {
    const updated = { ...prev };

    if (value != null) {
      updated[key] = value;
    } else {
      delete updated[key];
    }

    return updated;
  };

  const handleLotInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lots = e.target.value
      .split(',')
      .map((val) => val.trim())
      .filter((val) => val.length > 0);

    setSearchParams((prev) => updateSearchParams(prev, 'lotNumbers', lots.length > 0 ? lots : null));
    resetAlert();
  };

  const handleTestTypeChange = (data: ComboBoxEvent) => {
    setSearchParams((prev) => updateSearchParams(prev, 'testCategoryCd', data.selectedItem));
    resetAlert();
  };

  const handleActivityIdChange = (data: ComboBoxEvent) => {
    setSearchParams((prev) => updateSearchParams(prev, 'activityId', data.selectedItem));
    resetAlert();
  };

  const handleGermTrayIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const parsed = value === '' ? undefined : parseInt(value, 10);

    setSearchParams((prev) => updateSearchParams(prev, 'germinatorTrayId', Number.isNaN(parsed) ? undefined : parsed));
    resetAlert();
  };

  const handleWithdrawalStartDateChange = (dates: (string | Date)[]) => {
    const raw = dates?.[0];
    const value = typeof raw === 'string' ? raw : raw?.toISOString().slice(0, 10);

    setSearchParams((prev) => updateSearchParams(prev, 'seedWithdrawalStartDate', value));
    resetAlert();
  };

  const handleWithdrawalEndDateChange = (dates: (string | Date)[]) => {
    const raw = dates?.[0];
    const value = typeof raw === 'string' ? raw : raw?.toISOString().slice(0, 10);

    setSearchParams((prev) => updateSearchParams(prev, 'seedWithdrawalEndDate', value));
    resetAlert();
  };

  return (
    <div className="consep-test-search-content">
      <FlexGrid>
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
            />
          </Column>
          <Column md={1} lg={2}>
            <ComboBox
              id="test-type-input"
              className="test-type-input"
              titleText="Test type"
              items={testCategoryCodes}
              placeholder="Choose test type"
              onChange={(e: ComboBoxEvent) => {
                handleTestTypeChange(e);
              }}
            />
          </Column>
          <Column md={1} lg={2}>
            <ComboBox
              id="activity-type-input"
              className="activity-type-input"
              titleText="Choose activity"
              items={testActivityCodes}
              placeholder="Choose activity"
              onChange={(e: ComboBoxEvent) => {
                handleActivityIdChange(e);
              }}
            />
          </Column>
          <Column md={1} lg={2}>
            <TextInput
              id="germ-tray-input"
              className="germ-tray-input"
              placeholder="Enter germ tray ID"
              labelText="Germ tray ID"
              type="number"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleGermTrayIdChange(e);
              }}
            />
          </Column>
          <Column md={1} lg={2}>
            <DatePicker
              datePickerType="single"
              className="withdrawal-date-input"
              dateFormat={DATE_FORMAT}
              onChange={(e: Array<Date>) => {
                handleWithdrawalStartDateChange(e);
              }}
            >
              <DatePickerInput
                id="withdrawal-start-date-input"
                placeholder="Withdrawal date"
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
                handleWithdrawalEndDateChange(e);
              }}
            >
              <DatePickerInput
                id="withdrawal-end-date-input"
                placeholder="Withdrawal date"
                labelText="Withdrawal end date"
                autoComplete="off"
              />
            </DatePicker>
          </Column>
          <Column className="advanced-search-input" md={1} lg={2}>
            <ComboBox
              id="advanced-search-input"
              items={[]}
              placeholder="Advanced search"
              onChange={() => {}}
            />
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
            >
              Search activity
            </Button>
          </Column>
        </Row>
        <Row>
          <Column>
            {alert?.message && (
              <InlineNotification
                style={{ maxInlineSize: 'none' }}
                lowContrast
                kind={alert.status}
                subtitle={alert?.message}
              />
            )}
          </Column>
        </Row>
      </FlexGrid>
      {hasSearched ? (
        <TestListTable
          data={searchResults}
          isLoading={searchMutation.isPending}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
        />
      ) : (
        <TablePlaceholder />
      )}
    </div>
  );
};

export default TestSearch;
