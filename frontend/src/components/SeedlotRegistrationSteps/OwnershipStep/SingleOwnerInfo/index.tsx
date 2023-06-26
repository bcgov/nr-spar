import React from 'react';
import {
  TextInput,
  NumberInput,
  FlexGrid,
  Column,
  ComboBox,
  Row,
  Button,
  Checkbox
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';

import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';
import {
  SingleOwnerForm,
  CheckBoxValue,
  NumStepperVal
} from '../definitions';
import { inputText, DEFAULT_INDEX, DEFAULT_PAYMENT_INDEX } from '../constants';
import { FilterObj, filterInput } from '../../../../utils/filterUtils';

import './styles.scss';
import { FormInvalidationObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';

interface SingleOwnerInfoProps {
  ownerInfo: SingleOwnerForm,
  disableInputs: boolean,
  handleInputChange: Function,
  addAnOwner: Function,
  deleteAnOwner: Function,
  setDefaultAgencyNCode: Function,
  validationProp: FormInvalidationObj | null,
  agencyOptions: Array<string>,
  fundingSources: Array<MultiOptionsObj>,
  methodsOfPayment: Array<MultiOptionsObj>,
  addRefs: Function,
  readOnly?: boolean,
}

const SingleOwnerInfo = ({
  addRefs, ownerInfo, agencyOptions, fundingSources, methodsOfPayment, disableInputs,
  validationProp, handleInputChange, addAnOwner, deleteAnOwner, setDefaultAgencyNCode,
  readOnly
}: SingleOwnerInfoProps) => (
  <div className="single-owner-info-container">
    <FlexGrid fullWidth>
      {
        ownerInfo.id === DEFAULT_INDEX && (
          <Row>
            <Column className="single-owner-info-col" xs={4} sm={4} md={8} lg={16}>
              <Checkbox
                labelText={inputText.checkbox.labelText}
                id="default-agency-code-checkbox"
                defaultChecked
                onChange={
                  (_event: React.ChangeEvent<HTMLInputElement>, { checked }: CheckBoxValue) => {
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
            onChange={!readOnly ? ((e: ComboBoxEvent) => handleInputChange('ownerAgency', e.selectedItem)) : () => { }}
            // We need to check if validationProp is here since deleting a Single Owner Form
            //    might delete the valid prop first and throwing an error
            invalid={validationProp ? validationProp.owner.isInvalid : false}
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
            disabled={ownerInfo.id === DEFAULT_INDEX ? disableInputs : false}
            placeholder={inputText.code.placeholder}
            type="number"
            maxCount={2}
            value={ownerInfo.ownerCode}
            labelText={inputText.code.labelText}
            helperText={inputText.code.helperText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInputChange(e.target.name, e.target.value);
            }}
            invalid={validationProp ? validationProp.code.isInvalid : false}
            invalidText={validationProp ? validationProp.code.invalidText : ''}
            readOnly={readOnly}
          />
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
            invalid={validationProp ? validationProp.portion.isInvalid : false}
            invalidText={validationProp ? validationProp.portion.invalidText : ''}
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
                invalid={validationProp ? validationProp.reserved.isInvalid : false}
                invalidText={validationProp ? validationProp.reserved.invalidText : ''}
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
                invalid={validationProp ? validationProp.surplus.isInvalid : false}
                invalidText={validationProp ? validationProp.surplus.invalidText : ''}
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
            invalid={validationProp ? validationProp.funding.isInvalid : false}
            invalidText={validationProp ? validationProp.funding.invalidText : ''}
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
            initialSelectedItem={methodsOfPayment[DEFAULT_PAYMENT_INDEX]}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            placeholder={inputText.payment.placeholder}
            titleText={inputText.payment.titleText}
            direction="top"
            onChange={(e: ComboBoxEvent) => handleInputChange('methodOfPayment', e.selectedItem)}
            invalid={validationProp ? validationProp.payment.isInvalid : false}
            invalidText={validationProp ? validationProp.payment.invalidText : ''}
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

export default SingleOwnerInfo;
