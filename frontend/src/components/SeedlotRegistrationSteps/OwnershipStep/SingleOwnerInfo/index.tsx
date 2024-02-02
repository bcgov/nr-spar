import React, { useState } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import {
  NumberInput,
  FlexGrid,
  Column,
  ComboBox,
  Row,
  Button,
  DropdownSkeleton
} from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import ApplicantAgencyFields from '../../../ApplicantAgencyFields';

import { BooleanInputType, OptionsInputType, StringInputType } from '../../../../types/FormInputType';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';

import { validatePerc } from '../utils';

import {
  SingleOwnerForm,
  NumStepperVal
} from '../definitions';
import { inputText, DEFAULT_INDEX, agencyFieldsProps } from '../constants';
import { FilterObj, filterInput } from '../../../../utils/FilterUtils';

import './styles.scss';

interface SingleOwnerInfoProps {
  ownerInfo: SingleOwnerForm,
  deleteAnOwner: Function,
  agencyOptions: Array<MultiOptionsObj>,
  defaultAgency: MultiOptionsObj,
  defaultCode: string,
  fundingSourcesQuery: UseQueryResult<MultiOptionsObj[], unknown>,
  methodsOfPaymentQuery: UseQueryResult<MultiOptionsObj[], unknown>,
  checkPortionSum: Function,
  setState: Function,
  readOnly?: boolean
}

