import ApiConfig from '../ApiConfig';
import api from '../api';
import { CreateGermTrayRequest } from '../../views/CONSEP/TestingActivities/TestSearch/ToolbarControls/CreateGermTray/definitions';
import { GermTrayCreateResponseType, GerminatorIdAssignResponseDto } from '../../types/consep/GerminatorTrayType';

export const assignGerminatorTrays = (
  requests: CreateGermTrayRequest[]
): Promise<GermTrayCreateResponseType[]> => {
  const url = `${ApiConfig.germinatorTrays}`;

  return api.post(url, requests)
    .then((res: { data: GermTrayCreateResponseType[] }) => res.data);
};

export const assignGerminatorId = (
  germinatorTrayId: number,
  germinatorId: string
) => {
  const url = `${ApiConfig.germinatorTrays}/${germinatorTrayId}/germinator-id`;

  return api
    .patch(url, { params: { germinatorId } })
    .then((res: { data: GerminatorIdAssignResponseDto }) => res.data);
};
