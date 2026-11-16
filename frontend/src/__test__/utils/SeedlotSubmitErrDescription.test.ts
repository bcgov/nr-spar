import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

import { getSeedlotSubmitErrDescription } from '../../views/Seedlot/ContextContainerClassA/utils';

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

describe('getSeedlotSubmitErrDescription', () => {
  it('lists the field messages from a validation 400', () => {
    const err = axiosErrorWith(400, {
      errorMessage: '2 field(s) with validation problems!',
      fields: [
        {
          fieldName: 'seedlotFormCollectionDto.collectionGeometryGeoJson',
          fieldMessage: 'Collection area cannot span more than 8 km radius. Shrink the polygon and try again.'
        },
        {
          fieldName: 'seedlotFormCollectionDto.captureMethodCode',
          fieldMessage: 'Capture method is required.'
        }
      ]
    });

    const result = getSeedlotSubmitErrDescription(err);

    expect(result.title).toBe('Submission has invalid fields!');
    expect(result.description).toContain('8 km radius');
    expect(result.description).toContain('Capture method is required.');
    expect(result.description).toContain('(Error code 400)');
  });

  it('falls back to the generic message for a 400 without field errors', () => {
    const err = axiosErrorWith(400, { message: 'Bad Request' });

    const result = getSeedlotSubmitErrDescription(err);

    expect(result.title).toBe('Unknown failure!');
  });

  it('keeps the existing 401 message', () => {
    const result = getSeedlotSubmitErrDescription(axiosErrorWith(401, null));

    expect(result.title).toBe('Session expired!');
  });
});
