import React, { ChangeEvent, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import {
  FlexGrid,
  Row,
  Column,
  DatePicker,
  DatePickerInput,
  ComboBox,
  Button,
  TextInput,
  InlineLoading
} from '@carbon/react';
import {
  Search
} from '@carbon/icons-react';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import AdvancedFilters from './AdvancedFilter';
import { searchActivities } from '../../../../api-service/consep/searchTestingActivitiesAPI';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import { TestingSearchResponseType } from '../../../../types/consep/TestingSearchResponseType';

import {
  DATE_FORMAT, emptyActivitySearchRequest, activityIds,
  testSearchCrumbs, testTypesCd, iniActSearchValidation,
  errorMessages,
  minStartDate,
  maxEndDate
} from './constants';
import { ActivitySearchRequest, ActivitySearchValidation } from './definitions';
import './styles.scss';

const TestSearch = () => {
  const [searchParams, setSearchParams] = useState<ActivitySearchRequest>(
    emptyActivitySearchRequest
  );
  const [rawLotInput, setRawLotInput] = useState('');
  const [validateSearch, setValidateSearch] = useState<ActivitySearchValidation>(
    iniActSearchValidation
  );
  const [openAdvSearch, setOpenAdvSearch] = useState(false);
  const [alert, setAlert] = useState<{ isSuccess: boolean; message: string } | null>(null);
  const [modalAnchor, setModalAnchor] = useState<{
    top: number;
    left: number;
    width: number
  } | null>(null);

  const advSearchRef = useRef<HTMLButtonElement>(null);

  const searchMutation = useMutation({
    mutationFn: (params: ActivitySearchRequest) => searchActivities(params),
    onSuccess: (data: TestingSearchResponseType[]) => {
      console.log('Search results:', data);
      setAlert({ isSuccess: true, message: `Total results: ${data.length}, you can check the results at the console :)` });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    },
    onError: (error) => {
      setAlert({ isSuccess: false, message: `Search failed with the error: ${error.message}` });
    }
  });

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
    } else if (lots.some((lot) => lot.length > 5)) {
      error = true;
      errorMessage = errorMessages.lotMaxChar;
    }

    setSearchParams((prev) => ({
      ...prev,
      lotNumbers: lots
    }));
    setValidateSearch((prev) => ({
      ...prev,
      lotNumbers: {
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

  const handleGermTrayIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const parsed = value === '' ? undefined : parseInt(value, 10);

    let error = false;
    let errorMessage = '';

    if (parsed && parsed >= 100000) {
      error = true;
      errorMessage = errorMessages.germTrayMax;
    }

    setSearchParams((prev) => ({
      ...prev,
      germinatorTrayId: parsed
    }));
    setValidateSearch((prev) => ({
      ...prev,
      germinatorTray: {
        error,
        errorMessage
      }
    }));
  };

  const handleWithdrawalDateChange = (
    dates: (string | Date)[],
    type: 'start' | 'end'
  ) => {
    const raw = dates?.[0];
    const value = typeof raw === 'string' ? raw : raw?.toISOString().slice(0, 10);

    setSearchParams((prev) => {
      // eslint-disable-next-line no-debugger
      debugger;
      const currentStart = prev.seedWithdrawalStartDate;
      const currentEnd = prev.seedWithdrawalEndDate;

      const seedWithdrawalStartDate = type === 'start'
        ? value ?? minStartDate
        : currentStart ?? minStartDate;

      const seedWithdrawalEndDate = type === 'end'
        ? value ?? maxEndDate
        : currentEnd ?? maxEndDate;

      return {
        ...prev,
        seedWithdrawalStartDate,
        seedWithdrawalEndDate
      };
    });
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

  return (
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
            placeholder="Choose test type"
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
            placeholder="Choose activity"
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
            placeholder="Enter germ tray ID"
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
              placeholder="Withdrawal date"
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
              console.log(searchParams);
              if (searchParams) {
                searchMutation.mutate(searchParams);
              } else {
                setAlert({
                  isSuccess: false,
                  message: 'No parameters set for the search :('
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
          {searchMutation.isPending && <InlineLoading description="Searching..." />}
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
  );
};

export default TestSearch;
