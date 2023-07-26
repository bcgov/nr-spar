import ApplicantAgencyType from '../types/ApplicantAgencyType';
import ApiConfig from './ApiConfig';
import api from './api';

const getApplicantAgencies = (getEditedAgencies: boolean) => {
  const url = ApiConfig.applicantAgencies;
  return api.get(url).then((res) => {
    if (getEditedAgencies) {
      const options: string[] = [];
      res.data.forEach((agency: ApplicantAgencyType) => {
        const correctName = agency.clientName
          .toLowerCase()
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        options.push(`${agency.clientNumber} - ${correctName} - ${agency.acronym}`);
      });
      return options;
    }
    return res.data;
  });
};

export default getApplicantAgencies;
