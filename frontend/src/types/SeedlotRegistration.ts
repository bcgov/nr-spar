import ApplicantInfo from './ApplicantInfo';
import DropDownObj from './DropDownObject';

type SeedlotRegistration = {
  seedlotNumber: number;
  applicant: ApplicantInfo;
  species: DropDownObj;
  source: string;
  registered: boolean;
  collectedBC: boolean;
}

export default SeedlotRegistration;
