import ApiConfig from './ApiConfig';
import api from './api';

export type OrgUnitDistrictType = {
  orgUnitNo: number,
  orgUnitCode: string,
  orgUnitName: string
};

const getOrgUnitDistricts = () => {
  const url = ApiConfig.orgUnitDistricts;
  return api.get(url).then((res): OrgUnitDistrictType[] => res.data);
};

export default getOrgUnitDistricts;
