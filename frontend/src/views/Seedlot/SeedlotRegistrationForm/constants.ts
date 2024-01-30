import { useParams } from 'react-router-dom';
import PathConstants from '../../../routes/pathConstants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { addParamToPath } from '../../../utils/PathUtils';
import { ProgressIndicatorConfig, StepMap } from './definitions';

export const MAX_EDIT_BEFORE_SAVE = 5;

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

export const smartSaveText = {
  loading: 'Saving...',
  error: 'Save changes failed',
  idle: 'Save changes',
  success: 'Changes saved!',
  suggestion: 'Your recent changes could not be saved. Please try saving the form manually to keep all of your changes.'
};

export const seedlotRegistrationBreadcrumbs = () => {
  const { seedlotNumber } = useParams();
  const breadcrumbData = [
    {
      name: 'Seedlots',
      path: `${PathConstants.SEEDLOTS}`
    },
    {
      name: 'My seedlots',
      path: `${PathConstants.MY_SEEDLOTS}`
    },
    {
      name: `Seedlot ${seedlotNumber}`,
      path: `${addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? '')}`
    }
  ];
  return breadcrumbData;
};
