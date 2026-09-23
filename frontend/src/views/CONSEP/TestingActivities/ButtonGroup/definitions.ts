import React from 'react';

export type ButtonObjType = {
  id: string
  kind: string
  size: string
  icon: React.JSX.Element
  text: string
  action?: () => void
  disabled?: boolean
};
