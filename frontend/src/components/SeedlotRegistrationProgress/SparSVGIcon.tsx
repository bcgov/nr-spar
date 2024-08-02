import React from 'react';
import {
  CheckmarkFilled,
  Warning,
  CircleDash,
  Incomplete,
  CircleFilled
} from '@carbon/icons-react';

export interface SparSVGIconProps {
  complete?: boolean;
  current?: boolean;
  description?: string;
  invalid?: boolean;
  svgPrefix: string;
}

const SparSVGIcon = ({
  complete,
  current,
  description,
  invalid,
  svgPrefix
}: SparSVGIconProps): JSX.Element => {
  if (invalid) {
    return (
      <Warning className={`${svgPrefix}--progress__warning`}>
        <title>{description}</title>
      </Warning>
    );
  }
  if (current && !complete) {
    return (
      <Incomplete>
        <title>{description}</title>
      </Incomplete>
    );
  }
  if (current && complete) {
    return (
      <CircleFilled>
        <title>{description}</title>
      </CircleFilled>
    );
  }
  if (complete && !current) {
    return (
      <CheckmarkFilled>
        <title>{description}</title>
      </CheckmarkFilled>
    );
  }
  return (
    <CircleDash>
      <title>{description}</title>
    </CircleDash>
  );
};

export { SparSVGIcon };
