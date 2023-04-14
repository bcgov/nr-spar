/* eslint-disable import/no-unresolved */
import { Model } from 'miragejs';
import { ModelDefinition } from 'miragejs/-types';

import CardType from '../../types/Card';
import GeneticClassesType from '../../types/GeneticClasses';
import ApplicantInfo from '../../types/ApplicantInfo';
import SeedlotRegistration from '../../types/SeedlotRegistration';
import Seedlot from '../../types/Seedlot';
import CollectionInformation from '../../types/CollectionInformation';
import CollectorAgency from '../../types/CollectorAgency';
import OrchardType from '../../types/OrchardType';
import { MockSeedlotOrchard } from '../../types/SeedlotTypes/SeedlotOrchard';
import InterimAgencyInfo from '../../types/InterimAgencyInfo';
import StorageInfo from '../../types/StorageInfo';
import InterimStorageRegistration from '../../types/InterimStorageRegistration';
import RegisterOwnerArray from '../../types/SeedlotTypes/OwnershipTypes';

const FavouriteModel: ModelDefinition<CardType> = Model.extend({});
const GeneticClassesModel: ModelDefinition<GeneticClassesType> = Model.extend({});
const ApplicantInfoModel: ModelDefinition<ApplicantInfo> = Model.extend({});
const SeedlotRegistrationModel: ModelDefinition<SeedlotRegistration> = Model.extend({});
const SeedlotInfoModel: ModelDefinition<SeedlotRegistration> = Model.extend({});
const SeedlotModel: ModelDefinition<Seedlot> = Model.extend({});
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
  applicantInfo: ApplicantInfoModel,
  seedlotRegistration: SeedlotRegistrationModel,
  seedlotInfos: SeedlotInfoModel,
  seedlotData: SeedlotModel,
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
