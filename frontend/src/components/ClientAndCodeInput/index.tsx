import React, { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import {
  Row, Column, TextInput, Checkbox, Tooltip,
  InlineLoading, ActionableNotification, FlexGrid
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
import prefix from '../../styles/classPrefix';

import ClientAndCodeInputProps from './definitions';
import supportTexts, { getErrorMessageTitle } from './constants';
import { formatLocationCode } from './utils';

import './styles.scss';

const ClientAndCodeInput = ({
  checkboxId, clientInput, locationCodeInput, textConfig, defaultClientNumber,
  defaultLocCode, setClientAndCode, readOnly, showCheckbox, maxInputColSize,
  checkBoxInput, shouldSelectDefaultValue = false
}: ClientAndCodeInputProps) => {
  const getIsDefaultVal = () => (
    checkBoxInput === undefined
      ? !!clientInput.value && !!locationCodeInput.value
      && clientInput.value === defaultClientNumber && locationCodeInput.value === defaultLocCode
      : checkBoxInput.value
  );

  const clientInputRef = useRef<HTMLInputElement>(null);
  const locCodeInputRef = useRef<HTMLInputElement>(null);
  const [isDefault, setIsDefault] = useState<boolean>(
    !shouldSelectDefaultValue ? false : () => getIsDefaultVal()
  );

  const [isChecked, setIsChecked] = useState<boolean>(() => {
    if (!shouldSelectDefaultValue) {
      return false;
    }
    return checkBoxInput ? checkBoxInput.value : isDefault;
  });

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

  useEffect(() => {
    const areValsDefault = getIsDefaultVal();

    if (shouldSelectDefaultValue) {
      setIsDefault(areValsDefault);
    }

    // Do not show validation status if isDefault is true
    if (areValsDefault) {
      setShowClientValidationStatus(false);
      setShowLocCodeValidationStatus(false);
    }
  }, [clientInput, locationCodeInput, defaultClientNumber, defaultLocCode, checkBoxInput]);

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', clientInput.value],
    queryFn: () => getForestClientByNumberOrAcronym(clientInput.value),
    enabled: !!clientInput.value,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const defaultClientQuery = useQuery({
    queryKey: ['forest-clients', defaultClientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(defaultClientNumber!),
    enabled: !!defaultClientNumber,
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

    setClientAndCode(clientInput, updatedLocationCode);
    setShowLocCodeValidationStatus(true);
  };

  useEffect(() => {
    if (forestClientQuery.status === 'success') {
      if (!clientInput.value) {
        setClientAndCode(
          {
            ...clientInput,
            value: forestClientQuery.data.clientNumber
          },
          locationCodeInput
        );
      }
    }
  }, [forestClientQuery.status]);

  /**
   * Format the displayed location code
   */
  const formatDisplayedLocCode = (formattedCode: string) => {
    if (locCodeInputRef.current) {
      locCodeInputRef.current.value = formattedCode;
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
      updateAfterLocValidation(true, locationCodeInput.value);
    },
    onSuccess: (data) => {
      setShowErrorBanner(false);
      updateAfterLocValidation(false, data.locationCode);
    }
  });

  /**
   * Format the displayed acronym
   */
  const formatDisplayedAcronym = (formattedAcronym: string) => {
    if (clientInputRef.current) {
      clientInputRef.current.value = formattedAcronym;
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
      setShowErrorBanner(false);
      setClientAndCode({
        ...clientInput,
        value: data.clientNumber,
        isInvalid: false
      }, locationCodeInput);

      if (locationCodeInput.value !== '') {
        validateLocationCodeMutation.mutate({
          clientNumber: data.clientNumber,
          locationCode: locationCodeInput.value
        });
      }
    }
  });

  const handleDefaultCheckBox = (checked: boolean) => {
    const updatedAgency: StringInputType = {
      ...clientInput,
      value: checked ? defaultClientNumber ?? '' : '',
      isInvalid: false
    };

    const updatedLocationCode = {
      ...locationCodeInput,
      value: checked ? defaultLocCode ?? '' : '',
      isInvalid: false
    };

    if (!checked) {
      formatDisplayedAcronym('');
      formatDisplayedLocCode('');
    } else {
      formatDisplayedAcronym(defaultClientQuery.data?.acronym ?? '');
      formatDisplayedLocCode(updatedLocationCode.value);
    }

    setShowClientValidationStatus(false);
    setShowLocCodeValidationStatus(false);

    setClientAndCode(
      updatedAgency,
      updatedLocationCode,
      checkBoxInput !== undefined
        ? {
          ...checkBoxInput,
          value: checked
        }
        : undefined
    );

    if (!checkBoxInput) {
      setIsDefault(checked);
      setIsChecked(checked);
    }
  };

  const [openAgnTooltip, setOpenAgnTooltip] = useState<boolean>(false);
  const [openLocTooltip, setOpenLocTooltip] = useState<boolean>(false);

  const renderLoading = (
    isLoading: boolean,
    isSuccess: boolean,
    showLoadingStatus: boolean,
    idPrefix: string,
    crtlTooltip: boolean,
    setCtrlTooltip: Function
  ) => {
    if (
      (isLoading || isSuccess)
      && showLoadingStatus
    ) {
      const tooltipLabel = isSuccess ? 'Verified!' : 'Loading';
      const loadingStatus = isSuccess ? 'finished' : 'active';
      return (
        <Tooltip
          className={crtlTooltip ? `${prefix}--popover--open input-loading-tooltip` : 'input-loading-tooltip'}
          label={tooltipLabel}
          id={`${idPrefix}-loading-status-tooltip`}
          // These mouse handlers are necessary because
          // removing tabIndex=-1 would not trigger
          // the tooltip (for some "carbon" reason)
          onMouseOver={() => {
            setCtrlTooltip(true);
          }}
          onMouseOut={() => {
            setCtrlTooltip(false);
          }}
        >
          <button
            tabIndex={-1}
            type="button"
            className="tooltip-trigger"
            aria-label="loading-status-display"
          >
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
    if (!value && locationCodeInput.value) {
      setShowClientValidationStatus(false);
      setShowLocCodeValidationStatus(false);
      const updatedLocationCode = {
        ...locationCodeInput,
        isInvalid: true
      };
      setInvalidLocationMessage(supportTexts.locationCode.invalidEmptyAgency);
      setClientAndCode(clientInput, updatedLocationCode);
      return;
    }

    if (!value) {
      setShowClientValidationStatus(false);
      return;
    }

    setShowClientValidationStatus(true);
    formatDisplayedAcronym(clientInputRef.current?.value.toUpperCase() ?? '');
    validateClientAcronymMutation.mutate(value.toUpperCase());
  };

  const handleLocationCodeBlur = (value: string) => {
    const formattedCode = value ? formatLocationCode(value) : '';
    formatDisplayedLocCode(formattedCode);

    const updatedLocationCode = {
      ...locationCodeInput,
      value: formattedCode,
      isInvalid: false
    };

    const isInRange = validator.isInt(formattedCode, { min: 0, max: 99 });

    if (!formattedCode && !isInRange) {
      setShowLocCodeValidationStatus(false);
      setInvalidLocationMessage(supportTexts.locationCode.invalidText);
      updatedLocationCode.isInvalid = true;
      setClientAndCode(clientInput, updatedLocationCode);
      return;
    }

    setShowLocCodeValidationStatus(true);

    if (clientInput.value) {
      setClientAndCode(clientInput, updatedLocationCode);
      validateLocationCodeMutation.mutate({
        clientNumber: clientInput.value,
        locationCode: formattedCode
      });
    }
  };


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
                  checked={isChecked}
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
              className={readOnly ? 'spar-display-only-input' : 'agency-input'}
              ref={clientInputRef}
              id={clientInput.id}
              autoCapitalize="on"
              labelText={textConfig.agencyInput.titleText}
              defaultValue={shouldSelectDefaultValue ? forestClientQuery.data?.acronym : ''}
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
                showClientValidationStatus,
                clientInput.id,
                openAgnTooltip,
                setOpenAgnTooltip
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
              defaultValue={shouldSelectDefaultValue ? locationCodeInput.value : ''}
              type="number"
              maxCount={LOCATION_CODE_LIMIT}
              enableCounter
              placeholder={!clientInput.value ? '' : supportTexts.locationCode.placeholder}
              labelText={textConfig.locationCode.labelText}
              helperText={
                (readOnly || (showCheckbox && isDefault))
                  ? null
                  : supportTexts.locationCode.helperTextEnabled
              }
              invalid={locationCodeInput.isInvalid && !validateLocationCodeMutation.isLoading}
              invalidText={((showCheckbox && isDefault) && locationCodeInput.value === '')
                ? supportTexts.locationCode.invalidTextInterimSpecific
                : invalidLocationMessage}
              readOnly={
                (showCheckbox && isDefault)
                || readOnly || clientInput.isInvalid || validateLocationCodeMutation.isLoading
              }
              disabled={(isDefault && locationCodeInput.value === '')}
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
                showLocCodeValidationStatus,
                locationCodeInput.id,
                openLocTooltip,
                setOpenLocTooltip
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
                        value: client.clientNumber,
                        isInvalid: false
                      };

                      const selectedLocationCode = {
                        ...locationCodeInput,
                        value: client.locationCode,
                        isInvalid: false
                      };

                      formatDisplayedAcronym(client.acronym);
                      formatDisplayedLocCode(client.locationCode);

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
