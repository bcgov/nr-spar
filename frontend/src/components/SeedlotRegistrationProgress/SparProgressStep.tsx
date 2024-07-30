import React from 'react';
import prefix from '../../styles/classPrefix';
import { SparSVGIcon } from './SparSVGIcon';

export interface SparProgressStepProps {
  className?: string;
  complete?: boolean;
  current?: boolean;
  description?: string;
  disabled?: boolean;
  invalid?: boolean;
  label: string;
  onClick?: (
    event:
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => void;
  secondaryLabel?: string;
}

/**
 * Create a custom progress step.
 *
 * @param {SparProgressStepProps} props parameters of the component.
 * @returns {JSX.Element} custom element
 */
const SparProgressStep = ({
  className,
  complete,
  current,
  description,
  disabled,
  invalid,
  label,
  onClick,
  secondaryLabel
}: SparProgressStepProps): JSX.Element => {
  const getClassName = (): string => {
    const classNames: Array<string> = [`${prefix}--progress-step`];
    classNames.push(current ? `${prefix}--progress-step--current` : '');
    classNames.push(complete ? `${prefix}--progress-step--complete` : '');
    classNames.push(!complete && !current ? `${prefix}--progress-step--incomplete` : '');
    classNames.push(disabled ? `${prefix}--progress-step--disabled` : '');
    if (className) {
      classNames.push(className);
    }
    return classNames.join(' ');
  };

  const getButtonClassName = (): string => {
    const classNames: Array<string> = [`${prefix}--progress-step-button`];
    classNames.push(!onClick || current ? `${prefix}--progress-step-button--unclickable` : '');
    return classNames.join(' ');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === 'Space') && onClick) {
      onClick(e);
    }
  };

  let message = 'Incomplete';

  if (current) {
    message = 'Current';
  }

  if (complete) {
    message = 'Complete';
  }

  if (invalid) {
    message = 'Invalid';
  }

  return (
    <li className={getClassName()}>
      <button
        type="button"
        className={getButtonClassName()}
        disabled={disabled}
        aria-disabled={disabled}
        tabIndex={!current && onClick && !disabled ? 0 : -1}
        onClick={!current ? onClick : undefined}
        onKeyDown={handleKeyDown}
        title={label}
      >
        <SparSVGIcon
          complete={complete}
          current={current}
          description={description}
          invalid={invalid}
          svgPrefix={prefix}
        />
        <div className={`${prefix}--progress-text`}>
          <p className={`${prefix}--progress-label`}>
            {label}
          </p>

          {secondaryLabel !== null && secondaryLabel !== undefined ? (
            <p className={`${prefix}--progress-optional`}>
              {secondaryLabel}
            </p>
          ) : null}
        </div>
        <span className={`${prefix}--assistive-text`}>{message}</span>
        <span className={`${prefix}--progress-line`} />
      </button>
    </li>
  );
};

export { SparProgressStep };
