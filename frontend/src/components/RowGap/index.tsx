import React from 'react';
import { Row } from '@carbon/react';

import './styles.scss';

type GapSize = 1 | 2 | 3 | 4;

type props = {
  gapSize?: GapSize;
}

/**
 * A grey row gap.
 */
const RowGap = ({ gapSize }: props) => {
  const defaultClass = 'row-gap';
  let sizeClass = '';
  if (gapSize) {
    sizeClass = `gap-${gapSize}`;
  } else {
    sizeClass = 'gap-1';
  }

  return (<Row className={`${defaultClass} ${sizeClass}`} />);
};

export default RowGap;
