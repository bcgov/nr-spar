export type ButtonObjType = {
  id: string
  kind: string
  size: string
  icon: JSX.Element
  text: string
  action?: () => void
  disabled?: boolean
};
