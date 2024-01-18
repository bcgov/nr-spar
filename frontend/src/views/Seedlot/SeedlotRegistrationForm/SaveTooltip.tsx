import React, { useState, useEffect } from 'react';
import {
  Button,
  InlineLoading,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
  ToggletipActions
} from '@carbon/react';
import { Save } from '@carbon/icons-react';
import { DateTime } from 'luxon';

import { ONE_SECOND } from '../../../config/TimeUnits';

import { SaveTooltipProps } from './definitions';

const SaveTooltipLabel = (
  {
    handleSaveBtn, saveStatus, saveDescription, isSaving, lastSaveTimestamp
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
    if (isSaving) {
      prompt = 'Saving...';
    }
    if (saveStatus === 'error') {
      prompt = saveDescription;
    }
    setAutosavePrompt(prompt);
  }, [lastSaveTimeDiff, lastSaveTimestamp, isSaving, saveStatus]);

  return (
    <Toggletip align="bottom" className="save-toggletip">
      <ToggletipButton className="save-toggletip-btn" label="autosave info"><p>{autsavePrompt}</p></ToggletipButton>
      <ToggletipContent className="save-toggletip-content">
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
        <ToggletipActions>
          <Button
            className="save-toggletip-save-btn"
            kind="primary"
            size="sm"
            onClick={() => handleSaveBtn()}
            disabled={isSaving}
            renderIcon={Save}
          >
            <InlineLoading status={saveStatus} description={saveDescription} />
          </Button>
        </ToggletipActions>
      </ToggletipContent>
    </Toggletip>
  );
};

export default SaveTooltipLabel;
