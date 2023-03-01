import React from 'react';

import {
  Button,
  OverflowMenu,
  OverflowMenuItem
} from '@carbon/react';
import { CaretDown } from '@carbon/icons-react';

import './styles.scss';

interface ComboButtonOptions {
  text: string,
  onClickFunction: Function
}

interface ComboButtonProps {
  title: string,
  items: ComboButtonOptions[]
}

const ComboButton = ({ title, items }: ComboButtonProps) => (
  <div className="combo-button-wrapper">
    <Button className="combo-button" size="md">
      {title}
    </Button>
    <OverflowMenu className="combo-options" renderIcon={CaretDown} ariaLabel={`${title} button options`} flipped>
      {items.map((item) => (
        <OverflowMenuItem key={item.text} itemText={item.text} onClick={item.onClickFunction} />
      ))}
    </OverflowMenu>
  </div>
);

export default ComboButton;
