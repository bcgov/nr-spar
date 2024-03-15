export type ListItem = {
  name: string;
  icon: string;
  link: string;
  disabled: boolean;
};

export type ListItems = {
  name: string;
  items: ListItem[];
};

export type RightPanelType = {
  [panel: string]: boolean;
};

export interface HearderContainerProps {
  isSideNavExpanded: boolean,
  onClickSideNavExpand: Function
}
