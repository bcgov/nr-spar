import { SeedlotRegFormType } from '@/types/SeedlotRegistrationTypes';

export type CreateSeedlotClassProps = {
  geneticClass: 'A' | 'B';
  title: string;
  subtitle?: string;
  activity: string;
  initialFormData: SeedlotRegFormType;
  errorTitle: string;
};
