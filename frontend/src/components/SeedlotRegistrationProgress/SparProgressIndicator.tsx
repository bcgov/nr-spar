import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  CheckmarkFilled,
  Warning,
  CircleDash,
  Incomplete,
} from '@carbon/icons-react';
import prefix from '../../styles/classPrefix';

const defaultTranslations: Record<string, string> = {
  'carbon.progress-step.complete': 'Complete',
  'carbon.progress-step.incomplete': 'Incomplete',
  'carbon.progress-step.current': 'Current',
  'carbon.progress-step.invalid': 'Invalid',
};

function translateWithId(messageId: string) {
  return defaultTranslations[messageId];
}

export interface SparProgressIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onChange'> {
  /**
   * Provide `<ProgressStep>` components to be rendered in the
   * `<ProgressIndicator>`
   */
  children?: React.ReactNode;

  /**
   * Provide an optional className to be applied to the containing node
   */
  className?: string;

  /**
   * Optionally specify the current step array index
   */
  currentIndex?: number;

  /**
   * Optional callback called if a ProgressStep is clicked on.  Returns the index of the step.
   */
  onChange?: (data: number) => void;

  /**
   * Specify whether the progress steps should be split equally in size in the div
   */
  spaceEqually?: boolean;
  /**
   * Determines whether or not the ProgressIndicator should be rendered vertically.
   */
  vertical?: boolean;
}

function SparProgressIndicator({
  children,
  className: customClassName,
  currentIndex: controlledIndex = 0,
  onChange,
  spaceEqually,
  vertical,
  ...rest
}: SparProgressIndicatorProps) {
  const [currentIndex, setCurrentIndex] = useState(controlledIndex);
  const [prevControlledIndex, setPrevControlledIndex] =
    useState(controlledIndex);
  const className = cx({
    [`${prefix}--progress`]: true,
    [`${prefix}--progress--vertical`]: vertical,
    [`${prefix}--progress--space-equal`]: spaceEqually && !vertical,
    [customClassName ?? '']: customClassName,
  });

  if (controlledIndex !== prevControlledIndex) {
    setCurrentIndex(controlledIndex);
    setPrevControlledIndex(controlledIndex);
  }

  return (
    <ul className={className} {...rest}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement<SparProgressStepProps>(child)) {
          return null;
        }

        // only setup click handlers if onChange event is passed
        const onClick = onChange ? () => onChange(index) : undefined;
        if (index === currentIndex) {
          return React.cloneElement(child, {
            complete: child.props.complete,
            current: child.props.complete ? false : true,
            index,
            onClick,
          });
        }
        if (index < currentIndex) {
          return React.cloneElement(child, {
            complete: true,
            index,
            onClick,
          });
        }
        if (index > currentIndex) {
          return React.cloneElement(child, {
            complete: child.props.complete || false,
            index,
            onClick,
          });
        }
        return null;
      })}
    </ul>
  );
}

SparProgressIndicator.propTypes = {
  /**
   * Provide `<ProgressStep>` components to be rendered in the
   * `<ProgressIndicator>`
   */
  children: PropTypes.node,

  /**
   * Provide an optional className to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Optionally specify the current step array index
   */
  currentIndex: PropTypes.number,

  /**
   * Optional callback called if a ProgressStep is clicked on.  Returns the index of the step.
   */
  onChange: PropTypes.func,

  /**
   * Specify whether the progress steps should be split equally in size in the div
   */
  spaceEqually: PropTypes.bool,
  /**
   * Determines whether or not the ProgressIndicator should be rendered vertically.
   */
  vertical: PropTypes.bool,
};

export interface SparProgressStepProps {
  /**
   * Provide an optional className to be applied to the containing `<li>` node
   */
  className?: string;

  /**
   * Specify whether the step has been completed
   */
  complete?: boolean;

  /**
   * Specify whether the step is the current step
   */
  current?: boolean;

  /**
   * Provide a description for the `<ProgressStep>`
   */
  description?: string;

  /**
   * Specify whether the step is disabled
   */
  disabled?: boolean;

  /**
   * Index of the current step within the ProgressIndicator
   */
  index?: number;

