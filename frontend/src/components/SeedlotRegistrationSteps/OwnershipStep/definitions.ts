import React from 'react';
import { OptionsInputType, StringInputType } from '../../../types/FormInputType';

export type AccordionItemHeadClick = {
  isOpen: boolean,
  event: React.PointerEvent
}
export type AccordionCtrlObj = {
  [id: number]: boolean
}

export type SingleOwnerForm = {
  id: number,
  ownerAgency: StringInputType,
  ownerCode: StringInputType,
  ownerPortion: StringInputType,
  reservedPerc: StringInputType,
  surplusPerc: StringInputType,
  fundingSource: OptionsInputType,
  methodOfPayment: OptionsInputType & { hasChanged: boolean }
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
