import React from 'react';

import {
  Button,
  OverflowMenu,
  OverflowMenuItem
} from '@carbon/react';
import { ChevronDown } from '@carbon/icons-react';

import './styles.scss';

interface ComboButtonOptions {
  text: string,
  onClickFunction: Function,
  disabled?: boolean
}

interface ComboButtonProps {
  title: string,
  titleBtnFunc: Function,
  items: ComboButtonOptions[],
  menuOptionsClass?: string,
}

const ComboButton = ({
  title,
  titleBtnFunc,
  items,
  menuOptionsClass
}: ComboButtonProps) => (
  <div className="combo-button-container">
    <Button
      className="combo-button"
      size="md"
      onClick={() => titleBtnFunc()}
    >
      {title}
    </Button>
    <OverflowMenu className="combo-options" menuOptionsClass={`${menuOptionsClass}`} renderIcon={ChevronDown} aria-label={`${title} button options`} flipped>
      {
        items.map((item) => (
          <OverflowMenuItem
            key={item.text}
            itemText={item.text}
            onClick={item.onClickFunction}
            disabled={item.disabled}
          />
        ))
      }
    </OverflowMenu>
  </div>
);

export default ComboButton;
