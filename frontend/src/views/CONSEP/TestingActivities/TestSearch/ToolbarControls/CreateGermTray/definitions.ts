export interface GermTrayOptions {
  printDishLabels: boolean;
  printGerminationTrayLabels: boolean;
  printGerminationCoverSheet: boolean;
  printGerminationTestRecord: boolean;
}

export interface CreateGermTrayProps {
  onClose: () => void;
  onSubmit: (options: GermTrayOptions) => void;
  isLoading?: boolean;
}
