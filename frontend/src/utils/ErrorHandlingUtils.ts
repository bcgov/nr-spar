import { AxiosError } from 'axios';
import ResponseErrorType from '../types/ResponseErrorType';
import { EmptyResponseError } from '../shared-constants/shared-constants';

const createErrorMessage = (err: AxiosError): ResponseErrorType => {
  let errorResponse: ResponseErrorType = EmptyResponseError;
  switch (err.code) {
    case '401':
      errorResponse = {
        errOccured: true,
        code: err.code,
        title: 'Session expired!',
        description: 'Your session has expired. Please refresh the page and log in again to continue. (Error code 401)'
      };
      break;
    case '500':
      errorResponse = {
        errOccured: true,
        code: err.code,
        title: 'Submission failure!',
        description: 'An unexpected error occurred while submitting your seedlot registration. Please try again, and if the issue persists, contact support. (Error code 500)'
      };
      break;
    case '503':
      errorResponse = {
        errOccured: true,
        code: err.code,
        title: 'Network error!',
        description: 'System is facing network issues at the moment. Please check your internet connection and retry. (Error code 503)'
      };
      break;
    default:
      errorResponse = {
        errOccured: true,
        code: 'Unknown',
        title: 'Unknown failure!',
        description: `${err.message} (Error code ${err.code})`
      };
      break;
  }

  return errorResponse;
};

export default createErrorMessage;
