import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { ProgressIndicatorConfig, StepMap } from './definitions';

export const initialProgressConfig: ProgressIndicatorConfig = {
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

export const tscAgencyObj: MultiOptionsObj = {
  code: '00012797',
  label: 'Tree Seed Centre',
  description: '00012797 - Tree Seed Centre - MOF'
};

export const tscLocationCode = '00';
