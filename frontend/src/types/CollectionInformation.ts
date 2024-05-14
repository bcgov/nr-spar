import CollectionMethods from './CollectionMethods';
import CollectorAgency from './CollectorAgency';

type CollectionInformation = {
  seedlotNumber: string;
  applicant: CollectorAgency;
  startDate?: string;
  endDate?: string;
  numberOfContainers?: string;
  volumePerContainer?: string;
  volumeOfCones?: string;
  collectionMethods?: CollectionMethods;
  comments?: string;
}

export default CollectionInformation;
