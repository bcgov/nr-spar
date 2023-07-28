import ApplicantAgencyType from '../types/ApplicantAgencyType';
import ApiConfig from './ApiConfig';
import api from './api';

/**
 * Fetch the applicant agencies available for the user
 *
 * @param {boolean} getEditedAgencies this parameter will define to return either an array
 *                                    with full agencies data or an array of a string
 *                                    combination of the code, name and acronym of each agency.
 *                                    Defaults to false.
 * @returns {Array} applicant agencies information
 */
const getApplicantAgencies = (getEditedAgencies = false) => {
  const url = ApiConfig.applicantAgencies;
  return api.get(url).then((res) => {
    if (getEditedAgencies) {
      const options: string[] = [];
      res.data.sort(
        (a: ApplicantAgencyType, b: ApplicantAgencyType) => (a.clientName < b.clientName ? -1 : 1)
      );
      res.data.forEach((agency: ApplicantAgencyType) => {
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
    }
    return res.data;
  });
};

export default getApplicantAgencies;
