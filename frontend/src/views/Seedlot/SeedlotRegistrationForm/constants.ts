import { ProgressIndicatorConfig, StepMap } from './definitions';

export const initialProgressConfig: ProgressIndicatorConfig = {
  collection: {
    isComplete: false,
    isCurrent: true,
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
  orchard: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  parent: {
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

export const stepMap: StepMap = {
  0: 'collection',
  1: 'ownership',
  2: 'interim',
  3: 'orchard',
  4: 'parent',
  5: 'extraction'
};
