import ApiConfig from './ApiConfig';
import api from './api';
import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import MockForestClients from './fixtures/MockForestClients';
import { ForestClientSearchType } from '../types/ForestClientTypes/ForestClientSearchType';
import { ClientSearchOptions } from '../components/ApplicantAgencyFields/ClientSearchModal/definitions';

export const getForestClientLocation = (clientNumber: string, locationCode: string) => {
  // TODO: restore this once forest client is back up
  // const url = `${ApiConfig.forestClient}/${clientNumber}/location/${locationCode}`;
  // return api.get(url).then((res) => res.data);

  return MockForestClients.find((fc) => (fc.acronym))
};

export const getForestClientByNumberOrAcronym = (clientNumber: string) => {
  const url = `${ApiConfig.forestClient}/${clientNumber}`;
  return api.get(url).then((res): ForestClientType => res.data);
};

export const getAllAgencies = (): string[] => {
  const options: string[] = [];
  MockForestClients.sort(
    (a: ForestClientType, b: ForestClientType) => (a.clientName < b.clientName ? -1 : 1)
  );
  MockForestClients.forEach((agency: ForestClientType) => {
    let clientName = agency.clientName
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    if (clientName.indexOf('-') > -1) {
      clientName = clientName
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
    }
    options.push(`${agency.clientNumber} - ${clientName} - ${agency.acronym}`);
  });
  return options;
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
