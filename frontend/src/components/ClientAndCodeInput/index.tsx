import React, { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import {
  Row, Column, TextInput, Checkbox, Tooltip,
  InlineLoading, ActionableNotification, FlexGrid, TextInputSkeleton
} from '@carbon/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import validator from 'validator';

import ClientSearchModal from './ClientSearchModal';

import { getForestClientByNumberOrAcronym, getForestClientLocation } from '../../api-service/forestClientsAPI';
import { ForestClientSearchType } from '../../types/ForestClientTypes/ForestClientSearchType';
import { ClientNumLocCodeType } from '../../types/ForestClientTypes/ForestClientType';
import { LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';
import { StringInputType } from '../../types/FormInputType';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';

import ClientAndCodeInputProps from './definitions';
import supportTexts, { getErrorMessageTitle } from './constants';
import { formatLocationCode } from './utils';

import './styles.scss';

const ClientAndCodeInput = ({
  checkboxId, clientInput, locationCodeInput, textConfig, defaultClientNumber,
  defaultLocCode, setClientAndCode, readOnly, showCheckbox, maxInputColSize
}: ClientAndCodeInputProps) => {
  const clientInputRef = useRef<HTMLInputElement>(null);
  const locCodeInputRef = useRef<HTMLInputElement>(null);
  const [isDefault, setIsDefault] = useState<boolean>(
    () => clientInput.value === defaultClientNumber && locationCodeInput.value === defaultLocCode
  );

  const [showClientValidationStatus, setShowClientValidationStatus] = useState<boolean>(true);

  const [showLocCodeValidationStatus, setShowLocCodeValidationStatus] = useState<boolean>(false);

  const [showErrorBanner, setShowErrorBanner] = useState<boolean>(false);

  const [invalidAcronymMessage, setInvalidAcronymMessage] = useState<string>(
    supportTexts.agency.invalidAcronym
  );

  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>(
    locationCodeInput.isInvalid && clientInput.value
      ? supportTexts.locationCode.invalidLocationForSelectedAgency
      : supportTexts.locationCode.invalidText
  );

  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    supportTexts.locationCode.helperTextDisabled
  );

  useEffect(() => {
    setIsDefault(
      clientInput.value === defaultClientNumber && locationCodeInput.value === defaultLocCode
    );
  }, [clientInput, locationCodeInput, defaultClientNumber, defaultLocCode]);

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', clientInput.value],
    queryFn: () => getForestClientByNumberOrAcronym(clientInput.value),
    enabled: !!clientInput.value,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const updateAfterAgencyValidation = (updatedAgency: StringInputType) => {
    setClientAndCode(updatedAgency, locationCodeInput);
  };

  const updateAfterLocValidation = (isInvalid: boolean, locCode?: string) => {
    const updatedLocationCode = {
      ...locationCodeInput,
      value: locCode ?? '',
      isInvalid
    };

    const updatedClientInput = {
      ...clientInput,
      isInvalid: false,
      value: forestClientQuery.data?.clientNumber ?? ''
    };

    setLocationCodeHelperText(supportTexts.locationCode.helperTextEnabled);
    setClientAndCode(updatedClientInput, updatedLocationCode);

    setShowLocCodeValidationStatus(true);
  };

  useEffect(() => {
    if (forestClientQuery.status === 'success') {
      setClientAndCode(
        {
          ...clientInput,
          value: forestClientQuery.data.clientNumber
        },
        locationCodeInput
      );
    }
  }, [forestClientQuery.status]);

  /**
   * Format the displayed location code
   */
  const formatDisplayedLocCode = (formatedCode: string) => {
    if (locCodeInputRef.current) {
      locCodeInputRef.current.value = formatedCode;
    }
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (
      numAndCode: ClientNumLocCodeType
    ) => getForestClientLocation(
      numAndCode.clientNumber,
      numAndCode.locationCode
    ),
    onError: (err: AxiosError) => {
      // Request failed
      if (err.response?.status !== 404) {
        setShowErrorBanner(true);
        setInvalidLocationMessage(supportTexts.locationCode.requestErrorHelper);
      } else {
        setInvalidLocationMessage(supportTexts.locationCode.invalidLocationForSelectedAgency);
      }
      updateAfterLocValidation(true);
    },
    onSuccess: (data) => {
      setShowErrorBanner(false);
      updateAfterLocValidation(false, data.locationCode);
    }
  });

  /**
   * Format the displayed acronym
   */
  const formatDisplayedAcronym = () => {
    if (clientInputRef.current) {
      clientInputRef.current.value = clientInputRef.current.value.toUpperCase();
    }
  };

  const validateClientAcronymMutation = useMutation({
    mutationFn: (clientAcronym: string) => getForestClientByNumberOrAcronym(
      clientAcronym
    ),
    onError: (err: AxiosError) => {
      if (err.response?.status !== 404) {
        setShowErrorBanner(true);
        setInvalidAcronymMessage(supportTexts.agency.requestErrorHelper);
      } else {
        setInvalidAcronymMessage(supportTexts.agency.invalidAcronym);
      }
      setShowLocCodeValidationStatus(false);
      updateAfterAgencyValidation({
        ...clientInput,
        isInvalid: true
      });
    },
    onSuccess: (data) => {
      if (locationCodeInput.value !== '') {
        validateLocationCodeMutation.mutate({
          clientNumber: data.clientNumber,
          locationCode: locationCodeInput.value
        });
      } else {
        setClientAndCode({
          ...clientInput,
          value: data.clientNumber,
          isInvalid: false
        }, locationCodeInput);
      }
    }
  });

  const handleDefaultCheckBox = (checked: boolean) => {
    setLocationCodeHelperText(
      checked
        ? supportTexts.locationCode.helperTextEnabled
        : supportTexts.locationCode.helperTextDisabled
    );

    const updatedAgency: StringInputType = {
      ...clientInput,
      value: checked ? defaultClientNumber ?? '' : '',
      isInvalid: checked && !!defaultClientNumber
    };

    const updatedLocationCode = {
      ...locationCodeInput,
      value: checked ? defaultLocCode ?? '' : '',
      isInvalid: checked && !!defaultLocCode
    };

    setShowClientValidationStatus(checked);
    setShowLocCodeValidationStatus(checked);
    setClientAndCode(updatedAgency, updatedLocationCode);
  };

  const renderLoading = (
    isLoading: boolean,
    isSuccess: boolean,
    showLoadingStatus: boolean
  ) => {
    if (
      (isLoading || isSuccess)
      && showLoadingStatus
    ) {
      const tooltipLabel = isSuccess ? 'Verified!' : 'Loading';
      const loadingStatus = isSuccess ? 'finished' : 'active';
      return (
        <Tooltip
          className="input-loading-tooltip"
          label={tooltipLabel}
        >
          <button className="tooltip-trigger" type="button" aria-label="loading-status-display">
            <InlineLoading
              status={loadingStatus}
            />
          </button>
        </Tooltip>
      );
    }
    return null;
  };

  const handleAgencyBlur = (value: string) => {
    if (!value) {
      setShowClientValidationStatus(false);
      return;
    }

    setShowClientValidationStatus(true);
    formatDisplayedAcronym();
    validateClientAcronymMutation.mutate(value.toUpperCase());
  };

  const handleLocationCodeBlur = (value: string) => {
    const formatedCode = value ? formatLocationCode(value) : '';
    formatDisplayedLocCode(formatedCode);

    const updatedLocationCode = {
      ...locationCodeInput,
      value: formatedCode,
      isInvalid: false
    };

    const isInRange = validator.isInt(formatedCode, { min: 0, max: 99 });

    if (!formatedCode && !isInRange) {
      setShowLocCodeValidationStatus(false);
      setInvalidLocationMessage(supportTexts.locationCode.invalidText);
      updatedLocationCode.isInvalid = true;
      setClientAndCode(clientInput, updatedLocationCode);
      return;
    }

    setShowLocCodeValidationStatus(true);

    if (clientInput.value) {
      validateLocationCodeMutation.mutate({
        clientNumber: clientInput.value,
        locationCode: formatedCode
      });
    }
  };

  if (forestClientQuery.status === 'loading') {
    return (
      <FlexGrid className="agency-information-section">
        <Row className="agency-information-row">
          <Column sm={4} md={4} lg={8} xlg={maxInputColSize ?? 8}>
            <TextInputSkeleton />
          </Column>
          <Column sm={4} md={4} lg={8} xlg={maxInputColSize ?? 8}>
            <TextInputSkeleton />
          </Column>
        </Row>
      </FlexGrid>
    );
  }

  return (
    <FlexGrid className="agency-information-section">
      {
        showCheckbox
          ? (
            <Row className="agency-information-row">
              <Column sm={4} md={8} lg={16} xlg={16}>
                <Checkbox
                  id={checkboxId}
                  name={textConfig.useDefaultCheckbox.name}
                  labelText={textConfig.useDefaultCheckbox.labelText}
                  readOnly={readOnly}
                  checked={isDefault}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleDefaultCheckBox(e.target.checked);
                  }}
                />
              </Column>
            </Row>
          )
          : null
      }
      <Row className="agency-information-row">
        {/* CLIENT ACRONYM */}
        <Column sm={4} md={4} lg={8} xlg={maxInputColSize ?? 8}>
          <div className="loading-input-wrapper">
            <TextInput
              className="agency-input"
              ref={clientInputRef}
              id={clientInput.id}
              autoCapitalize="on"
              labelText={textConfig.agencyInput.titleText}
              defaultValue={forestClientQuery.data?.acronym}
              helperText={
                (readOnly || (showCheckbox && isDefault))
                  ? null
                  : supportTexts.agency.helperText
              }
              invalid={clientInput.isInvalid && !validateClientAcronymMutation.isLoading}
              invalidText={invalidAcronymMessage}
              readOnly={
                (showCheckbox && isDefault)
                || validateClientAcronymMutation.isLoading
                || readOnly
              }
              enableCounter
              maxCount={8}
              onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!e.target.readOnly) {
                  handleAgencyBlur(e.target.value);
                }
              }}
              size="md"
            />
            {
              renderLoading(
                validateClientAcronymMutation.isLoading,
                validateClientAcronymMutation.isSuccess,
                showClientValidationStatus
              )
            }
          </div>
        </Column>
        {/* LOCATION CODE */}
        <Column sm={4} md={4} lg={8} xlg={maxInputColSize ?? 8}>
          <div className="loading-input-wrapper">
            <TextInput
              className={readOnly ? 'spar-display-only-input' : 'location-code-input'}
              id={locationCodeInput.id}
              ref={locCodeInputRef}
              name={textConfig.locationCode.name}
              defaultValue={locationCodeInput.value}
              type="number"
              maxCount={LOCATION_CODE_LIMIT}
              placeholder={!clientInput.value ? '' : supportTexts.locationCode.placeholder}
              labelText={textConfig.locationCode.labelText}
              helperText={(readOnly || (showCheckbox && isDefault)) ? null : locationCodeHelperText}
              invalid={locationCodeInput.isInvalid && !validateLocationCodeMutation.isLoading}
              invalidText={((showCheckbox && isDefault) && locationCodeInput.value === '')
                ? supportTexts.locationCode.invalidTextInterimSpecific
                : invalidLocationMessage}
              readOnly={
                (showCheckbox && isDefault)
                || readOnly || clientInput.isInvalid || validateLocationCodeMutation.isLoading
              }
              disabled={!clientInput.value || (isDefault && locationCodeInput.value === '')}
              onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!e.target.readOnly) {
                  handleLocationCodeBlur(e.target.value);
                }
              }}
            />
            {
              renderLoading(
                validateLocationCodeMutation.isLoading,
                validateLocationCodeMutation.isSuccess,
                showLocCodeValidationStatus
              )
            }
          </div>
        </Column>
      </Row>
      {
        showErrorBanner
          ? (
            <Row className="applicant-error-row">
              <Column sm={4} md={4} lg={12} xlg={12}>
                <ActionableNotification
                  className="applicant-error-notification"
                  lowContrast
                  inline
                  kind="error"
                  title={getErrorMessageTitle(validateClientAcronymMutation.isError ? 'Agency acronym' : 'Location code')}
                  subtitle="Please retry verification"
                  actionButtonLabel="Retry"
                  onActionButtonClick={() => {
                    if (validateClientAcronymMutation.isError) {
                      handleAgencyBlur(clientInput.value);
                    } else {
                      handleLocationCodeBlur(locationCodeInput.value);
                    }
                  }}
                  onCloseButtonClick={() => { setShowErrorBanner(false); }}
                />
              </Column>
            </Row>
          )
          : null
      }
      {
        !(showCheckbox && isDefault) && !readOnly
          ? (
            <Row className="applicant-client-search-row">
              <Column sm={4} md={4} lg={16} xlg={16}>
                <p>
                  If you don&apos;t remember the clientInput information you can
                  {' '}
                  <ClientSearchModal
                    linkText="open the client search"
                    modalLabel="Register A-Class Seedlot"
                    applySelectedClient={(client: ForestClientSearchType) => {
                      const selectedClient: StringInputType = {
                        ...clientInput,
                        value: client.acronym,
                        isInvalid: false
                      };

                      const selectedLocationCode = {
                        ...locationCodeInput,
                        value: client.locationCode,
                        isInvalid: false
                      };

                      setLocationCodeHelperText(supportTexts.locationCode.helperTextEnabled);
                      setClientAndCode(selectedClient, selectedLocationCode);
                    }}
                  />
                </p>
              </Column>
            </Row>
          )
          : null
      }
    </FlexGrid>
  );
};

export default ClientAndCodeInput;
