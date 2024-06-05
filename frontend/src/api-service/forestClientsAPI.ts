import { AxiosError } from 'axios';
import ApiConfig from './ApiConfig';
import api from './api';
import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import { MockForestClients, UNKOWN_FC } from './fixtures/MockForestClients';
import { ForestClientSearchType } from '../types/ForestClientTypes/ForestClientSearchType';
import { ClientSearchOptions } from '../components/ApplicantAgencyFields/ClientSearchModal/definitions';

// eslint-disable-next-line arrow-body-style, @typescript-eslint/no-unused-vars
export const getForestClientLocation = (clientNumber: string, locationCode: string) => {
  // TODO: restore this once forest client is back up
  // const url = `${ApiConfig.forestClient}/${clientNumber}/location/${locationCode}`;
  // return api.get(url).then((res) => res.data);

  // default mocked false number
  if (locationCode === '99') {
    return Promise.reject(new AxiosError("don't worry it's fine"));
  }

  return Promise.resolve();
};

// eslint-disable-next-line arrow-body-style
export const getForestClientByNumberOrAcronym = (numberOrAcronym: string) => {
  // TODO: restore this once forest client is back up
  // const url = `${ApiConfig.forestClient}/${clientNumber}`;
  // return api.get(url).then((res): ForestClientType => res.data);

  return Promise.resolve(
    MockForestClients.find(
      (fc) => fc.clientNumber === numberOrAcronym || fc.acronym === numberOrAcronym
    ) ?? UNKOWN_FC
  );
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
