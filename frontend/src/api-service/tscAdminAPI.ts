import { SeedlotsReturnType, SeedlotStatusCode, TscSeedlotEditPayloadType } from '../types/SeedlotType';
import ApiConfig from './ApiConfig';
import api from './api';

export const getSeedlotToReview = (pageNumber: number, pageSize: number) => {
  const url = `${ApiConfig.tscAdmin}/seedlots?page=${pageNumber}&size=${pageSize}`;
  return api.get(url).then((res): SeedlotsReturnType => (
    {
      seedlots: res.data,
      totalCount: Number(res.headers['x-total-count'])
    }
  ));
};

export type PutTscSeedlotMutationObj = {
  seedlotNum: string,
  statusOnSave: SeedlotStatusCode,
  payload: TscSeedlotEditPayloadType
}

export const putTscSeedlotWithStatus = (
  seedlotNumber: string,
  statusOnSave: SeedlotStatusCode,
  payload: TscSeedlotEditPayloadType
) => {
  const url = new URL(ApiConfig.tscSeedlotEdit.replace('{seedlotNumber}', seedlotNumber));

  url.searchParams.append('statusOnSave', statusOnSave);

  return api.put(url.toString(), payload);
};

export const updateSeedlotStatus = (
  seedlotNumber: string,
  statusOnSave: SeedlotStatusCode
) => {
  const url = ApiConfig.tscSeedlotStatusUpdate.replace('{seedlotNumber}', seedlotNumber).replace('{status}', statusOnSave);

  return api.post(url, null);
};
