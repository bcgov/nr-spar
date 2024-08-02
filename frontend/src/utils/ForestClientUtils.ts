import { ForestClientSearchType } from '../types/ForestClientTypes/ForestClientSearchType';
import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import { StringInputType } from '../types/FormInputType';
import MultiOptionsObj from '../types/MultiOptionsObject';
import { getStringInputObj } from './FormInputUtils';

export const getForestClientFullName = (client: ForestClientType | ForestClientSearchType) => (
  client.legalFirstName
    ? `${client.clientName}, ${client.legalFirstName}`
    : `${client.clientName}`
);

export const getForestClientLabel = (client: ForestClientType | ForestClientSearchType) => {
  const clientFullName = getForestClientFullName(client);
  return client.acronym
    ? `${client.acronym} - ${clientFullName} - ${client.clientNumber}`
    : `${clientFullName} - ${client.clientNumber}`;
};

export const getForestClientOption = (client: ForestClientType): MultiOptionsObj => ({
  code: client.clientNumber,
  description: client.clientName,
  label: getForestClientLabel(client)
});

export const getForestClientStringInput = (
  id: string,
  clientNumber: string
): StringInputType => (getStringInputObj(id, clientNumber));
