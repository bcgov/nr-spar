import ApplicantInfo from './ApplicantInfo';
import CollectionMethods from './CollectionMethods';

type SeedlotCollector = {
  seedlotNumber: number;
  applicant: ApplicantInfo;
  startDate: string;
  endDate: string;
  containerNumbers: number;
  volumeContainer: number;
  volumeCones: number;
  collectionMethods: CollectionMethods;
  comments: string;
}

export default SeedlotCollector;
