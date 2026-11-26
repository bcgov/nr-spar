import ApiConfig from '../ApiConfig';
import api from '../api';
import { DrybackSavePayload, DrybackScreenType } from '../../types/consep/DrybackType';

export const getDryback = (riaKey: string): Promise<DrybackScreenType> => api
  .get(`${ApiConfig.dryback}/${riaKey}`)
  .then((res) => res.data);

/** Saves the screen and reschedules dependent activities; returns the refreshed data. */
export const putDryback = (
  riaKey: string,
  payload: DrybackSavePayload & { updateTimestamp: string }
): Promise<DrybackScreenType> => api
  .put(`${ApiConfig.dryback}/${riaKey}`, payload)
  .then((res) => res.data);