  /**
   * Specify whether the step is invalid
   */
  invalid?: boolean;

  /**
   * Provide the label for the `<ProgressStep>`
   */
  label: string;

  /**
   * A callback called if the step is clicked or the enter key is pressed
   */
  onClick?: (
    event:
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => void;

  /**
   * Provide the props that describe a progress step tooltip
   */
  overflowTooltipProps?: object;

  /**
   * Provide an optional secondary label
   */
  secondaryLabel?: string;

  /**
   * The ID of the tooltip content.
   */
  tooltipId?: string;

  /**
   * Optional method that takes in a message id and returns an
   * internationalized string.
   */
  translateWithId?: (id: string) => string;
}

function SparProgressStep({
  label,
  description,
  className,
  current,
  complete,
  invalid,
  secondaryLabel,
  disabled,
  onClick,
  translateWithId: t = translateWithId,
  ...rest
}: SparProgressStepProps) {
  const classes = cx({
    [`${prefix}--progress-step`]: true,
    [`${prefix}--progress-step--current`]: current,
    [`${prefix}--progress-step--complete`]: complete,
    [`${prefix}--progress-step--incomplete`]: !complete && !current,
    [`${prefix}--progress-step--disabled`]: disabled,
    [className ?? '']: className,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === 'Space') && onClick) {
      onClick(e);
    }
  };

  interface SVGIconProps {
    complete?: boolean;
    current?: boolean;
    description?: string;
    invalid?: boolean;
    prefix: string;
  }

  const SVGIcon = ({
    complete,
    current,
    description,
    invalid,
    prefix,
  }: SVGIconProps) => {
    if (invalid) {
      return (
        <Warning className={`${prefix}--progress__warning`}>
          <title>{description}</title>
        </Warning>
      );
    }
    if (current) {
      return (
        <Incomplete>
          <title>{description}</title>
        </Incomplete>
      );
    }
    if (complete) {
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

  let message = t('carbon.progress-step.incomplete');

  if (current) {
    message = t('carbon.progress-step.current');
  }

  if (complete) {
    message = t('carbon.progress-step.complete');
  }

  if (invalid) {
    message = t('carbon.progress-step.invalid');
  }

  return (
    <li className={classes}>
      <button
        type="button"
        className={cx(`${prefix}--progress-step-button`, {
          [`${prefix}--progress-step-button--unclickable`]: !onClick || current,
        })}
        disabled={disabled}
        aria-disabled={disabled}
        tabIndex={!current && onClick && !disabled ? 0 : -1}
        onClick={!current ? onClick : undefined}
        onKeyDown={handleKeyDown}
        title={label}
        {...rest}>
        <SVGIcon
          complete={complete}
          current={current}
          description={description}
          invalid={invalid}
          prefix={prefix}
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
}

SparProgressStep.propTypes = {
  /**
   * Provide an optional className to be applied to the containing `<li>` node
   */
  className: PropTypes.string,

  /**
   * Specify whether the step has been completed
   */
  complete: PropTypes.bool,

  /**
   * Specify whether the step is the current step
   */
  current: PropTypes.bool,

  /**
   * Provide a description for the `<ProgressStep>`
   */
  description: PropTypes.string,

  /**
   * Specify whether the step is disabled
   */
  disabled: PropTypes.bool,

  /**
   * Index of the current step within the ProgressIndicator
   */
  index: PropTypes.number,

  /**
   * Specify whether the step is invalid
   */
  invalid: PropTypes.bool,

  /**
   * Provide the label for the `<ProgressStep>`
   */
  label: PropTypes.node.isRequired,

  /**
   * A callback called if the step is clicked or the enter key is pressed
   */
  onClick: PropTypes.func,

  /**
   * Provide the props that describe a progress step tooltip
   */
  overflowTooltipProps: PropTypes.object,

  /**
   * Provide an optional secondary label
   */
  secondaryLabel: PropTypes.string,

  /**
   * The ID of the tooltip content.
   */
  tooltipId: PropTypes.string,

  /**
   * Optional method that takes in a message id and returns an
   * internationalized string.
   */
  translateWithId: PropTypes.func,
};

export { SparProgressIndicator, SparProgressStep };
