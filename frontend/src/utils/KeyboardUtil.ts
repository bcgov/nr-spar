import { KeyboardEvent } from 'react';

const blurOnEnter = (event: KeyboardEvent<HTMLElement>) => {
  if (event.key === 'Enter') {
    (event.target as HTMLInputElement).blur();
  }
};

export default blurOnEnter;
