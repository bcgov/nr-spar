import ForestClientType from '../types/ForestClientTypes/ForestClientType';
import ApplicantAgenciesItems from '../mock-server/fixtures/ApplicantAgenciesItems';
import MultiOptionsObj from '../types/MultiOptionsObject';

const getApplicantAgenciesOptions = (): MultiOptionsObj[] => {
  const options: MultiOptionsObj[] = [];
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
