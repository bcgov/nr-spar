/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import {
  Button, Column, Row, ActionableNotification
} from '@carbon/react';

import { UploadWarnNotifProps } from './definitions';
import { MAX_VISIBLE_PT_NUMBERS, pageText } from './constants';

const UploadWarnNotification = (
  { invalidPTNumbers, setInvalidPTNumbers }: UploadWarnNotifProps
) => {
  const [subtitle, setSubtitle] = useState<JSX.Element | string>('');
  const [showLess, setShowLess] = useState(true);

  const configSubtitle = () => {
    if (invalidPTNumbers.length > 0) {
      let subtitlePartTwo: JSX.Element | string = 'Invalid Parent tree numbers: ';
      if (invalidPTNumbers.length === 1) {
        subtitlePartTwo += `${invalidPTNumbers[0]}.`;
      } else if (invalidPTNumbers.length <= MAX_VISIBLE_PT_NUMBERS || !showLess) {
        for (let i = 0; i < invalidPTNumbers.length; i++) {
          if (i === invalidPTNumbers.length - 1) {
            // Get rid of the comma.
            subtitlePartTwo = subtitlePartTwo.slice(0, -2);
            subtitlePartTwo += ` and ${invalidPTNumbers[i]}`;
          } else {
            subtitlePartTwo += `${invalidPTNumbers[i]}, `;
          }
        }
        subtitlePartTwo += '.';
      } else {
        const remainder = invalidPTNumbers.length - MAX_VISIBLE_PT_NUMBERS;
        for (let i = 0; i < MAX_VISIBLE_PT_NUMBERS; i++) {
          subtitlePartTwo += `${invalidPTNumbers[i]}, `;
        }
        subtitlePartTwo = `${subtitlePartTwo.slice(0, -2)} and ${remainder} more. `;
      }
      setSubtitle(subtitlePartTwo);
    }
  };

  const toggleEllipisis = () => setShowLess((prev) => !prev);

  useEffect(() => {
    configSubtitle();
  }, [invalidPTNumbers, showLess]);

  useEffect(() => {
    setShowLess(true);
  }, [invalidPTNumbers]);

  if (invalidPTNumbers.length > 0) {
    return (
      <Row className="notification-row">
        <Column>
          <ActionableNotification
            kind="warning"
            lowContrast
            actionButtonLabel=""
            title={pageText.warnNotification.title}
            subtitle={(
              <span>
                {pageText.warnNotification.subtitlePartOne}
                <br />
                <br />
                {subtitle}
                {
                  invalidPTNumbers.length > MAX_VISIBLE_PT_NUMBERS
                    ? (
                      <Button
                        className="ghost-button-underlined"
                        kind="ghost"
                        onClick={(e: React.ChangeEvent<HTMLButtonElement>) => {
                          toggleEllipisis();
                          // Without this blur,
                          // the page will keep focusing on the close button for some reason.
                          e.target.blur();
                        }}
                      >
                        {
                          showLess
                            ? 'See all invalid parent tree numbers'
                            : 'See less invalid parent tree numbers'
                        }
                      </Button>
                    )
                    : null
                }
              </span>
            )}
            onClose={() => setInvalidPTNumbers([])}
            hasFocus={false}
          />
        </Column>
      </Row>
    );
  }

  return null;
};

export default UploadWarnNotification;
