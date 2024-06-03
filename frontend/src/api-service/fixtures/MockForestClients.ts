import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType';

export const MockForestClients: ForestClientType[] = [
  {
    clientNumber: '00149081',
    clientName: 'WESTERN FOREST PRODUCTS INC.',
    legalFirstName: '',
    legalMiddleName: '',
    clientStatusCode: 'ACT',
    clientTypeCode: 'C',
    acronym: 'WFP'
  },
  {
    clientNumber: '00012797',
    clientName: 'MINISTRY OF FORESTS',
    legalFirstName: '',
    legalMiddleName: '',
    clientStatusCode: 'ACT',
    clientTypeCode: 'F',
    acronym: 'MOF'
  },
  {
    clientNumber: '00132184',
    clientName: 'TIMBER SALES MANAGER BABINE',
    legalFirstName: '',
    legalMiddleName: '',
    clientStatusCode: 'ACT',
    clientTypeCode: 'F',
    acronym: 'TBA'
  },
  {
    clientNumber: '00132197',
    clientName: 'TIMBER SALES MANAGER CARIBOO-CHILCOTIN',
    legalFirstName: '',
    legalMiddleName: '',
    clientStatusCode: 'ACT',
    clientTypeCode: 'F',
    acronym: 'TCC'
  },
  {
    clientNumber: '00132186',
    clientName: 'TIMBER SALES MANAGER CHINOOK',
    legalFirstName: '',
    legalMiddleName: '',
    clientStatusCode: 'ACT',
    clientTypeCode: 'F',
    acronym: 'TCH'
  }
];

export const UNKOWN_FC: ForestClientType = {
  clientNumber: '88888888',
  clientName: 'MOCKED UNKNOWN',
  legalFirstName: 'John',
  legalMiddleName: 'Doe',
  clientStatusCode: 'ACT',
  clientTypeCode: 'F',
  acronym: 'UNKNOWN'
};
