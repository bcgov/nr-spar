import ApiConfig from './ApiConfig';
import api from './api';
import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import { ForestClientSearchType } from '../types/ForestClientTypes/ForestClientSearchType';
import { ClientSearchOptions } from '../components/ApplicantAgencyFields/ClientSearchModal/definitions';

export const getForestClientLocation = (clientNumber: string, locationCode: string) => {
  const url = `${ApiConfig.forestClient}/${clientNumber}/location/${locationCode}`;
  return api.get(url).then((res) => res.data);
};

export const getForestClientByNumberOrAcronym = (numberOrAcronym: string) => {
  const url = `${ApiConfig.forestClient}/${numberOrAcronym}`;
  return api.get(url).then((res): ForestClientType => res.data);
};

export const searchForestClients = (
  searchQuery: string,
  searchType: ClientSearchOptions
) => {
  const url = new URL(`${ApiConfig.forestClient}/search`);
  url.searchParams.append('type', searchType);
  url.searchParams.append('query', searchQuery);

  return api.get(url.toString()).then((res) => (res.data) as ForestClientSearchType[]);
};
