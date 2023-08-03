import ApplicantAgencyType from '../types/ApplicantAgencyType';
import ApplicantAgenciesItems from '../mock-server/fixtures/ApplicantAgenciesItems';

const getApplicantAgenciesOptions = (): Array<string> => {
  const options: string[] = [];
  ApplicantAgenciesItems.sort(
    (a: ApplicantAgencyType, b: ApplicantAgencyType) => (a.clientName < b.clientName ? -1 : 1)
  );
  ApplicantAgenciesItems.forEach((agency: ApplicantAgencyType) => {
    let correctName = agency.clientName
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    if (correctName.indexOf('-') > -1) {
      correctName = correctName
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
    }
    options.push(`${agency.clientNumber} - ${correctName} - ${agency.acronym}`);
  });
  return options;
};

export default getApplicantAgenciesOptions;
