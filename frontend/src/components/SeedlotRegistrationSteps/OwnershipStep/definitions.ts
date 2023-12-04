import React from 'react';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';

export type AccordionItemHeadClick = {
  isOpen: boolean,
  event: React.PointerEvent
}
export type AccordionCtrlObj = {
  [id: number]: boolean
}

export type SingleOwnerForm = {
  id: number,
  useDefaultAgencyInfo: BooleanInputType,
  ownerAgency: OptionsInputType,
  ownerCode: StringInputType,
  ownerPortion: StringInputType,
  reservedPerc: StringInputType,
  surplusPerc: StringInputType,
  fundingSource: OptionsInputType,
  methodOfPayment: OptionsInputType
}

export type SingleInvalidObj = {
  isInvalid: boolean,
  invalidText: string,
}

export type StateReturnObj = {
  newOwnerArr: Array<SingleOwnerForm>,
  newId?: number
}

export type NumStepperVal = {
  value: number,
  direction: string
}

export interface OwnershipStepProps {
  defaultAgency: MultiOptionsObj
  defaultCode: string,
  agencyOptions: Array<MultiOptionsObj>,
  state: Array<SingleOwnerForm>,
  setStepData: Function,
  readOnly?: boolean,
  fundingSources: Array<MultiOptionsObj>,
  methodsOfPayment: Array<MultiOptionsObj>
}