const SingleOwnerInfo = ({
  ownerInfo, agencyOptions, defaultAgency, defaultCode, fundingSourcesQuery,
  methodsOfPaymentQuery, deleteAnOwner, checkPortionSum, setState, readOnly
}: SingleOwnerInfoProps) => {
  const [ownerPortionInvalidText, setOwnerPortionInvalidText] = useState<string>(
    inputText.portion.invalidText
  );
  const [reservedInvalidText, setReservedInvalidText] = useState<string>('');
  const [surplusInvalidText, setSurplusPortionInvalidText] = useState<string>('');

  const colsClass = ownerInfo.id === DEFAULT_INDEX ? 'default-owner-col' : 'other-owners-col';

  const setAgencyAndCode = (
    isDefault: BooleanInputType,
    agency: OptionsInputType,
    locationCode: StringInputType
  ) => {
    const clonedState = structuredClone(ownerInfo);
    clonedState.ownerAgency = agency;
    clonedState.ownerCode = locationCode;
    clonedState.useDefaultAgencyInfo = isDefault;
    setState(clonedState, ownerInfo.id);
  };

  const handleOwnerPortion = (value: string) => {
    const clonedState = structuredClone(ownerInfo);
    clonedState.ownerPortion.value = value;
    // First validate the format of what is set on the value and
    // get the correct error message
    const { isInvalid, invalidText } = validatePerc(value);
    clonedState.ownerPortion.isInvalid = isInvalid;
    if (isInvalid) {
      setOwnerPortionInvalidText(invalidText);
      setState(clonedState, ownerInfo.id);
    } else {
      // Now, check the total sum of the owner portions, the sum must
      // not be over 100%. Due the need to check and validate other fields
      // other than this owner, the state will be set under this function
      checkPortionSum(clonedState, ownerInfo.id);
      setOwnerPortionInvalidText(inputText.portion.invalidText);
    }
  };

  // These fields are codependent, so they can be handled in a single
  // function
  const handleReservedAndSurplus = (field: string, value: string) => {
    const clonedState = structuredClone(ownerInfo);
    const isReserved = field === 'reservedPerc';

    // First validate the format of what is set on the value and
    // get the correct error message
    const { isInvalid, invalidText } = validatePerc(value);
    if (isReserved) {
      clonedState.reservedPerc.value = value;
      clonedState.reservedPerc.isInvalid = isInvalid;
      setReservedInvalidText(invalidText);
    } else {
      clonedState.surplusPerc.value = value;
      clonedState.surplusPerc.isInvalid = isInvalid;
      setSurplusPortionInvalidText(invalidText);
    }

    if (!isInvalid) {
      let otherValue = String((100 - Number(value)).toFixed(2));

      // If the other value is an int then show a whole number
      if (Number(otherValue) % 1 === 0) {
        otherValue = Number(otherValue).toFixed(0);
      }

      // Set the other value
      if (isReserved) {
        clonedState.surplusPerc.value = otherValue;
        clonedState.surplusPerc.isInvalid = false;
      } else {
        clonedState.reservedPerc.value = otherValue;
        clonedState.reservedPerc.isInvalid = false;
      }
    }

    setState(clonedState, ownerInfo.id);
  };

  const handleFundingSource = (selectedOption: MultiOptionsObj) => {
    const clonedState = structuredClone(ownerInfo);
    clonedState.fundingSource.value = selectedOption;
    setState(clonedState, ownerInfo.id);
  };

  const handleMethodOfPayment = (selectedOption: MultiOptionsObj) => {
    const clonedState = structuredClone(ownerInfo);
    clonedState.methodOfPayment.value = selectedOption;
    clonedState.methodOfPayment.hasChanged = true;
    setState(clonedState, ownerInfo.id);
  };

  return (
    <div className="single-owner-info-container">
      <FlexGrid fullWidth>
        <Row>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            <ApplicantAgencyFields
              checkboxId={ownerInfo.id === DEFAULT_INDEX ? 'default-owner-checkbox' : ''}
              isDefault={ownerInfo.useDefaultAgencyInfo}
              agency={ownerInfo.ownerAgency}
              locationCode={ownerInfo.ownerCode}
              fieldsProps={agencyFieldsProps}
              agencyOptions={agencyOptions}
              defaultAgency={defaultAgency}
              defaultCode={defaultCode}
              setAgencyAndCode={
                (
                  isDefault: BooleanInputType,
                  agency: OptionsInputType,
                  locationCode: StringInputType
                ) => setAgencyAndCode(isDefault, agency, locationCode)
              }
              showCheckbox={ownerInfo.id === DEFAULT_INDEX}
              readOnly={readOnly ?? false}
            />
          </Column>
          <Column className={`single-owner-info-col ${colsClass}`} xs={4} sm={4} md={4} lg={4}>
            <NumberInput
              id={ownerInfo.ownerPortion.id}
              name="ownerPortion"
              label={inputText.portion.label}
              defaultValue={ownerInfo.ownerPortion.value}
              hideSteppers
              max={100}
              min={0}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                // The guard is needed here because onClick also trigger the onChange method
                // but it does not pass in any value
                if (e?.target?.name && e?.target?.value) {
                  handleOwnerPortion(e.target.value);
                }
              }}
              invalid={ownerInfo.ownerPortion.isInvalid}
              invalidText={ownerPortionInvalidText}
              onClick={
                (
                  _e: React.MouseEvent<HTMLButtonElement>,
                  target: NumStepperVal | undefined
                ) => {
                  // A guard is needed here because any click on the input will emit a
                  //   click event, not necessarily the + - buttons
                  if (target?.value) {
                    handleOwnerPortion(String(target.value));
                  }
                }
              }
              readOnly={readOnly}
            />
          </Column>
          <Column className={`single-owner-info-col ${colsClass}`} xs={4} sm={4} md={4} lg={4}>
            <div className="reserved-perc-container">
              <div className="reserved-surplus-input">
                <NumberInput
                  id={ownerInfo.reservedPerc.id}
                  name="reservedPerc"
                  label={inputText.reserved.label}
                  value={ownerInfo.reservedPerc.value}
                  hideSteppers
                  max={100}
                  min={0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e?.target?.name && e?.target?.value) {
                      handleReservedAndSurplus(e.target.name, e.target.value);
                    }
                  }}
                  invalid={ownerInfo.reservedPerc.isInvalid}
                  invalidText={reservedInvalidText}
                  onClick={
                    (
                      _e: React.MouseEvent<HTMLButtonElement>,
                      target: NumStepperVal | undefined
                    ) => {
                      if (target?.value) {
                        handleReservedAndSurplus('reservedPerc', String(target.value));
                      }
                    }
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="reserved-surplus-input">
                <NumberInput
                  id={ownerInfo.surplusPerc.id}
                  name="surplusPerc"
                  label={inputText.surplus.label}
                  value={ownerInfo.surplusPerc.value}
                  hideSteppers
                  max={100}
                  min={0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e?.target?.name && e?.target?.value) {
                      handleReservedAndSurplus(e.target.name, e.target.value);
                    }
                  }}
                  invalid={ownerInfo.surplusPerc.isInvalid}
                  invalidText={surplusInvalidText}
                  onClick={
                    (
                      _e: React.MouseEvent<HTMLButtonElement>,
                      target: NumStepperVal | undefined
                    ) => {
                      if (target?.value) {
                        handleReservedAndSurplus('surplusPerc', String(target.value));
                      }
                    }
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>
          </Column>
        </Row>
        <Row>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            {
              fundingSourcesQuery.isFetching
                ? <DropdownSkeleton />
                : (
                  <ComboBox
                    className="single-owner-combobox"
                    id={ownerInfo.fundingSource.id}
                    name="fundingSource"
                    items={fundingSourcesQuery.data ?? []}
                    selectedItem={ownerInfo.fundingSource.value}
                    shouldFilterItem={
                      ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                    }
                    placeholder={inputText.funding.placeholder}
                    titleText={inputText.funding.titleText}
                    direction="top"
                    onChange={(e: ComboBoxEvent) => handleFundingSource(e.selectedItem)}
                    invalid={ownerInfo.fundingSource.isInvalid}
                    invalidText={inputText.funding.invalidText}
                    readOnly={readOnly}
                  />
                )
            }
          </Column>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            {
              methodsOfPaymentQuery.isFetching
                ? <DropdownSkeleton />
                : (
                  <ComboBox
                    className="single-owner-combobox"
                    id={ownerInfo.methodOfPayment.id}
                    name="methodOfPayment"
                    items={methodsOfPaymentQuery.data ?? []}
                    selectedItem={ownerInfo.methodOfPayment.value}
                    shouldFilterItem={
                      ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                    }
                    placeholder={inputText.payment.placeholder}
                    titleText={inputText.payment.titleText}
                    direction="top"
                    onChange={(e: ComboBoxEvent) => handleMethodOfPayment(e.selectedItem)}
                    invalid={ownerInfo.methodOfPayment.isInvalid}
                    invalidText={inputText.payment.invalidText}
                    readOnly={readOnly}
                  />

                )
            }
          </Column>
        </Row>
        {(!readOnly) && (
          <Row>
            {
              ownerInfo.id !== DEFAULT_INDEX
                ? (
                  <Button
                    kind="danger--tertiary"
                    size="md"
                    className="owner-mod-btn"
                    renderIcon={TrashCan}
                    onClick={() => deleteAnOwner(ownerInfo.id)}
                  >
                    Delete owner
                  </Button>
                )
                : null
            }
          </Row>
        )}
      </FlexGrid>
    </div>
  );
};

export default SingleOwnerInfo;
