export interface ClientSearchModalProps {
  linkText: string;
  modalLabel: string;
}

export type LaunchModal = {
  open: boolean;
  setOpen: Function;
}

export type ClientSearchOptions = 'acronym' | 'fullName' | 'number';

export type ClientSearchDropdown = {
  label: string;
  option: ClientSearchOptions
};
