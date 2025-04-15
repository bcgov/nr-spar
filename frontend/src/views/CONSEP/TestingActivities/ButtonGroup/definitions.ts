export type ButtonObjType = {
  id: string
  kind: string
  size: string
  icon: any
  text: string
  action?: () => void
  disabled?: boolean
};
