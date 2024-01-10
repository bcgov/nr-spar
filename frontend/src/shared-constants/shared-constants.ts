import MultiOptionsObj from '../types/MultiOptionsObject';
import ResponseErrorType from '../types/ResponseErrorType';

export const LOCATION_CODE_LIMIT = 2;
export const SPAR_REDIRECT_PATH = 'SPAR-REDIRECT-PATH';
export const EmptyMultiOptObj: MultiOptionsObj = {
  code: '',
  label: '',
  description: ''
};

export const EmptyResponseError: ResponseErrorType = {
  errOccured: false,
  code: '',
  title: '',
  description: ''
};
