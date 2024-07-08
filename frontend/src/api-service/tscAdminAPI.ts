import { SeedlotsReturnType, TscSeedlotEditPayloadType } from '../types/SeedlotType';
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

type StatusOnSaveType = 'PND' | 'SUB' | 'APP';

export const putTscSeedlotWithStatus = (
  seedlotNumber: string,
  statusOnSave: StatusOnSaveType,
  payload: TscSeedlotEditPayloadType
) => {
  const url = new URL(ApiConfig.tscSeedlotEdit.replace('{seedlotNumber}', seedlotNumber));

  url.searchParams.append('statusOnSave', statusOnSave);

  return api.put(url.toString(), payload);
};
