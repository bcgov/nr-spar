import { ForestClientType } from '../types/ForestClientTypes/ForestClientType';
import ApplicantAgenciesItems from './fixtures/ApplicantAgenciesItems';
import MultiOptionsObj from '../types/MultiOptionsObject';

const getApplicantAgenciesOptions = (): MultiOptionsObj[] => {
  const options: MultiOptionsObj[] = [];
  ApplicantAgenciesItems.sort(
    (a: ForestClientType, b: ForestClientType) => (a.clientName < b.clientName ? -1 : 1)
  );
  ApplicantAgenciesItems.forEach((agency: ForestClientType) => {
    const { clientName } = agency;
    const newAgency: MultiOptionsObj = {
      code: agency.clientNumber,
      label: `${agency.clientNumber} - ${clientName} - ${agency.acronym}`,
      description: clientName
    };
    options.push(newAgency);
  });
  return options;
};

export default getApplicantAgenciesOptions;
