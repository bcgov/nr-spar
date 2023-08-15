import React from 'react';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { OwnershipInvalidObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';

export type AccordionItemHeadClick = {
  isOpen: boolean,
  event: React.PointerEvent
}
export type AccordionCtrlObj = {
  [id: number]: boolean
}

export type SingleOwnerForm = {
  id: number,
  useDefaultAgencyInfo: boolean,
  ownerAgency: string,
  ownerCode: string,
  ownerPortion: string,
  reservedPerc: string,
  surplusPerc: string,
  fundingSource: MultiOptionsObj,
  methodOfPayment: MultiOptionsObj | null,
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
