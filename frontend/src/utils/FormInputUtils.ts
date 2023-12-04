import MultiOptionsObj from '../types/MultiOptionsObject';
import {
  BooleanInputType,
  NumberInputType,
  OptionsInputType,
  StringArrInputType,
  StringInputType
} from '../types/FormInputType';

const isInvalid: boolean = false;

export const getOptionsInputObj = (id: string, value: MultiOptionsObj): OptionsInputType => ({
  id,
  isInvalid,
  value
});

export const getBooleanInputObj = (id: string, value: boolean): BooleanInputType => ({
  id,
  isInvalid,
  value
});

export const getStringInputObj = (id: string, value: string): StringInputType => ({
  id,
  isInvalid,
  value
});

export const getStringArrInputObj = (id: string, value: string[]): StringArrInputType => ({
  id,
  isInvalid,
  value
});

export const getNumberInputObj = (id: string, value: number): NumberInputType => ({
  id,
  isInvalid,
  value
});
