/* eslint-disable import/no-unresolved */
import { Model } from 'miragejs';
import { ModelDefinition } from 'miragejs/-types';

import { FavActivityType } from '../../types/FavActivityTypes';
import GeneticClassesType from '../../types/GeneticClasses';
import CollectionInformation from '../../types/CollectionInformation';
import CollectorAgency from '../../types/CollectorAgency';
import { MockSeedlotOrchard, OrchardType } from '../../types/SeedlotTypes/SeedlotOrchard';
import InterimAgencyInfo from '../../types/InterimAgencyInfo';
import StorageInfo from '../../types/StorageInfo';
import InterimStorageRegistration from '../../types/InterimStorageRegistration';
import RegisterOwnerArray from '../../types/SeedlotTypes/OwnershipTypes';

const FavouriteModel: ModelDefinition<FavActivityType> = Model.extend({});
const GeneticClassesModel: ModelDefinition<GeneticClassesType> = Model.extend({});
const CollectionInformationModel: ModelDefinition<CollectionInformation> = Model.extend({});
const CollectorAgencyModel: ModelDefinition<CollectorAgency> = Model.extend({});
const OrchardModel: ModelDefinition<OrchardType> = Model.extend({});
const SeedlotOrchardModel: ModelDefinition<MockSeedlotOrchard> = Model.extend({});
const InterimAgencyInfoModel: ModelDefinition<InterimAgencyInfo> = Model.extend({});
const StorageInfoModel: ModelDefinition<StorageInfo> = Model.extend({});
const InterimRegistrationModel: ModelDefinition<InterimStorageRegistration> = Model.extend({});
const RegisterOwnerModel: ModelDefinition<RegisterOwnerArray> = Model.extend({});

const models = {
  favourites: FavouriteModel,
  geneticClasses: GeneticClassesModel,
  collectionInformation: CollectionInformationModel,
  collectorAgency: CollectorAgencyModel,
  orchards: OrchardModel,
  seedlotOrchard: SeedlotOrchardModel,
  interimAgencyInfo: InterimAgencyInfoModel,
  storageInfo: StorageInfoModel,
  interimStorageRegistration: InterimRegistrationModel,
  registerOwnerData: RegisterOwnerModel
};

export default models;
