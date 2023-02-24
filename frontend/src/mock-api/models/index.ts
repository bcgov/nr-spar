/* eslint-disable import/no-unresolved */
import { Model } from 'miragejs';
import { ModelDefinition } from 'miragejs/-types';

import CardType from '../../types/Card';
import GeneticClassesType from '../../types/GeneticClasses';
import ApplicantInfo from '../../types/ApplicantInfo';
import SeedlotRegistration from '../../types/SeedlotRegistration';

const FavouriteModel: ModelDefinition<CardType> = Model.extend({});
const GeneticClassesModel: ModelDefinition<GeneticClassesType> = Model.extend({});
const ApplicantInfoModel: ModelDefinition<ApplicantInfo> = Model.extend({});
const SeedlotRegistrationModel: ModelDefinition<SeedlotRegistration> = Model.extend({});

const models = {
  favourites: FavouriteModel,
  geneticClasses: GeneticClassesModel,
  applicantInfo: ApplicantInfoModel,
  seedlotRegistration: SeedlotRegistrationModel
};

export default models;
