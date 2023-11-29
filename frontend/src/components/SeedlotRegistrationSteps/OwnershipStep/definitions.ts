import React from 'react';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { OwnershipInvalidObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { FormInputType } from '../../../types/FormInputType';

export type AccordionItemHeadClick = {
  isOpen: boolean,
  event: React.PointerEvent
}
export type AccordionCtrlObj = {
  [id: number]: boolean
}

export type SingleOwnerForm = {
  id: number,
  useDefaultAgencyInfo: FormInputType & { value: boolean },
  ownerAgency: FormInputType & { value: string },
  ownerCode: FormInputType & { value: string },
  ownerPortion: FormInputType & { value: string },
  reservedPerc: FormInputType & { value: string },
  surplusPerc: FormInputType & { value: string },
  fundingSource: FormInputType & { value: MultiOptionsObj },
  methodOfPayment: FormInputType & { value: MultiOptionsObj }
}

export type SingleInvalidObj = {
  isInvalid: boolean,
  invalidText: string,
}

export type ValidationPropNoId = {
  owner: SingleInvalidObj,
  code: SingleInvalidObj,
  portion: SingleInvalidObj,
  reserved: SingleInvalidObj,
  surplus: SingleInvalidObj,
  funding: SingleInvalidObj,
  payment: SingleInvalidObj
}

export type StateReturnObj = {
  newOwnerArr: Array<SingleOwnerForm>,
  newValidObj: OwnershipInvalidObj,
  newId?: number
}

export type NumStepperVal = {
  value: number,
  direction: string
}

export interface OwnershipStepProps {
  defaultAgency: string
  defaultCode: string,
  agencyOptions: Array<MultiOptionsObj>,
  state: Array<SingleOwnerForm>,
  setStepData: Function,
  invalidState: OwnershipInvalidObj,
  readOnly?: boolean,
  fundingSources: Array<MultiOptionsObj>,
  methodsOfPayment: Array<MultiOptionsObj>
}
