import React, { useState } from 'react';
import { AxiosError } from 'axios';
import {
  Row, Column, TextInput, Checkbox, Tooltip,
  InlineLoading, ActionableNotification, FlexGrid
} from '@carbon/react';
import { useMutation } from '@tanstack/react-query';
import validator from 'validator';

import ClientSearchModal from './ClientSearchModal';

import { getForestClientByNumberOrAcronym, getForestClientLocation } from '../../api-service/forestClientsAPI';

import MultiOptionsObj from '../../types/MultiOptionsObject';
import { ForestClientSearchType } from '../../types/ForestClientTypes/ForestClientSearchType';
import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType';
import { EmptyMultiOptObj, LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';
import { getForestClientLabel } from '../../utils/ForestClientUtils';

import ApplicantAgencyFieldsProps from './definitions';
import supportTexts, { getErrorMessageTitle } from './constants';
import { formatLocationCode } from './utils';

import './styles.scss';

const ApplicantAgencyFields = ({
  checkboxId, isDefault, agency, locationCode, fieldsProps, defaultAgency,
  defaultCode, setAgencyAndCode, readOnly, showCheckbox, maxInputColSize
}: ApplicantAgencyFieldsProps) => {
  const [showSuccessIconAgency, setShowSuccessIconAgency] = useState<boolean>(true);
  const [showSuccessIconLocCode, setShowSuccessIconLocCode] = useState<boolean>(false);

  const [showErrorBanner, setShowErrorBanner] = useState<boolean>(false);
  const [invalidAcronymMessage, setInvalidAcronymMessage] = useState<string>(
    supportTexts.agency.invalidAcronym
  );

  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>(
    locationCode.isInvalid && agency.value
      ? supportTexts.locationCode.invalidLocationForSelectedAgency
      : supportTexts.locationCode.invalidText
  );
  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    supportTexts.locationCode.helperTextDisabled
  );

  const updateAfterAgencyValidation = (isInvalid: boolean, clientData?: ForestClientType) => {
    let updatedAgency;
    if (clientData) {
      updatedAgency = {
        ...agency,
        value: {
          label: clientData.acronym,
          code: clientData.clientNumber,
          description: `${clientData.clientNumber} - ${clientData.clientName} - ${clientData.acronym}`
        },
        isInvalid
      };
    } else {
      updatedAgency = {
        ...agency,
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
    setAgencyAndCode(isDefault, agency, updatedLocationCode);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams: string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
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
        validateLocationCodeMutation.mutate([res.clientNumber, locationCode.value]);
      }
    }
  });

  const handleDefaultCheckBox = (checked: boolean) => {
    setLocationCodeHelperText(
      checked
        ? supportTexts.locationCode.helperTextEnabled
        : supportTexts.locationCode.helperTextDisabled
    );

    const updatedAgency = {
      ...agency,
      value: checked ? defaultAgency : EmptyMultiOptObj,
      isInvalid: checked && defaultAgency?.label === ''
    };

    const updatedLocationCode = {
      ...locationCode,
      value: checked ? defaultCode : '',
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

  const updateAgencyFn = (value: string) => (
    {
      ...agency,
      isInvalid: false,
      value: value
        ? {
          ...EmptyMultiOptObj,
          label: value
        }
        : EmptyMultiOptObj
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
          {
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <button className="tooltip-trigger" type="button">
              <InlineLoading
                status={loadingStatus}
              />
            </button>
          }
        </Tooltip>
      );
    }
    return null;
  };

  const handleAgencyInput = (value: string) => {
    // Create a "mock" MultiOptObj, just to display
    // the correct acronym
    const updatedAgency = updateAgencyFn(value);

    setAgencyAndCode(isDefault, updatedAgency, locationCode);
  };

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

    setAgencyAndCode(isDefault, agency, updatedLocationCode);
  };

  const handleLocationCodeBlur = (value: string) => {
    const formatedCode = value.length ? formatLocationCode(value) : '';
    const updatedLocationCode = {
      ...locationCode,
      value: formatedCode,
      isInvalid: false
    };
    setAgencyAndCode(isDefault, agency, updatedLocationCode);
    if (formatedCode === '') {
      setShowSuccessIconLocCode(false);
      return;
    }
    setShowSuccessIconLocCode(true);
    validateLocationCodeMutation.mutate([agency.value.code, formatedCode]);
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
      <Row className="agency-information-row">
        <Column sm={4} md={4} lg={8} xlg={maxInputColSize ?? 8}>
          <div className="loading-input-wrapper">
            <TextInput
              className="agency-input"
              id={agency.id}
              labelText={fieldsProps.agencyInput.titleText}
              value={agency.value.label}
              helperText={(readOnly || isDefault.value) ? null : supportTexts.agency.helperText}
              invalid={agency.isInvalid}
              invalidText={invalidAcronymMessage}
              readOnly={isDefault.value || readOnly}
              enableCounter
              maxCount={8}
              onChange={
                (e: React.ChangeEvent<HTMLInputElement>) => handleAgencyInput(e.target.value)
              }
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
              placeholder={!agency.value.code ? '' : supportTexts.locationCode.placeholder}
              labelText={fieldsProps.locationCode.labelText}
              helperText={(readOnly || isDefault.value) ? null : locationCodeHelperText}
              invalid={locationCode.isInvalid}
              invalidText={(isDefault.value && locationCode.value === '')
                ? supportTexts.locationCode.invalidTextInterimSpecific
                : invalidLocationMessage}
              readOnly={(isDefault.value && locationCode.value !== '') || readOnly}
              disabled={!agency.value.code || (isDefault.value && locationCode.value === '')}
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
                      handleAgencyBlur(agency.value.label);
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
      {
        !isDefault.value && !readOnly
          ? (
            <Row className="applicant-client-search-row">
              <Column sm={4} md={4} lg={16} xlg={16}>
                <p>
                  If you don&apos;t remember the agency information you can
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

                      const selectedAgency = {
                        ...agency,
                        value: agencyObj,
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
      }
    </FlexGrid>
  );
};

export default ApplicantAgencyFields;
