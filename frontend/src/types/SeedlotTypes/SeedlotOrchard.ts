import { OrchardForm } from '../../components/SeedlotRegistrationSteps/OrchardStep/definitions';

export type MockSeedlotOrchard = {
  [seedlotnumber: string]: OrchardForm;
}

export type OrchardType = {
  id: string;
  name: string;
}
