import React from 'react';

import { BClassProgressIndicatorConfig, BClassStepMap } from './definitions';

export { MAX_EDIT_BEFORE_SAVE } from '../ContextContainerClassA/constants';

export const initialProgressConfig: BClassProgressIndicatorConfig = {
  collection: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  ownership: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  interim: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  extraction: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  }
};

export const completeProgressConfig: BClassProgressIndicatorConfig = {
  collection: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  ownership: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  interim: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  extraction: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  }
};

export const stepMap: BClassStepMap = {
  0: 'collection',
  1: 'ownership',
  2: 'interim',
  3: 'extraction'
};

export const smartSaveText = {
  loading: 'Saving...',
  error: 'Save changes failed',
  idle: 'Save changes',
  reload: 'Reload form',
  success: 'Changes saved!',
  suggestion: 'Your recent changes could not be saved. Please try saving the form manually to keep all of your changes.',
  conflictTitle: 'Conflict detected',
  conflictSuggestion: (
    <div className="conflict-suggestion-div">
      Another user has updated this form. Please reload the page to view the latest information
      <br />
      <ul className="ul-disc">
        <li>Saving and submitting are temporarily disabled to prevent overwriting</li>
        <li>Reload the page to continue editing without losing further data</li>
        <li>Any unsaved changes will be lost</li>
      </ul>
    </div>
  )
};
