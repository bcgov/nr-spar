import axios from 'axios';

import RevisionCountDto from '../types/RevisionCountDto';
import { SeedlotPatchPayloadType, SeedlotRegPayloadType } from '../types/SeedlotRegistrationTypes';
import {
  RichSeedlotType, SeedlotAClassFullResponseType, SeedlotAClassSubmitType,
  SeedlotBClassFullResponseType, SeedlotBClassProgressPayloadType, SeedlotBClassSubmitType,
  SeedlotCreateResponseType, SeedlotProgressPayloadType, SeedlotsReturnType
} from '../types/SeedlotType';
import ApiConfig from './ApiConfig';
import api from './api';

export const putAClassSeedlot = (seedlotNumber: string, payload: SeedlotAClassSubmitType) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/a-class-submission`;
  return api.put(url, payload);
};

export const postSeedlot = (payload: SeedlotRegPayloadType) => {
  const url = ApiConfig.seedlots;
  return api.post(url, payload);
};

export const postFile = (
  file: File,
  isMixFile: boolean
) => {
  const url = isMixFile ? ApiConfig.uploadSMPMix : ApiConfig.uploadConeAndPollen;
  const formData = new FormData();
  formData.append('file', file);
  return api.post(url, formData, true);
};

export const getSeedlotByClientId = (clientId: string, pageNumber: number, pageSize: number) => {
  const url = `${ApiConfig.seedlots}/clients/${clientId}?page=${pageNumber}&size=${pageSize}`;
  return api.get(url).then((res): SeedlotsReturnType => (
    {
      seedlots: res.data,
      totalCount: Number(res.headers['x-total-count'])
    }
  ));
};

export const getSeedlotById = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}`;
  return api.get(url).then((res): RichSeedlotType => res.data);
};

export const patchSeedlotApplicationInfo = (
  seedlotNumber: string,
  payload: SeedlotPatchPayloadType
) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/application-info`;
  return api.patch(url, payload);
};

export const putAClassSeedlotProgress = (
  seedlotNumber: string,
  payload: SeedlotProgressPayloadType
) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/a-class-form-progress`;
  return api.put(url, payload).then((res): RevisionCountDto => res.data);
};

export const getAClassSeedlotProgressStatus = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/a-class-form-progress/status`;
  return api.get(url);
};

export const getAClassSeedlotDraft = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/a-class-form-progress`;
  return api.get(url);
};

export const getAClassSeedlotFullForm = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/a-class-full-form`;
  return api.get(url).then((res) => res.data as SeedlotAClassFullResponseType);
};

export const getBClassSeedlotDraft = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/b-class-form-progress`;
  return api.get(url);
};

export const putBClassSeedlotProgress = (
  seedlotNumber: string,
  payload: SeedlotBClassProgressPayloadType
) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/b-class-form-progress`;
  return api.put(url, payload).then((res): RevisionCountDto => res.data);
};

export const putBClassSeedlot = (seedlotNumber: string, payload: SeedlotBClassSubmitType) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/b-class-submission`;
  return api.put(url, payload);
};

export const getBClassSeedlotProgressStatus = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/b-class-form-progress/status`;
  return api.get(url);
};

export const getBClassSeedlotFullForm = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/b-class-full-form`;
  return api.get(url).then((res) => res.data as SeedlotBClassFullResponseType);
};

export type SeedlotCollectionGeometryResponse = {
  seedlotNumber: string;
  geometryGeoJson: string | null;
  featureClassSkey: number | null;
  featureArea: number | null;
  featurePerimeter: number | null;
  observationDate: string | null;
  revisionCount: number;
};

/** Submitted collection polygon from SPAR PostGIS. 404 → null (none saved yet). */
export const getCollectionGeometry = (
  seedlotNumber: string
): Promise<SeedlotCollectionGeometryResponse | null> => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/collection-geometry`;
  return api.get(url)
    .then((res: { data: SeedlotCollectionGeometryResponse }) => res.data)
    .catch((err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    });
};

/**
 * Fetches the legacy SPRR001 Class B seedlot registration report as a PDF blob.
 * Open it with openBlankTab + openBlobInNewTab from DownloadUtils when the
 * request is async (see that module's popup-blocker-safe pattern).
 */
export const downloadBClassRegistrationReport = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${seedlotNumber}/reports/registration`;
  return api.get(url, { responseType: 'blob' }).then((res): Blob => res.data);
};

export const getSeedlotFromOracleDbBySeedlotNumber = (seedlotNumber: string) => {
  const url = ApiConfig.seedlotFromOracleDbBySeedlotNumber.replace('{seedlotNumber}', seedlotNumber);
  return api.get(url);
};

export const postCopySeedlot = (sourceSeedlotNumber: string) => {
  const url = `${ApiConfig.seedlots}/${sourceSeedlotNumber}/copy`;
  return api.post(url, {}).then((res): SeedlotCreateResponseType => res.data);
};
