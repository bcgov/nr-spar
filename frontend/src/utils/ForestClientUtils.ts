import { ForestClientSearchType } from '../types/ForestClientTypes/ForestClientSearchType';
import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import { OptionsInputType } from '../types/FormInputType';
import MultiOptionsObj from '../types/MultiOptionsObject';
import { getOptionsInputObj } from './FormInputUtils';

export const getForestClientFullName = (client: ForestClientType | ForestClientSearchType) => (
  client.legalFirstName
    ? `${client.clientName}, ${client.legalFirstName}`
    : `${client.clientName}`
);

export const getForestClientLabel = (client: ForestClientType | ForestClientSearchType) => {
  const clientFullName = getForestClientFullName(client);
  return client.acronym
    ? `${client.clientNumber} - ${clientFullName} - ${client.acronym}`
    : `${client.clientNumber} - ${clientFullName}`;
};

export const getForestClientOption = (client: ForestClientType): MultiOptionsObj => ({
  code: client.clientNumber,
  description: client.clientName,
  label: getForestClientLabel(client)
});

export const getForestClientOptionInput = (
  id: string,
  client: ForestClientType
): OptionsInputType => (getOptionsInputObj(id, getForestClientOption(client)));
