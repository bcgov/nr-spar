import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

import {
  getStepSubmitErrDescription,
  groupSubmitFieldErrorsByStep,
  withSubmitFieldErrors
} from '../../views/Seedlot/ContextContainerClassB/utils';
import { initialProgressConfig } from '../../views/Seedlot/ContextContainerClassB/constants';

const axiosErrorWith = (status: number, data: unknown): AxiosError => {
  const config = { headers: new AxiosHeaders() };
  const response: AxiosResponse = {
    status,
    statusText: '',
    headers: {},
    config,
    data
  };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, response);
};

const validationError = (fields: Array<{ fieldName: string, fieldMessage: string }>) => (
  axiosErrorWith(400, { errorMessage: 'validation problems', fields })
);

describe('groupSubmitFieldErrorsByStep', () => {
  it('sorts field messages into their form steps', () => {
    const grouped = groupSubmitFieldErrorsByStep(validationError([
      { fieldName: 'seedlotFormCollectionDto.collectionGeometryGeoJson', fieldMessage: 'Too big.' },
      { fieldName: 'seedlotFormOwnershipDtoList[0].ownerCode', fieldMessage: 'Owner code required.' },
      { fieldName: 'seedlotFormOwnershipDtoList', fieldMessage: 'Portions must add to 100.' },
      { fieldName: 'seedlotFormInterimDto.intermStrgEndDate', fieldMessage: 'Bad date.' },
      { fieldName: 'seedlotFormExtractionDto.extractionEndDate', fieldMessage: 'Bad end.' },
      { fieldName: 'aouSpzList[0].code', fieldMessage: 'Bad SPZ.' }
    ]));

    expect(grouped).toEqual({
      collection: ['Too big.'],
      ownership: ['Owner code required.', 'Portions must add to 100.'],
      interim: ['Bad date.'],
      extraction: ['Bad end.'],
      other: ['Bad SPZ.']
    });
  });

  it('returns null when there are no field messages or it is not a 400', () => {
    expect(groupSubmitFieldErrorsByStep(axiosErrorWith(400, { message: 'Bad Request' }))).toBeNull();
    expect(groupSubmitFieldErrorsByStep(axiosErrorWith(500, { fields: [{ fieldName: 'a', fieldMessage: 'b' }] }))).toBeNull();
    expect(groupSubmitFieldErrorsByStep(null)).toBeNull();
  });
});

describe('getStepSubmitErrDescription', () => {
  const grouped = groupSubmitFieldErrorsByStep(validationError([
    { fieldName: 'seedlotFormCollectionDto.collectionGeometryGeoJson', fieldMessage: 'Too big.' },
    { fieldName: 'seedlotFormInterimDto.intermStrgEndDate', fieldMessage: 'Bad date.' }
  ]))!;

  it('shows only the current step messages', () => {
    const result = getStepSubmitErrDescription(grouped, 'collection');

    expect(result.description).toBe('Too big. (Error code 400)');
  });

  it('points to the highlighted steps when the current step is clean', () => {
    const result = getStepSubmitErrDescription(grouped, 'extraction');

    expect(result.description).toContain('Collection information, Interim storage');
    expect(result.description).not.toContain('Too big.');
  });
});

describe('withSubmitFieldErrors', () => {
  it('marks steps with server errors invalid without touching the others', () => {
    const grouped = groupSubmitFieldErrorsByStep(validationError([
      { fieldName: 'seedlotFormCollectionDto.orgUnitNo', fieldMessage: 'Required.' }
    ]));

    const merged = withSubmitFieldErrors(initialProgressConfig, grouped);

    expect(merged.collection.isInvalid).toBe(true);
    expect(merged.ownership.isInvalid).toBe(false);
    expect(initialProgressConfig.collection.isInvalid).toBe(false);
  });
});
