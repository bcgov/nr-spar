import InterimAgencyInfo from './InterimAgencyInfo';
import StorageInfo from './StorageInfo';

type InterimStorageRegistration = {
  seedlotNumber: number;
  applicant: InterimAgencyInfo;
  storageInformation: StorageInfo;
  facilityType: string;
}

export default InterimStorageRegistration;
