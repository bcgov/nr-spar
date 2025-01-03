export type HeaderProps = {
  key: string;
  header: string;
};

export type CellProps = {
  id: string;
  value: string;
};

export type RowProps = {
  id: string;
  activityName: string;
  department: string;
  cells?: CellProps[];
};

export type FavouriteActivityModalProps = {
  open: boolean;
  setOpen: Function;
};

export type FavActivityTableProps = {
  rows: RowProps[];
  headers: HeaderProps[];
  getHeaderProps: (props: { header: HeaderProps }) => any;
  getSelectionProps: (props: { row: RowProps }) => any;
  getRowProps: (props: { row: RowProps }) => any;
};

export type FavActivitySearchOptions = 'All departments' | 'Testing' | 'Administrative' | 'Withdrawal' | 'Processing' | 'Seed and family lot';

export type FavActivitySearchMenu = {
  label: string;
  option: FavActivitySearchOptions
};

export type Department = 'Testing' | 'Administrative' | 'Withdrawal' | 'Processing' | 'Seed and family lot';
