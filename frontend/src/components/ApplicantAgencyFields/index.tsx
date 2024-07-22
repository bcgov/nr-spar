import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  Row, Column, TextInput, Checkbox, Tooltip,
  InlineLoading, ActionableNotification, FlexGrid
} from '@carbon/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import validator from 'validator';

import ClientSearchModal from './ClientSearchModal';

import { getForestClientByNumberOrAcronym, getForestClientLocation } from '../../api-service/forestClientsAPI';

import MultiOptionsObj from '../../types/MultiOptionsObject';
import { ForestClientSearchType } from '../../types/ForestClientTypes/ForestClientSearchType';
import { ClientNumLocCodeType, ForestClientType } from '../../types/ForestClientTypes/ForestClientType';
import { EmptyMultiOptObj, LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';
import { getForestClientLabel } from '../../utils/ForestClientUtils';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';

import ApplicantAgencyFieldsProps from './definitions';
import supportTexts, { getErrorMessageTitle } from './constants';
import { formatLocationCode } from './utils';

import './styles.scss';
import { StringInputType } from '../../types/FormInputType';

const ApplicantAgencyFields = ({
  checkboxId, isDefault, clientNumberInput, locationCode, fieldsProps, defaultAgency,
  defaultCode, setAgencyAndCode, readOnly, showCheckbox, maxInputColSize
}: ApplicantAgencyFieldsProps) => {
  const [showSuccessIconAgency, setShowSuccessIconAgency] = useState<boolean>(true);

  const [showSuccessIconLocCode, setShowSuccessIconLocCode] = useState<boolean>(false);

  const [showErrorBanner, setShowErrorBanner] = useState<boolean>(false);

  const [invalidAcronymMessage, setInvalidAcronymMessage] = useState<string>(
    supportTexts.agency.invalidAcronym
  );

  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>(
    locationCode.isInvalid && clientNumberInput.value
      ? supportTexts.locationCode.invalidLocationForSelectedAgency
      : supportTexts.locationCode.invalidText
  );

  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    supportTexts.locationCode.helperTextDisabled
  );

  const updateAfterAgencyValidation = (isInvalid: boolean, clientData?: ForestClientType) => {
    let updatedAgency: StringInputType;
    if (clientData) {
      updatedAgency = {
        ...clientNumberInput,
        value: clientData.acronym,
        isInvalid
      };
    } else {
      updatedAgency = {
        ...clientNumberInput,
        isInvalid
      };
    }
    setLocationCodeHelperText(
      clientData
        ? supportTexts.locationCode.helperTextEnabled
        : supportTexts.locationCode.helperTextDisabled
    );
    setAgencyAndCode(isDefault, updatedAgency, locationCode);
  };

  const updateAfterLocValidation = (isInvalid: boolean) => {
    const updatedLocationCode = {
      ...locationCode,
      isInvalid
    };
    setLocationCodeHelperText(supportTexts.locationCode.helperTextEnabled);
    setAgencyAndCode(isDefault, clientNumberInput, updatedLocationCode);
  };

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', clientNumberInput.value],
    queryFn: () => getForestClientByNumberOrAcronym(clientNumberInput.value),
    enabled: !!clientNumberInput.value,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  useEffect(() => {
    if (forestClientQuery.status === 'success') {
      console.log('aaaaa settting', {
        code: forestClientQuery.data.clientNumber,
        description: `${forestClientQuery.data?.clientNumber} - ${forestClientQuery.data?.clientName} - ${forestClientQuery.data?.acronym}`,
        label: forestClientQuery.data.acronym
      });
      setAgencyAndCode(
        isDefault,
        {
          ...clientNumberInput,
          value: forestClientQuery.data.acronym
        },
        locationCode
      );
    }
  }, [forestClientQuery.status]);

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
    onSuccess: () => {
      setShowErrorBanner(false);
      updateAfterLocValidation(false);
    }
  });

  const validateAgencyAcronymMutation = useMutation({
    mutationFn: (queryParams: string[]) => getForestClientByNumberOrAcronym(
      queryParams[0]
    ),
    onError: (err: AxiosError) => {
      // Request failed
      if (err.response?.status !== 404) {
        setShowErrorBanner(true);
        setInvalidAcronymMessage(supportTexts.agency.requestErrorHelper);
      } else {
        setInvalidAcronymMessage(supportTexts.agency.invalidAcronym);
      }
      updateAfterAgencyValidation(true);
    },
    onSuccess: (res) => {
      setShowErrorBanner(false);
      updateAfterAgencyValidation(false, res);
      if (locationCode.value !== '') {
        validateLocationCodeMutation.mutate({
          clientNumber: res.clientNumber,
          locationCode: locationCode.value
        });
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
      ...clientNumberInput,
      value: checked ? defaultAgency?.code ?? '' : '',
      isInvalid: checked && defaultAgency?.label === ''
    };

    const updatedLocationCode = {
      ...locationCode,
      value: checked ? defaultCode ?? '' : '',
      isInvalid: checked && defaultCode === ''
    };

    const updatedIsDefault = {
      ...isDefault,
      value: checked
    };

    setShowSuccessIconAgency(checked);
    setShowSuccessIconLocCode(checked);
    setAgencyAndCode(updatedIsDefault, updatedAgency, updatedLocationCode);
  };

  const updateAgencyFn = (value: string | null) => (
    {
      ...clientNumberInput,
      isInvalid: false,
      value: value ?? ''
    }
  );

  const renderLoading = (
    isLoading: boolean,
    isSuccess: boolean,
    showSuccessControl: boolean
  ) => {
    if (
      (isLoading || isSuccess)
      && showSuccessControl
      && !isDefault.value
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

  // const handleAgencyInput = (value: string) => {
  //   // Create a "mock" MultiOptObj, just to display
  //   // the correct acronym
  //   const updatedAgency = updateAgencyFn(value);

  //   setAgencyAndCode(isDefault, updatedAgency, locationCode);
  // };

  const handleAgencyBlur = (value: string) => {
    const updatedAgency = updateAgencyFn(value);
    setAgencyAndCode(isDefault, updatedAgency, locationCode);

    if (value === '') {
      setShowSuccessIconAgency(false);
      return;
    }

    setShowSuccessIconAgency(true);
    validateAgencyAcronymMutation.mutate([value]);
  };

  const handleLocationCodeChange = (value: string) => {
    const updatedValue = value.slice(0, LOCATION_CODE_LIMIT);
    const isInRange = validator.isInt(value, { min: 0, max: 99 });
    let updatedIsInvalid = false;

    if (value === '') {
      setShowSuccessIconLocCode(false);
    }

    if (!isInRange) {
      setInvalidLocationMessage(supportTexts.locationCode.invalidText);
      updatedIsInvalid = true;
    }

    const updatedLocationCode = {
      ...locationCode,
      value: updatedValue,
      isInvalid: updatedIsInvalid
    };

    setAgencyAndCode(isDefault, clientNumberInput, updatedLocationCode);
  };

  const handleLocationCodeBlur = (value: string) => {
    const formatedCode = value.length ? formatLocationCode(value) : '';
    const updatedLocationCode = {
      ...locationCode,
      value: formatedCode,
      isInvalid: false
    };
    setAgencyAndCode(isDefault, clientNumberInput, updatedLocationCode);
    if (formatedCode === '') {
      setShowSuccessIconLocCode(false);
      return;
    }
    setShowSuccessIconLocCode(true);

    if (forestClientQuery.data?.clientNumber) {
      validateLocationCodeMutation.mutate({
        clientNumber: forestClientQuery.data.clientNumber,
        locationCode: formatedCode
      });
    }
  };

  return (
    <FlexGrid className="clientNumberInput-information-section">
      {
        showCheckbox
          ? (
            <Row className="clientNumberInput-information-row">
              <Column sm={4} md={8} lg={16} xlg={16}>
                <Checkbox
                  id={checkboxId}
                  name={fieldsProps.useDefaultCheckbox.name}
                  labelText={fieldsProps.useDefaultCheckbox.labelText}
                  readOnly={readOnly}
                  checked={isDefault.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleDefaultCheckBox(e.target.checked);
                  }}
                />
              </Column>
            </Row>
          )
          : null
      }
      <Row className="clientNumberInput-information-row">
        <Column sm={4} md={4} lg={8} xlg={maxInputColSize ?? 8}>
          <div className="loading-input-wrapper">
            <TextInput
              className="clientNumberInput-input"
              id={clientNumberInput.id}
              labelText={fieldsProps.agencyInput.titleText}
              defaultValue={forestClientQuery.data?.acronym}
              helperText={
                (readOnly || isDefault.value)
                  ? null
                  : supportTexts.agency.helperText
              }
              invalid={clientNumberInput.isInvalid}
              invalidText={invalidAcronymMessage}
              readOnly={isDefault.value || readOnly}
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
                validateAgencyAcronymMutation.isLoading,
                validateAgencyAcronymMutation.isSuccess,
                showSuccessIconAgency
              )
            }
          </div>
        </Column>
        <Column sm={4} md={4} lg={8} xlg={maxInputColSize ?? 8}>
          <div className="loading-input-wrapper">
            <TextInput
              className={readOnly ? 'spar-display-only-input' : 'location-code-input'}
              id={locationCode.id}
              name={fieldsProps.locationCode.name}
              value={locationCode.value}
              type="number"
              placeholder={!clientNumberInput.value ? '' : supportTexts.locationCode.placeholder}
              labelText={fieldsProps.locationCode.labelText}
              helperText={(readOnly || isDefault.value) ? null : locationCodeHelperText}
              invalid={locationCode.isInvalid}
              invalidText={(isDefault.value && locationCode.value === '')
                ? supportTexts.locationCode.invalidTextInterimSpecific
                : invalidLocationMessage}
              readOnly={(isDefault.value && locationCode.value !== '') || readOnly}
              disabled={!clientNumberInput.value || (isDefault.value && locationCode.value === '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleLocationCodeChange(e.target.value);
              }}
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
                showSuccessIconLocCode
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
                  title={getErrorMessageTitle(validateAgencyAcronymMutation.isError ? 'Agency acronym' : 'Location code')}
                  subtitle="Please retry verification"
                  actionButtonLabel="Retry"
                  onActionButtonClick={() => {
                    if (validateAgencyAcronymMutation.isError) {
                      handleAgencyBlur(clientNumberInput.value);
                    } else {
                      handleLocationCodeBlur(locationCode.value);
                    }
                  }}
                  onCloseButtonClick={() => { setShowErrorBanner(false); }}
                />
              </Column>
            </Row>
          )
          : null
      }
      {/* {
        !isDefault.value && !readOnly
          ? (
            <Row className="applicant-client-search-row">
              <Column sm={4} md={4} lg={16} xlg={16}>
                <p>
                  If you don&apos;t remember the clientNumberInput information you can
                  {' '}
                  <ClientSearchModal
                    linkText="open the client search"
                    modalLabel="Register A-Class Seedlot"
                    applySelectedClient={(client: ForestClientSearchType) => {
                      const agencyObj: MultiOptionsObj = {
                        code: client.clientNumber,
                        label: client.acronym,
                        description: getForestClientLabel(client)
                      };

                      const selectedAgency: StringInputType = {
                        ...clientNumberInput,
                        value: agencyObj.code,
                        isInvalid: false
                      };

                      const selectedLocationCode = {
                        ...locationCode,
                        value: client.locationCode,
                        isInvalid: false
                      };

                      const updateIsDefault = {
                        ...isDefault,
                        value: false
                      };

                      setLocationCodeHelperText(supportTexts.locationCode.helperTextEnabled);
                      setAgencyAndCode(updateIsDefault, selectedAgency, selectedLocationCode);
                    }}
                  />
                </p>
              </Column>
            </Row>
          )
          : null
      } */}
    </FlexGrid>
  );
};

export default ApplicantAgencyFields;
