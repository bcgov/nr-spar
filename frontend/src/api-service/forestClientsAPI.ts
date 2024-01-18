import ApiConfig from './ApiConfig';
import api from './api';
import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import ApplicantAgenciesItems from '../mock-server/fixtures/ApplicantAgenciesItems';
import ForestClientType from '../types/ForestClientTypes/ForestClientType';

export const getForestClientLocation = (clientNumber: string, locationCode: string) => {
  const url = `${ApiConfig.forestClient}/${clientNumber}/location/${locationCode}`;
  return api.get(url).then((res) => res.data);
};

export const getForestClientByNumber = (clientNumber?: string) => {
  const url = `${ApiConfig.forestClient}/${clientNumber}`;
  return api.get(url).then((res): ForestClientType => res.data);
};

export const getAllAgencies = (): string[] => {
  const options: string[] = [];
  ApplicantAgenciesItems.sort(
    (a: ForestClientType, b: ForestClientType) => (a.clientName < b.clientName ? -1 : 1)
  );
  ApplicantAgenciesItems.forEach((agency: ForestClientType) => {
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
