import React, { useState } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import {
  TextInput,
  FlexGrid,
  Column,
  ComboBox,
  Row,
  Button,
  DropdownSkeleton
} from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import ClientAndCodeInput from '../../../ClientAndCodeInput';

import { StringInputType } from '../../../../types/FormInputType';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';

import { validatePerc } from '../utils';

import { SingleOwnerForm } from '../definitions';
import { inputText, DEFAULT_INDEX, agencyFieldsProps } from '../constants';
import { FilterObj, filterInput } from '../../../../utils/FilterUtils';

import './styles.scss';

interface SingleOwnerInfoProps {
  ownerInfo: SingleOwnerForm,
  deleteAnOwner: Function,
  defaultAgency: string,
  defaultCode: string,
  fundingSourcesQuery: UseQueryResult<MultiOptionsObj[], unknown>,
  methodsOfPaymentQuery: UseQueryResult<MultiOptionsObj[], unknown>,
  checkPortionSum: Function,
  setState: Function,
  readOnly?: boolean,
  isReview?: boolean
}

const SingleOwnerInfo = ({
  ownerInfo, defaultAgency, defaultCode, fundingSourcesQuery,
  methodsOfPaymentQuery, deleteAnOwner, checkPortionSum, setState,
  readOnly, isReview
}: SingleOwnerInfoProps) => {
  const [ownerPortionInvalidText, setOwnerPortionInvalidText] = useState<string>(
    inputText.portion.invalidText
  );
  const [reservedInvalidText, setReservedInvalidText] = useState<string>('');
  const [surplusInvalidText, setSurplusPortionInvalidText] = useState<string>('');

  const colsClass = ownerInfo.id === DEFAULT_INDEX && !isReview ? 'default-owner-col' : 'other-owners-col';

  const setClientAndCode = (
    client: StringInputType,
    locationCode: StringInputType
  ) => {
    const clonedState = structuredClone(ownerInfo);
    clonedState.ownerAgency = client;
    clonedState.ownerCode = locationCode;
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
            <ClientAndCodeInput
              showCheckbox={ownerInfo.id === DEFAULT_INDEX && !isReview}
              checkboxId={ownerInfo.id === DEFAULT_INDEX ? 'default-owner-checkbox' : ''}
              clientInput={ownerInfo.ownerAgency}
              locationCodeInput={ownerInfo.ownerCode}
              textConfig={agencyFieldsProps}
              defaultClientNumber={defaultAgency}
              defaultLocCode={defaultCode}
              setClientAndCode={
                (
                  client: StringInputType,
                  locationCode: StringInputType
                ) => setClientAndCode(client, locationCode)
              }
              readOnly={readOnly}
            />
          </Column>
          <Column className={`single-owner-info-col ${colsClass}`} xs={4} sm={4} md={4} lg={4}>
            <TextInput
              id={ownerInfo.ownerPortion.id}
              name="ownerPortion"
              labelText={inputText.portion.label}
              defaultValue={ownerInfo.ownerPortion.value}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                // The guard is needed here because onClick also trigger the onChange method
                // but it does not pass in any value
                if (e?.target?.name) {
                  handleOwnerPortion(e.target.value);
                }
              }}
              invalid={ownerInfo.ownerPortion.isInvalid}
              invalidText={ownerPortionInvalidText}
              readOnly={readOnly}
            />
          </Column>
          <Column className={`single-owner-info-col ${colsClass}`} xs={4} sm={4} md={4} lg={4}>
            <div className="reserved-perc-container">
              <div className="reserved-surplus-input">
                <TextInput
                  id={ownerInfo.reservedPerc.id}
                  type="number"
                  name="reservedPerc"
                  labelText={inputText.reserved.label}
                  value={ownerInfo.reservedPerc.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e?.target?.name) {
                      handleReservedAndSurplus(e.target.name, e.target.value);
                    }
                  }}
                  onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                  invalid={ownerInfo.reservedPerc.isInvalid}
                  invalidText={reservedInvalidText}
                  readOnly={readOnly}
                />
              </div>
              <div className="reserved-surplus-input">
                <TextInput
                  id={ownerInfo.surplusPerc.id}
                  type="number"
                  name="surplusPerc"
                  labelText={inputText.surplus.label}
                  value={ownerInfo.surplusPerc.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e?.target?.name) {
                      handleReservedAndSurplus(e.target.name, e.target.value);
                    }
                  }}
                  onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                  invalid={ownerInfo.surplusPerc.isInvalid}
                  invalidText={surplusInvalidText}
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
        {((!readOnly) || (readOnly && isReview)) && (
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
                    disabled={readOnly}
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
