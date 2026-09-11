import ApiConfig from '../ApiConfig';
import api from '../api';
import {
  GermCountDataType,
  GermCountUpsertPayload,
  GerminationTestHeaderType,
  GermReplicateType
} from '../../types/consep/GerminationType';

export const getGerminationTestHeader = (
  riaKey: string
): Promise<GerminationTestHeaderType> => api
  .get(`${ApiConfig.germinationTests}/${riaKey}`)
  .then((res) => res.data);

export const getGermCounts = (
  riaKey: string
): Promise<GermCountDataType> => api
  .get(`${ApiConfig.germCounts}/${riaKey}`)
  .then((res) => res.data);

export const putGermCounts = (
  riaKey: string,
  payload: GermCountUpsertPayload
): Promise<GermCountDataType> => api
  .put(`${ApiConfig.germCounts}/${riaKey}`, payload)
  .then((res) => res.data);

export const getTestReplicates = (
  riaKey: string
): Promise<GermReplicateType[]> => api
  .get(`${ApiConfig.testReplicates}/${riaKey}`)
  .then((res) => res.data);
