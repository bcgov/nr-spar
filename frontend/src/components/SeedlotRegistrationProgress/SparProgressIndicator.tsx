import React, { useState } from 'react';
import prefix from '../../styles/classPrefix';
import { SparProgressStepProps } from './SparProgressStep';

export interface SparProgressIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onChange'> {
  children?: React.ReactNode;
  className?: string;
  currentIndex?: number;
  onChange?: (data: number) => void;
  spaceEqually?: boolean;
  vertical?: boolean;
}

/**
 * Create a progress bar modified with custom icons.
 *
 * @param {SparProgressIndicatorProps} param0 Progress bar indicator parameters.
 * @returns {JSX.Element} custom element
 */
function SparProgressIndicator({
  children,
  className: customClassName,
  currentIndex: controlledIndex = 0,
  onChange,
  spaceEqually,
  vertical
}: SparProgressIndicatorProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(controlledIndex);
  const [prevControlledIndex, setPrevControlledIndex] = useState(controlledIndex);

  const getClassName = (): string => {
    let classNames = `${prefix}--progress `;
    if (vertical) {
      classNames += `${prefix}--progress--vertical `;
    }
    if (spaceEqually && !vertical) {
      classNames += `${prefix}--progress--space-equal `;
    }
    if (customClassName) {
      classNames += customClassName;
    }
    return classNames;
  };

  if (controlledIndex !== prevControlledIndex) {
    setCurrentIndex(controlledIndex);
    setPrevControlledIndex(controlledIndex);
  }

  return (
    <ul className={getClassName()}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement<SparProgressStepProps>(child)) {
          return null;
        }

        // only setup click handlers if onChange event is passed
        const onClick = onChange ? () => onChange(index) : undefined;
        if (index === currentIndex) {
          return React.cloneElement(child, {
            complete: child.props.complete,
            current: child.props.complete,
            onClick
          });
        }
        if (index < currentIndex) {
          return React.cloneElement(child, {
            complete: true,
            onClick
          });
        }
        if (index > currentIndex) {
          return React.cloneElement(child, {
            complete: child.props.complete,
            onClick
          });
        }
        return null;
      })}
    </ul>
  );
}

export { SparProgressIndicator };
