import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import { OptionsInputType } from '../types/FormInputType';
import MultiOptionsObj from '../types/MultiOptionsObject';
import { getOptionsInputObj } from './FormInputUtils';

export const getForestClientLabel = (client: ForestClientType) => (
  `${client.clientNumber} - ${client.clientName} - ${client.acronym}`
);

export const getForestClientOption = (client: ForestClientType): MultiOptionsObj => ({
  code: client.clientNumber,
  description: client.clientName,
  label: getForestClientLabel(client)
});

export const getForestClientOptionInput = (
  id: string,
  client: ForestClientType
): OptionsInputType => (getOptionsInputObj(id, getForestClientOption(client)));
