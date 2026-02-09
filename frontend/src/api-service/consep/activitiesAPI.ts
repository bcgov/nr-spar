import ApiConfig from '../ApiConfig';
import api from '../api';

import { AddActivityRequest } from '../../views/CONSEP/TestingActivities/TestSearch/ToolbarControls/AddActivity/definitions';
import { TestingSearchResponseType, AddGermTestValidationResponseType } from '../../types/consep/TestingSearchType';

export const addActivities = (
  params: AddActivityRequest
) => {
  const url = `${ApiConfig.activities}`;

  return api.post(url, params)
    .then((res: { data: TestingSearchResponseType }) => res.data);
};

export const validateAddGermTest = (
  activityTypeCd: string,
  seedlotNumber?: string,
  familyLotNumber?: string
) => {
  const url = `${ApiConfig.activities}/validate-add-germ-test`;

  return api.get(url, {
    params: {
      activityTypeCd,
      seedlotNumber,
      familyLotNumber
    }
  }).then((res: { data: AddGermTestValidationResponseType }) => res.data);
};
