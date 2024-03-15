import MultiOptionsObj from './MultiOptionsObject';

export type FormInputType = {
  id: string;
  isInvalid: boolean;
  errMsg?: string;
};

export type OptionsInputType = FormInputType & { value: MultiOptionsObj };

export type BooleanInputType = FormInputType & { value: boolean };

export type StringInputType = FormInputType & { value: string };

export type StringArrInputType = FormInputType & { value: string[] };

export type NumberInputType = FormInputType & { value: number };
