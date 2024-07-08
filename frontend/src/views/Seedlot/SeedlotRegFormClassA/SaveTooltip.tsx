import React, { useState, useEffect } from 'react';
import {
  Button,
  InlineLoading,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
  ToggletipActions
} from '@carbon/react';
import { Save, Reset } from '@carbon/icons-react';
import { DateTime } from 'luxon';

import { ONE_SECOND } from '../../../config/TimeUnits';

import { SaveTooltipProps } from '../ContextContainerClassA/definitions';
import { smartSaveText } from '../ContextContainerClassA/constants';

const SaveTooltipLabel = (
  {
    handleSaveBtn, saveStatus, saveDescription, mutationStatus, lastSaveTimestamp, reloadFormDraft
  }: SaveTooltipProps
) => {
  const getTimeDiffString = (timeStamp: string): string => DateTime.fromISO(timeStamp).diffNow('minutes').get('minutes').toFixed(0)
    .replace('-', '');

  const [lastSaveTimeDiff, setLastSaveTimeDiff] = useState<string>(
    () => getTimeDiffString(lastSaveTimestamp)
  );

  const [autsavePrompt, setAutosavePrompt] = useState<string>('');

  /**
   * Update time diff on interval;
   */
  useEffect(() => {
    // Update right away if lastSaveTimestamp is changed.
    setLastSaveTimeDiff(getTimeDiffString(lastSaveTimestamp));

    // Update the value on interval.
    const interval = setInterval(() => {
      setLastSaveTimeDiff(getTimeDiffString(lastSaveTimestamp));
    }, ONE_SECOND);

    return () => clearInterval(interval);
  }, [lastSaveTimestamp]);

  useEffect(() => {
    let prompt = `Saved ${lastSaveTimeDiff} min ago`;
    if (mutationStatus === 'loading') {
      prompt = smartSaveText.loading;
    }
    if (saveStatus === 'error') {
      prompt = smartSaveText.error;
    }
    if (saveStatus === 'conflict') {
      prompt = `Smartsave failed: ${smartSaveText.conflictTitle}`;
    }
    setAutosavePrompt(prompt);
  }, [lastSaveTimeDiff, lastSaveTimestamp, mutationStatus, saveStatus]);

  return (
    <Toggletip align="bottom" className="save-toggletip">
      <ToggletipButton className="save-toggletip-btn" label="autosave info">
        <p
          className={
            (saveStatus === 'conflict' || saveStatus === 'error')
              ? 'save-error-p'
              : undefined
          }
        >
          {autsavePrompt}
        </p>
      </ToggletipButton>
      <ToggletipContent className="save-toggletip-content">
        {
          saveStatus === 'conflict'
            ? (
              smartSaveText.conflictSuggestion
            )
            : (
              <>
                <p>
                  Changes you make are saved periodically.
                </p>
                <p>
                  Last save was
                  {' '}
                  {lastSaveTimeDiff}
                  {' '}
                  min ago, but you can also manually save the form.
                </p>
              </>
            )
        }

        <ToggletipActions>
          <Button
            className="save-toggletip-save-btn"
            kind="primary"
            size="sm"
            onClick={saveStatus === 'conflict' ? reloadFormDraft : handleSaveBtn}
            disabled={mutationStatus === 'loading'}
            renderIcon={saveStatus === 'conflict' ? Reset : Save}
          >
            <InlineLoading
              status={saveStatus === 'conflict' ? null : saveStatus}
              description={saveStatus === 'conflict' ? smartSaveText.reload : saveDescription}
            />
          </Button>
        </ToggletipActions>
      </ToggletipContent>
    </Toggletip>
  );
};

export default SaveTooltipLabel;
