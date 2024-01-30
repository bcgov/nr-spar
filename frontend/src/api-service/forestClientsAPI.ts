import ApiConfig from './ApiConfig';
import api from './api';
import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import ApplicantAgenciesItems from '../mock-server/fixtures/ApplicantAgenciesItems';
import { ForestClientDisplayType } from '../types/ForestClientTypes/ForestClientDisplayType';
import { ClientSearchOptions } from '../components/ApplicantAgencyFields/ClientSearchModal/definitions';

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

// Leaving this here for testing/demo on the FE
// REMOVE AFTER REAL API IS DONE
const forestClientMockData: Array<ForestClientDisplayType> = [
  {
    acronym: 'WFP',
    number: '00149081',
    fullName: 'WESTERN FOREST PRODUCTS INC.',
    locationCode: '28',
    location: '#118-1334 ISLAND HIGHWAY',
    city: 'CAMPBELL RIVER'
  },
  {
    acronym: 'WFP',
    number: '00149081',
    fullName: 'WESTERN FOREST PRODUCTS INC.',
    locationCode: '25',
    location: '#201 - 65 FRONT STREET',
    city: 'NANAIMO'
  },
  {
    acronym: 'WFP',
    number: '00149081',
    fullName: 'WESTERN FOREST PRODUCTS INC.',
    locationCode: '26',
    location: '800 1055 WEST GEORGIA STREET',
    city: 'VANCOUVER'
  },
  {
    acronym: 'MOF',
    number: '00012797',
    fullName: 'MINISTRY OF FORESTS',
    locationCode: '00',
    location: '18793 32ND AVENUE',
    city: 'SURREY'
  },
  {
    acronym: 'MOF',
    number: '00012797',
    fullName: 'MINISTRY OF FORESTS',
    locationCode: '02',
    location: '17000 DOMANO BLVD',
    city: 'PRINCE GEORGE'
  },
  {
    acronym: 'MOF',
    number: '00012797',
    fullName: 'MINISTRY OF FORESTS',
    locationCode: '07',
    location: '4300 NORTH ROAD',
    city: 'VICTORIA'
  },
  {
    acronym: 'MOF',
    number: '00012797',
    fullName: 'MINISTRY OF FORESTS',
    locationCode: '08',
    location: '9800 140TH STREET',
    city: 'SURREY'
  },
  {
    acronym: 'TBA',
    number: '00132184',
    fullName: 'TIMBER SALES MANAGER BABINE',
    locationCode: '01',
    location: 'BURNS LAKE TSO',
    city: 'BURNS LAKE'
  },
  {
    acronym: 'TBA',
    number: '00132184',
    fullName: 'TIMBER SALES MANAGER BABINE',
    locationCode: '00',
    location: 'BURNS LAKE TIMBER SALES OFFICE BOX 999',
    city: 'BURNS LAKE'
  },
  {
    acronym: 'TCC',
    number: '00132197',
    fullName: 'TIMBER SALES MANAGER CARIBOO-CHILCOTIN',
    locationCode: '02',
    location: 'TCC - WILLIAMS LAKE FIELD TEAM 200-640 BORLAND ST',
    city: 'WILLIAMS LAKE'
  },
  {
    acronym: 'TCC',
    number: '00132197',
    fullName: 'TIMBER SALES MANAGER CARIBOO-CHILCOTIN',
    locationCode: '01',
    location: 'TCC - QUESNEL FIELD TEAM 322 JOHNSTON AVENUE',
    city: 'QUESNEL'
  },
  {
    acronym: 'TCC',
    number: '00132197',
    fullName: 'TIMBER SALES MANAGER CARIBOO-CHILCOTIN',
    locationCode: '00',
    location: 'CARIBOO CHILCOTIN TIMBER SALES OFFICE 200-640 BORLAND ST',
    city: 'WILLIAMS LAKE'
  },
  {
    acronym: 'TCH',
    number: '00132186',
    fullName: 'TIMBER SALES MANAGER CHINOOK',
    locationCode: '03',
    location: '7077 DUNCAN STREET',
    city: 'POWELL RIVER'
  },
  {
    acronym: 'TCH',
    number: '00132186',
    fullName: 'TIMBER SALES MANAGER CHINOOK',
    locationCode: '01',
    location: '101-42000 LOGGERS LANE',
    city: 'SQUAMISH'
  },
  {
    acronym: 'TCH',
    number: '00132186',
    fullName: 'TIMBER SALES MANAGER CHINOOK',
    locationCode: '02',
    location: '1229 CEMETERY ROAD PO BOX 39',
    city: 'QUEEN CHARLOTTE CITY'
  },
  {
    acronym: 'TCH',
    number: '00132186',
    fullName: 'TIMBER SALES MANAGER CHINOOK',
    locationCode: '00',
    location: '46360 AIRPORT ROAD',
    city: 'CHILLIWACK'
  }
];

export const searchForestClients = (
  searchWord: string,
  searchOption: ClientSearchOptions
) => {
  const returnPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredResults = forestClientMockData.filter(
        (client: ForestClientDisplayType) => client[searchOption].includes(searchWord.toUpperCase())
      );
      if (searchWord === 'all') {
        resolve(forestClientMockData);
      } else if (searchWord !== 'error') {
        resolve(filteredResults);
      } else {
        reject(new Error('Error on fake backend :('));
      }
    }, 3000);
  });

  returnPromise.then((res: any): ForestClientDisplayType[] => res.data);

  return returnPromise;
};
