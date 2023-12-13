/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { Column, Row, ActionableNotification } from '@carbon/react';

import { UploadWarnNotifProps } from './definitions';
import { MAX_VISIBLE_PT_NUMBERS, pageText } from './constants';

const UploadWarnNotification = (
  { invalidPTNumbers, setInvalidPTNumbers }: UploadWarnNotifProps
) => {
  const [subtitle, setSubtitle] = useState<JSX.Element | null>(null);
  const [hasEllipsis, setHasEllipsis] = useState(false);

  useEffect(() => {
    if (invalidPTNumbers.length > 0) {
      let subtitlePartTwo: JSX.Element | string = 'Invalid Parent tree numbers: ';
      if (invalidPTNumbers.length === 1) {
        subtitlePartTwo += `${invalidPTNumbers[0]}.`;
      } else if (invalidPTNumbers.length <= MAX_VISIBLE_PT_NUMBERS) {
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
        setHasEllipsis(true);
        const remainder = invalidPTNumbers.length - MAX_VISIBLE_PT_NUMBERS;
        for (let i = 0; i < MAX_VISIBLE_PT_NUMBERS; i++) {
          subtitlePartTwo += `${invalidPTNumbers[i]}, `;
        }

        const subtitlePartTwoText = `${subtitlePartTwo.slice(0, -2)} and ${remainder} more.`;

        subtitlePartTwo = (
          <span>
            {subtitlePartTwoText}
            <button type="button" onClick={() => setHasEllipsis((prev) => (!prev))}>
              {
                hasEllipsis
                  ? 'See all invalid parent tree numbers'
                  : 'See less invalid parent tree numbers'
              }
            </button>
          </span>
        );
      }

      setSubtitle(
        <span>
          {pageText.warnNotification.subtitlePartOne}
          <br />
          <br />
          {subtitlePartTwo}
        </span>
      );
    }
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
            subtitle={subtitle}
            onClose={() => setInvalidPTNumbers([])}
          />
        </Column>
      </Row>
    );
  }

  return null;
};

export default UploadWarnNotification;
