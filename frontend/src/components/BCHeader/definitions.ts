export type ListItem = {
  name: string,
  icon: string,
  link: string,
  disabled: boolean
};

export type ListItems = {
  name: string,
  items: ListItem[]
};

export type RightPanelType = {
  myProfile: boolean,
  notifications: boolean
};

export interface HearderContainerProps {
  isSideNavExpanded: boolean,
  onClickSideNavExpand: Function
}
