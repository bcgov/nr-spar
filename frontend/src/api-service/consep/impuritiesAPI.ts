import ApiConfig from '../ApiConfig';
import api from '../api';
import { ImpurityPayload, RichImpurityType } from '../../views/CONSEP/TestingActivities/PurityContent/definitions';

export const patchImpurities = (
  riaKey: string,
  payload: ImpurityPayload
) => {
  const url = `${ApiConfig.purityTest}/debris/${riaKey}`;
  return api.patch(url, payload).then((res): RichImpurityType[] => res.data);
};

export const deleteImpurity = (
  riaKey: string,
  replicateNumber: string,
  debrisRank: string
) => {
  const url = `${ApiConfig.purityTest}/debris/${riaKey}/${replicateNumber}/${debrisRank}`;
  return api.delete(url).then((res): RichImpurityType[] => res.data);
};
