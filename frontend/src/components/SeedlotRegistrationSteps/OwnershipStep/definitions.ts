import React from 'react';

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
    fundingSource: string,
    methodOfPayment: string
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

export type ValidationProp = {
    id: number,
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
    newValidArr: Array<ValidationProp>,
    newId?: number
}

export type ComboBoxEvent = {
    selectedItem: string
}

export type CheckBoxValue = {
    checked: boolean,
    id: string
}

export type NumStepperVal = {
    value: number,
    direction: string
}
