import ApplicantInfo from './ApplicantInfo';
import MultiOptionsObj from './MultiOptionsObject';

type SeedlotRegistrationObj = {
  seedlotNumber: number;
  applicant: ApplicantInfo;
  species: MultiOptionsObj;
  source: string;
  registered: boolean;
  collectedBC: boolean;
}

export default SeedlotRegistrationObj;
