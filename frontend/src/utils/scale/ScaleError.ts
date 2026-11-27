import { ScaleErrorCode } from './types';

export const ERROR_MESSAGES: Readonly<Record<ScaleErrorCode, string>> = {
  busy: 'Balance is busy and cannot execute the command. Try again.',
  overload: 'Balance is overloaded (weight above capacity).',
  underload: 'Balance is underloaded (is the weighing pan in place?).',
  syntax: 'Balance did not recognise the command (ES).',
  transmission: 'Transmission error between app and balance (ET). Check the serial settings.',
  logic: 'Balance cannot execute the command right now (EL).',
  timeout: 'No stable weight in time. Keep the balance still and try again.',
  unparseable: 'Unexpected response from the balance.',
  disconnected: 'Balance is not connected.'
};

export class ScaleError extends Error {
  readonly code: ScaleErrorCode;

  readonly raw?: string;

  constructor(code: ScaleErrorCode, raw?: string) {
    super(ERROR_MESSAGES[code]);
    this.name = 'ScaleError';
    this.code = code;
    this.raw = raw;
  }
}
