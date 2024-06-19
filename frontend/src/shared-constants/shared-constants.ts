import { BooleanInputType } from '../types/FormInputType';
import MultiOptionsObj from '../types/MultiOptionsObject';

export const LOCATION_CODE_LIMIT = 2;
export const SPAR_REDIRECT_PATH = 'SPAR-REDIRECT-PATH';
export const EmptyMultiOptObj: MultiOptionsObj = {
  code: '',
  label: '',
  description: ''
};
export const EmptyBooleanInputType: BooleanInputType = {
  id: '',
  isInvalid: false,
  value: false
};

export const SMALL_SCREEN_WIDTH = 320;
export const MEDIUM_SCREEN_WIDTH = 672;
export const LARGE_SCREEN_WIDTH = 1056;

export const TSC_ADMIN_ROLE = 'SPAR_TSC_ADMIN';
