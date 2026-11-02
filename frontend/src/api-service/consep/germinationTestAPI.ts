import ApiConfig from '../ApiConfig';
import api from '../api';
import {
  GermCountDataType,
  GermCountUpsertPayload,
  GerminationTestHeaderType,
  GerminationTestUpdatePayload,
  GermReplicateType
} from '../../types/consep/GerminationType';

export const getGerminationTestHeader = (
  riaKey: string
): Promise<GerminationTestHeaderType> => api
  .get(`${ApiConfig.germinationTests}/${riaKey}`)
  .then((res) => res.data);

/** The Calc button (#2756): computes and saves Germ %, GV and PV, returns the fresh header. */
export const calculateGerminationMetrics = (
  riaKey: string
): Promise<GerminationTestHeaderType> => api
  .post(`${ApiConfig.germinationTests}/${riaKey}/calculate`, null)
  .then((res) => res.data);

export const patchGerminationTest = (
  riaKey: string,
  payload: GerminationTestUpdatePayload
): Promise<GerminationTestHeaderType> => api
  .patch(`${ApiConfig.germinationTests}/${riaKey}`, payload)
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

/** Ticks or unticks one replicate's Accept box; works on a completed test (#2756). */
export const updateRepAccepted = (
  riaKey: string,
  replicateNumber: number,
  repAcceptedInd: number
): Promise<GermReplicateType> => api
  .patch(`${ApiConfig.testReplicates}/${riaKey}/${replicateNumber}`, { repAcceptedInd })
  .then((res) => res.data);

export const getTestReplicates = (
  riaKey: string
): Promise<GermReplicateType[]> => api
  .get(`${ApiConfig.testReplicates}/${riaKey}`)
  .then((res) => res.data);
