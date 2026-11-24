import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

import {
  getBClassSubmitErrDescription,
  groupSubmitFieldErrorsByStep
} from '../../views/Seedlot/ContextContainerClassB/utils';

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

describe('getBClassSubmitErrDescription', () => {
  it('lists every message under its step name, then the unassigned ones', () => {
    const grouped = groupSubmitFieldErrorsByStep(validationError([
      { fieldName: 'seedlotFormInterimDto.intermStrgEndDate', fieldMessage: 'Bad date.' },
      { fieldName: 'aouSpzList[0].code', fieldMessage: 'Bad SPZ.' },
      { fieldName: 'seedlotFormCollectionDto.collectionGeometryGeoJson', fieldMessage: 'Too big.' },
      { fieldName: 'seedlotFormCollectionDto.orgUnitNo', fieldMessage: 'Required.' }
    ]))!;

    const result = getBClassSubmitErrDescription(grouped);

    expect(result.title).toBe('Submission has invalid fields!');
    expect(result.description).toBe(
      'Collection information: Too big. Required. Interim storage: Bad date. Bad SPZ. (Error code 400)'
    );
  });
});
