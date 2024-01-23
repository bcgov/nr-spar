import { UseMutationResult } from '@tanstack/react-query';

export interface ClientSearchModalProps {
  linkText: string;
  modalLabel: string;
  applySelectedClient: Function;
}

export type ClientSearchOptions = 'acronym' | 'fullName' | 'number';

export type ClientSearchDropdown = {
  label: string;
  option: ClientSearchOptions
};

export type MutationParams = {
  word: string;
  option: ClientSearchOptions
};

export type ClientSearchFieldsProps = {
  searchWord: string,
  setSearchWord: Function,
  searchOption: ClientSearchDropdown,
  setSearchOption: Function,
  mutationFn: UseMutationResult<unknown, Error, MutationParams, unknown>
};
