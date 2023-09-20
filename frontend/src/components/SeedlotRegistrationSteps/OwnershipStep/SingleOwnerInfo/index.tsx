import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import validator from 'validator';
import {
  TextInput,
  NumberInput,
  FlexGrid,
  Column,
  ComboBox,
  Row,
  Button,
  Checkbox,
  InlineLoading
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';

import getForestClientLocation from '../../../../api-service/forestClientsAPI';

import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import {
  SingleOwnerForm,
  NumStepperVal
} from '../definitions';
import { inputText, DEFAULT_INDEX } from '../constants';
import { FilterObj, filterInput } from '../../../../utils/filterUtils';
import getForestClientNumber from '../../../../utils/StringUtils';
import { FormInvalidationObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import CheckboxType from '../../../../types/CheckboxType';

import './styles.scss';

interface SingleOwnerInfoProps {
  ownerInfo: SingleOwnerForm,
  disableInputs: boolean,
  handleInputChange: Function,
  addAnOwner: Function,
  deleteAnOwner: Function,
  setDefaultAgencyNCode: Function,
  useDefaultAgency: boolean,
  validationProp: FormInvalidationObj,
  agencyOptions: Array<string>,
  fundingSources: Array<MultiOptionsObj>,
  methodsOfPayment: Array<MultiOptionsObj>,
  addRefs: Function,
  readOnly?: boolean,
}

const SingleOwnerInfo = ({
  addRefs, ownerInfo, agencyOptions, fundingSources, methodsOfPayment, disableInputs,
  validationProp, handleInputChange, addAnOwner, deleteAnOwner, setDefaultAgencyNCode,
  useDefaultAgency, readOnly
}: SingleOwnerInfoProps) => {
  const [forestClientNumber, setForestClientNumber] = useState<string>('');
  const [locCodeValidationFail, setLocCodeValidationFail] = useState<boolean>(false);
  const [locationHelper, setLocationHelper] = useState<string>(
    ownerInfo.id === DEFAULT_INDEX
      ? inputText.code.helperTextEnabled
      : inputText.code.helperTextDisabled
  );

  const validateLocationCode = useMutation({
    mutationFn: (queryParams:string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
    ),
    onSuccess: () => {
      setLocCodeValidationFail(false);
    },
    onError: () => {
      setLocCodeValidationFail(true);
    }
  });

  return (
    <div className="single-owner-info-container">
      <FlexGrid fullWidth>
        {
          ownerInfo.id === DEFAULT_INDEX && (
            <Row>
              <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={16}>
                <Checkbox
                  labelText={inputText.checkbox.labelText}
                  id="default-agency-code-checkbox"
                  checked={useDefaultAgency}
                  onChange={
                    (_event: React.ChangeEvent<HTMLInputElement>, { checked }: CheckboxType) => {
                      setLocationHelper(
                        checked
                          ? inputText.code.helperTextEnabled
                          : inputText.code.helperTextDisabled
                      );
                      setDefaultAgencyNCode(checked);
                    }
                  }
                  readOnly={readOnly}
                />
              </Column>
            </Row>
          )
        }
        <Row>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            <ComboBox
              className="single-owner-combobox"
              id={`owner-agency-${ownerInfo.id}`}
              ref={(el: HTMLInputElement) => addRefs(el, 'ownerAgency')}
              disabled={ownerInfo.id === DEFAULT_INDEX ? disableInputs : false}
              name="ownerAgency"
              items={agencyOptions}
              selectedItem={ownerInfo.ownerAgency}
              shouldFilterItem={
                ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
              }
              placeholder={inputText.owner.placeholder}
              titleText={inputText.owner.titleText}
              helperText={inputText.owner.helperText}
              onChange={
                !readOnly
                  ? ((e: ComboBoxEvent) => {
                    setForestClientNumber(e.selectedItem ? getForestClientNumber(e.selectedItem) : '');
                    setLocationHelper(inputText.code.helperTextEnabled);
                    if (e.selectedItem) {
                      handleInputChange('ownerAgency', e.selectedItem);
                    } else {
                      setLocCodeValidationFail(false);
                      handleInputChange('ownerAgency', e.selectedItem, 'ownerCode', '');
                    }
                  })
                  : () => { }
                }
              // We need to check if validationProp is here since deleting a Single Owner Form
              //    might delete the valid prop first and throwing an error
              invalid={validationProp.owner.isInvalid}
              invalidText={inputText.owner.invalidText}
              readOnly={readOnly}
            />
          </Column>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            <TextInput
              className="owner-code-text-input"
              name="ownerCode"
              id={`single-owner-code-${ownerInfo.id}`}
              ref={(el: HTMLInputElement) => addRefs(el, 'ownerCode')}
              disabled={
                ownerInfo.id === DEFAULT_INDEX
                  ? disableInputs || !forestClientNumber
                  : !forestClientNumber
              }
              placeholder={!forestClientNumber ? '' : inputText.code.placeholder}
              type="number"
              maxCount={2}
              value={ownerInfo.ownerCode}
              labelText={inputText.code.labelText}
              helperText={locationHelper}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleInputChange(e.target.name, e.target.value);
              }}
              invalid={
                validationProp.code.isInvalid || locCodeValidationFail
              }
              invalidText={
                locCodeValidationFail
                  ? inputText.code.invalidLocationForSelectedAgency
                  : inputText.code.invalidTextValue
              }
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!e.target.readOnly) {
                  let locationCode = e.target.value;
                  setLocationHelper('');
                  const isInRange = validator.isInt(locationCode, { min: 0, max: 99 });

                  // Adding this check to add an extra 0 on the left, for cases where
                  // the user types values between 0 and 9
                  if (isInRange && locationCode.length === 1) {
                    locationCode = locationCode.padStart(2, '0');
                    handleInputChange('ownerCode', locationCode);
                  }
                  validateLocationCode.mutate([forestClientNumber, locationCode]);
                }
              }}
              readOnly={readOnly}
            />
            {
              validateLocationCode.isLoading
                ? <InlineLoading description="Validating..." />
                : null
            }
          </Column>
        </Row>
        <Row>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            <NumberInput
              id={`single-owner-portion-${ownerInfo.id}`}
              ref={(el: HTMLInputElement) => addRefs(el, 'ownerPortion')}
              name="ownerPortion"
              label={inputText.portion.label}
              value={ownerInfo.ownerPortion}
              step={10.00}
              max={100}
              min={0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                // The guard is needed here because onClick also trigger the onChange method
                // but it does not pass in any value
                if (e?.target?.name && e?.target?.value) {
                  handleInputChange(e.target.name, e.target.value);
                }
              }}
              invalid={validationProp.portion.isInvalid}
              invalidText={validationProp.portion.invalidText}
              onClick={
                (
                  _e: React.MouseEvent<HTMLButtonElement>,
                  target: NumStepperVal | undefined
                ) => {
                  // A guard is needed here because any click on the input will emit a
                  //   click event, not necessarily the + - buttons
                  if (target?.value) {
                    handleInputChange('ownerPortion', String(target.value));
                  }
                }
              }
              readOnly={readOnly}
            />
          </Column>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            <div className="reserved-perc-container">
              <div className="reserved-surplus-input">
                <NumberInput
                  id={`single-owner-reserved-${ownerInfo.id}`}
                  ref={(el: HTMLInputElement) => addRefs(el, 'reservedPerc')}
                  name="reservedPerc"
                  label={inputText.reserved.label}
                  value={ownerInfo.reservedPerc}
                  step={10}
                  max={100}
                  min={0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e?.target?.name && e?.target?.value) {
                      handleInputChange(e.target.name, e.target.value);
                    }
                  }}
                  invalid={validationProp.reserved.isInvalid}
                  invalidText={validationProp.reserved.invalidText}
                  onClick={
                    (
                      _e: React.MouseEvent<HTMLButtonElement>,
                      target: NumStepperVal | undefined
                    ) => {
                      if (target?.value) {
                        handleInputChange('reservedPerc', String(target.value));
                      }
                    }
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="reserved-surplus-input">
                <NumberInput
                  id={`single-owner-surplus-${ownerInfo.id}`}
                  ref={(el: HTMLInputElement) => addRefs(el, 'surplusPerc')}
                  name="surplusPerc"
                  label={inputText.surplus.label}
                  value={ownerInfo.surplusPerc}
                  step={10}
                  max={100}
                  min={0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e?.target?.name && e?.target?.value) {
                      handleInputChange(e.target.name, e.target.value);
                    }
                  }}
                  invalid={validationProp.surplus.isInvalid}
                  invalidText={validationProp.surplus.invalidText}
                  onClick={
                    (
                      _e: React.MouseEvent<HTMLButtonElement>,
                      target: NumStepperVal | undefined
                    ) => {
                      if (target?.value) {
                        handleInputChange('surplusPerc', String(target.value));
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
            <ComboBox
              className="single-owner-combobox"
              id={`owner-funding-source-${ownerInfo.id}`}
              ref={(el: HTMLInputElement) => addRefs(el, 'fundingSource')}
              name="fundingSource"
              items={fundingSources}
              selectedItem={ownerInfo.fundingSource}
              shouldFilterItem={
                ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
              }
              placeholder={inputText.funding.placeholder}
              titleText={inputText.funding.titleText}
              direction="top"
              onChange={(e: ComboBoxEvent) => handleInputChange('fundingSource', e.selectedItem)}
              invalid={validationProp.funding.isInvalid}
              invalidText={validationProp.funding.invalidText}
              readOnly={readOnly}
            />
          </Column>
          <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={8}>
            <ComboBox
              className="single-owner-combobox"
              id={`owner-method-of-payment-${ownerInfo.id}`}
              ref={(el: HTMLInputElement) => addRefs(el, 'methodOfPayment')}
              name="methodOfPayment"
              items={methodsOfPayment}
              selectedItem={ownerInfo.methodOfPayment}
              shouldFilterItem={
                ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
              }
              placeholder={inputText.payment.placeholder}
              titleText={inputText.payment.titleText}
              direction="top"
              onChange={(e: ComboBoxEvent) => handleInputChange('methodOfPayment', e.selectedItem)}
              invalid={validationProp.payment.isInvalid}
              invalidText={validationProp.payment.invalidText}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        {(!readOnly) && (
          <Row>
            {
              ownerInfo.id === DEFAULT_INDEX
                ? (
                  <Button
                    kind="tertiary"
                    size="md"
                    className="owner-mod-btn"
                    renderIcon={Add}
                    onClick={addAnOwner}
                  >
                    Add owner
                  </Button>
                )
                : (
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
            }
          </Row>
        )}
      </FlexGrid>
    </div>
  );
};

export default SingleOwnerInfo;
