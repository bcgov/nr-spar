import React, { useState, useEffect } from 'react';
import { Column, Row, ActionableNotification } from '@carbon/react';

import { InputErrorNotifProps, RowItem, StrTypeRowItem } from './definitions';
import { pageText } from './constants';

const InputErrorNotification = (
  { state, headerConfig }: InputErrorNotifProps
) => {
  const [hasError, setHasError] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState<string | JSX.Element | null>(null);

  useEffect(() => {
    const getHeaderName = (field: keyof StrTypeRowItem): string => {
      let name = headerConfig.filter((header) => header.id === field)[0].name.toLowerCase();
      if (name.startsWith('smp')) {
        name = name.substring(0, 3).toUpperCase() + name.substring(3);
      }
      return name;
    };

    const generateTitle = (
      invalidFields: (keyof StrTypeRowItem)[]
    ): string => {
      const prefix = 'Invalid ';
      const suffix = ' entries';
      let generatedTitle = '';
      if (invalidFields.length === 1) {
        generatedTitle = `${prefix}${getHeaderName(invalidFields[0])}${suffix}`;
      } else {
        generatedTitle += prefix;
        const numOfFields = invalidFields.length;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < numOfFields; i++) {
          if (i === numOfFields - 1) {
            // Get rid of the comma.
            generatedTitle = generatedTitle.slice(0, -2);
            generatedTitle += ` and ${getHeaderName(invalidFields[i])}`;
          } else {
            generatedTitle += `${getHeaderName(invalidFields[i])}, `;
          }
        }
        generatedTitle += suffix;
      }
      return generatedTitle;
    };

    const generateSubTitle = (
      invalidFields: (keyof StrTypeRowItem)[]
    ): string | JSX.Element => {
      let generatedSubTitle: string | JSX.Element = '';
      const prefix = 'One or more of the ';
      const suffix = ' values are invalid.';

      if (invalidFields.length === 1) {
        if (invalidFields[0] === 'parentTreeNumber') {
          generatedSubTitle = pageText.invalidPTNumberMsg;
        } else {
          generatedSubTitle = `${prefix}${getHeaderName(invalidFields[0])}${suffix}`;
        }
      } else {
        // Generate bullet points;
        generatedSubTitle = (
          <ul>
            {
              invalidFields.map((field) => (
                <li key={field}>
                  {
                    field === 'parentTreeNumber'
                      ? pageText.invalidPTNumberMsg
                      : `${prefix}${getHeaderName(field)}${suffix}`
                  }
                </li>
              ))
            }
          </ul>
        );
      }

      return (
        <span>
          {generatedSubTitle}
          <br />
          <br />
          {pageText.errNotifEndMsg}
        </span>
      );
    };

    let hasErrorInTabs = false;

    const invalidDataFields: (keyof StrTypeRowItem)[] = [];

    // Check errors in both tabs.
    const compTabsData = Object.values(state.tableRowData);
    const mixTabsData = Object.values(state.mixTabData);

    const allData = compTabsData.concat(mixTabsData);

    if (allData.length > 0) {
      const rowKeys = Object.keys(allData[0]) as (keyof RowItem)[];

      allData.forEach((row) => {
        rowKeys.forEach((key) => {
          if (row[key] && key !== 'rowId' && key !== 'isMixTab') {
            if (row[key].isInvalid && !invalidDataFields.includes(key)) {
              invalidDataFields.push(key);
              hasErrorInTabs = true;
            }
          }
        });
      });
    }

    setHasError(hasErrorInTabs);
    if (hasErrorInTabs) {
      setTitle(generateTitle(invalidDataFields));
      setSubtitle(generateSubTitle(invalidDataFields));
    }
  }, [state]);

  if (hasError) {
    return (
      <Row className="notification-row">
        <Column>
          <ActionableNotification
            kind="error"
            lowContrast
            actionButtonLabel=""
            hideCloseButton
            title={title}
            subtitle={subtitle}
            hasFocus={false}
          />
        </Column>
      </Row>
    );
  }

  return null;
};

export default InputErrorNotification;
