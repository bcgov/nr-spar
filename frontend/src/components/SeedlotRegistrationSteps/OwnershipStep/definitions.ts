import React from 'react';

import DropDownObj from '../../../types/DropDownObject';
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
    ownerAgency: string,
    ownerCode: string,
    ownerPortion: string,
    reservedPerc: string,
    surplusPerc: string,
    fundingSource: DropDownObj,
    methodOfPayment: DropDownObj,
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

export type CheckBoxValue = {
    checked: boolean,
    id: string
}

export type NumStepperVal = {
    value: number,
    direction: string
}
