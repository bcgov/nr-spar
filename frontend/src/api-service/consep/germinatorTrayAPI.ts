import ApiConfig from '../ApiConfig';
import api from '../api';
import { CreateGermTrayRequest } from '../../views/CONSEP/TestingActivities/TestSearch/ToolbarControls/CreateGermTray/definitions';
import {
  GermTrayTestType,
  GermTrayCreateResponseType,
  GermTrayDeleteContentType,
  GermTrayType,
  GerminatorIdAssignResponseDto
} from '../../types/consep/GerminatorTrayType';

export const assignGerminatorTrays = (
  requests: CreateGermTrayRequest[]
): Promise<GermTrayCreateResponseType[]> => {
  const url = `${ApiConfig.germinatorTrays}`;

  return api.post(url, requests)
    .then((res: { data: GermTrayCreateResponseType[] }) => res.data);
};

export const getGerminatorTraysByIds = (
  germinatorTrayIds: number[]
): Promise<GermTrayType[]> => {
  const url = `${ApiConfig.germinatorTrays}?ids=${germinatorTrayIds.join(',')}`;
  return api.get(url).then((res: { data: GermTrayType[] }) => res.data);
};

/** Optimistic lock on the tray's `revisionCount`: a stale one returns 409. */
export const assignGerminatorId = (
  germinatorTrayId: number,
  germinatorId: string,
  revisionCount: number
) => {
  const url = `${ApiConfig.germinatorTrays}/${germinatorTrayId}/germinator-id`
    + `?germinatorId=${encodeURIComponent(germinatorId)}&revisionCount=${revisionCount}`;

  return api
    .patch(url, null)
    .then((res: { data: GerminatorIdAssignResponseDto }) => res.data);
};

export const getGerminatorTrayContents = (
  germinatorTrayId: number
): Promise<GermTrayTestType[]> => {
  const url = `${ApiConfig.germinatorTrays}/${germinatorTrayId}/tests`;
  return api.get(url).then((res: { data: GermTrayTestType[] }) => res.data);
};

export const deleteTestFromTray = (
  germinatorTrayId: number,
  riaSkey: number,
  activityUpdateTimestamp: string
): Promise<void> => {
  const url = `${ApiConfig.germinatorTrays}/${germinatorTrayId}/tests/${riaSkey}`
      + `?activityUpdateTimestamp=${encodeURIComponent(activityUpdateTimestamp)}`;

  return api.delete(url).then(() => undefined);
};

export const deleteGerminatorTray = (
  germinatorTrayId: number,
  revisionCount: number,
  contents: GermTrayDeleteContentType[]
): Promise<void> => {
  const url = `${ApiConfig.germinatorTrays}/${germinatorTrayId}/delete?revisionCount=${revisionCount}`;

  return api.post(url, contents).then(() => undefined);
};
