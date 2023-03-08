import ApplicantInfo from './ApplicantInfo';

type SeedlotRegistration = {
  seedlotNumber: number;
  applicant: ApplicantInfo;
  species: string;
  source: string;
  registered: boolean;
  collectedBC: boolean;
}

export default SeedlotRegistration;
