import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@carbon/react';
import {
  HeaderObj, RowItem, NotifCtrlType, GeneticWorthDictType,
  InfoSectionConfigType, FileConfigType
} from './definitions';

export const DEFAULT_PAGE_SIZE = 40;

export const DEFAULT_MIX_PAGE_SIZE = 20;

export const DEFAULT_MIX_PAGE_ROWS = 20;

export const DEFAULT_PAGE_NUMBER = 1;

export const EMPTY_NUMBER_STRING = '';

export const VOLUME_MIN = 0;

export const VOLUME_MAX = 999999;

export const NON_ORCHARD_CONTAM_MIN = 0;

export const NON_ORCHARD_CONTAM_MAX = 100;

export const SMP_SUCCESS_PERC_MIN = 1;

export const SMP_SUCCESS_PERC_MAX = 25;

export const SMP_SUCCESS_PERC_MAX_PW = 100;

export const POLLEN_COUNT_MIN = '0';

export const POLLEN_COUNT_MAX = '9999999999.9999999999';

export const CONE_COUNT_MIN = '0';

export const CONE_COUNT_MAX = '9999999999.9999999999';

export const MAX_DECIMAL_DIGITS = 10;

export const MAX_VISIBLE_PT_NUMBERS = 10;

export const getDownloadUrl = (tabType: string) => {
  if (tabType === 'Calculation of SMP mix' || tabType === 'mixTab') {
    return '/downloads/SMP_Mix_Volume_template.csv';
  }
  return '/downloads/Seedlot_composition_template.csv';
};

const getTabDescription = (tabType: string) => (
  <>
    {
      `Enter the ${tabType} manually or upload a spreadsheet file with the template for the ${tabType} table. `
      + 'Remember to keep your orchard updated, you can '
    }
    <Link to="#TODO-orchard-management-link">go to orchard&apos;s management page</Link>
    &nbsp;to edit the listed parent trees in your orchard.
  </>
);

const getNotificationSubtitle = (tabType: string) => {
  let downloadName = 'seedlot composition';
  if (tabType === 'Calculation of SMP mix') {
    // make the first char lowercase
    downloadName = tabType.charAt(0).toLowerCase() + tabType.slice(1);
  }
  return (
    <>
      {
        `You can import one spreadsheet file for the ${tabType} table with the data you want to use. `
      }
      <br />
      {
        'For further guidance on how to organize the data, '
        + "do use the SPAR's spreadsheet template. "
      }
      <Link
        className="notification-link"
        to={getDownloadUrl(tabType)}
        target="_blank"
        download
      >
        {`Download ${downloadName} template`}
      </Link>
    </>
  );
};

const errorDescription = (
  <>
    To see your orchard&apos;s composition, you must first fill the
    orchard id field in the previous step, “Orchard”.
    <br />
    Please, fill the orchard ID to complete the cone and pollen table.
  </>
);

const getCleanTableDesc = (tableName: string) => (
  `Are you sure you want to clean all the data from the ${tableName} table?`
);

const getPageText = () => ({
  notificationTitle: 'Upload spreadsheet to table',
  errorNotifTitle: 'No orchard ID linked yet!',
  errorDescription,
  coneTab: {
    tabTitle: 'Cone and pollen count',
    tabDescription: getTabDescription('Cone and pollen count'),
    notificationSubtitle: getNotificationSubtitle('Cone and pollen count'),
    tableDescription: "Enter the estimative of Cone and pollen count for the orchard's seedlot (*required)",
    toggleName: 'Show breeding value',
    cleanModalHeading: getCleanTableDesc('Cone and pollen count')
  },
  successTab: {
    tabTitle: 'SMP success on parent',
    tabDescription: getTabDescription('SMP success on parent'),
    notificationSubtitle: getNotificationSubtitle('SMP success on parent'),
    tableDescription: "Enter the estimative of SMP success for the orchard's seedlot",
    toggleName: 'Show SMP mix used on parent',
    cleanModalHeading: getCleanTableDesc('SMP success on parent'),
    defaultCheckBoxDesc: 'Enter the same SMP success on parent or Non-orchard pollen contaminant to all parent trees',
    smpInputLabel: 'SMP Success on parent (%)',
    pollenCotamInputLabel: 'Non-orchard pollen contaminant (%)'
  },
  mixTab: {
    tabTitle: 'Calculation of SMP mix',
    tabDescription: getTabDescription('Calculation of SMP mix'),
    notificationSubtitle: getNotificationSubtitle('Calculation of SMP mix'),
    tableDescription: 'Enter the estimative volume of SMP mix used for each clone',
    toggleName: 'Show breeding value',
    toggleNameBottom: 'Show weighted value',
    cleanModalHeading: getCleanTableDesc('Calculation of SMP mix')
  },
  popSizeAndDiverse: {
    title: 'Effective population size and diversity',
    description: 'Check effective population size and diversity of your seedlot'
  },
  gwAndTestedPerc: {
    title: 'Genetic worth and percent of tested parent trees',
    description: 'Check the genetic worth and percent of tested parent trees of your seedlot'
  },
  cleanModal: {
    label: 'Clean table data',
    primaryButtonText: 'Clean table data',
    secondaryButtonText: 'Cancel'
  },
  emptySection: {
    title: 'Nothing to show yet!'
  },
  invalidPTNumberMsg: 'One or more of the parent tree numbers entered are invalid because these numbers might not exist within your orchard composition.',
  errNotifEndMsg: 'Please review your entries and remember to check all pages.',
  warnNotification: {
    title: 'Invalid parent tree number detected',
    subtitlePartOne: 'The uploaded file contains one or more parent tree numbers that are not part of your orchard composition. '
      + 'As a result, the corresponding information for that parent tree number has not been added to the table. '
      + 'Please ensure that the parent tree numbers in your uploaded file match the ones present in your orchard composition.'
  }
});

export const pageText = getPageText();

export const notificationCtrlObj: NotifCtrlType = {
  coneTab: {
    showInfo: true,
    showError: true
  },
  successTab: {
    showInfo: true,
    showError: true
  },
  mixTab: {
    showInfo: true,
    showError: true
  }
};

export const geneticWorthDict: GeneticWorthDictType = {
  CW: ['ad', 'dfu', 'gvo', 'wdu'],
  PLI: ['dfs', 'dsc', 'dsg', 'gvo'],
  FDC: ['dfw', 'gvo', 'wwd'],
  PW: ['dsb'],
  DR: ['gvo'],
  EP: ['gvo'],
  FDI: ['gvo'],
  HW: ['gvo'],
  LW: ['gvo'],
  PY: ['gvo'],
  SS: ['gvo', 'iws'],
  SX: ['gvo', 'iws']
};

export const rowTemplate: RowItem = {
  rowId: '',
  parentTreeNumber: {
    id: '',
    isInvalid: false,
    value: ''
  },
  coneCount: {
    id: '',
    isInvalid: false,
    value: ''
  },
  pollenCount: {
    id: '',
    isInvalid: false,
    value: ''
  },
  smpSuccessPerc: {
    id: '',
    isInvalid: false,
    value: ''
  },
  nonOrchardPollenContam: {
    id: '',
    isInvalid: false,
    value: ''
  },
  volume: {
    id: '',
    isInvalid: false,
    value: ''
  },
  proportion: {
    id: '',
    isInvalid: false,
    value: ''
  },
  ad: {
    id: '',
    isInvalid: false,
    value: ''
  },
  dfs: {
    id: '',
    isInvalid: false,
    value: ''
  },
  dfu: {
    id: '',
    isInvalid: false,
    value: ''
  },
  dfw: {
    id: '',
    isInvalid: false,
    value: ''
  },
  dsb: {
    id: '',
    isInvalid: false,
    value: ''
  },
  dsc: {
    id: '',
    isInvalid: false,
    value: ''
  },
  dsg: {
    id: '',
    isInvalid: false,
    value: ''
  },
  gvo: {
    id: '',
    isInvalid: false,
    value: ''
  },
  iws: {
    id: '',
    isInvalid: false,
    value: ''
  },
  wdu: {
    id: '',
    isInvalid: false,
    value: ''
  },
  wwd: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_ad: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_dfs: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_dfu: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_dfw: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_dsb: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_dsc: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_dsg: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_gvo: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_iws: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_wdu: {
    id: '',
    isInvalid: false,
    value: ''
  },
  w_wwd: {
    id: '',
    isInvalid: false,
    value: ''
  },
  meanDegLat: {
    id: '',
    isInvalid: false,
    value: ''
  },
  meanMinLat: {
    id: '',
    isInvalid: false,
    value: ''
  },
  meanDegLong: {
    id: '',
    isInvalid: false,
    value: ''
  },
  meanMinLong: {
    id: '',
    isInvalid: false,
    value: ''
  },
  meanElevation: {
    id: '',
    isInvalid: false,
    value: ''
  },
  isMixTab: false
};

export const headerTemplate: Array<HeaderObj> = [
  {
    id: 'parentTreeNumber',
    name: 'Parent Tree Number',
    description: 'Parent Tree Number',
    enabled: true,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'coneCount',
    name: 'Cone count',
    description: 'Cone count',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: ['coneTab']
  },
  {
    id: 'pollenCount',
    name: 'Pollen count',
    description: 'Pollen count',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: ['coneTab']
  },
  {
    id: 'smpSuccessPerc',
    name: 'SMP success on parent (%)',
    description: 'SMP success on parent (%)',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'nonOrchardPollenContam',
    name: 'Non-orchard pollen contam. (%)',
    description: 'Non-orchard pollen contam. (%)',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'volume',
    name: 'Volume (ml)',
    description: 'Volume (ml)',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'proportion',
    name: 'Proportion',
    description: 'Proportion',
    enabled: true,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'ad',
    name: 'Deer browse (AD)',
    description: 'Animal browse resistance (deer)',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dfs',
    name: 'Dothistroma needle blight (DFS)',
    description: 'Disease resistance for Dothistroma needle blight',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dfu',
    name: 'Cedar leaf blight (DFU)',
    description: 'Disease resistance for Redcedar leaf blight',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dfw',
    name: 'Swiss needle cast (DFW)',
    description: 'Disease resistance for Swiss needle cast',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dsb',
    name: 'White pine blister rust (DSB)',
    description: 'Disease resistance for white pine blister rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dsc',
    name: 'Comandra blister rust (DSC)',
    description: 'Disease resistance for Commandra blister rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dsg',
    name: 'Western gall rust (DSG)',
    description: 'Disease resistance Western gall rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'gvo',
    name: 'Volume growth (GVO)',
    description: 'Volume growth',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'iws',
    name: 'White pine terminal weevil (IWS)',
    description: 'Spruce terminal weevil',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'wdu',
    name: 'Durability (WDU)',
    description: 'Wood durability',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'wwd',
    name: 'Wood density (WWD)',
    description: 'Wood quality',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'w_ad',
    name: 'Weighted AD',
    description: 'Weighted animal browse resistance (deer)',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_dfs',
    name: 'Weighted DFS',
    description: 'Weighted Disease resistance for Dothistroma needle blight',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_dfu',
    name: 'Weighted DFU',
    description: 'Weighted Disease resistance for Redcedar leaf blight',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_dfw',
    name: 'Weighted DFW',
    description: 'Weighted Disease resistance for Swiss needle cast',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_dsb',
    name: 'Weighted DSB',
    description: 'Weighted Disease resistance for white pine blister rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_dsc',
    name: 'Weighted DSC',
    description: 'Weighted Disease resistance for Commandra blister rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_dsg',
    name: 'Weighted DSG',
    description: 'Weighted Disease resistance Western gall rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_gvo',
    name: 'Weighted GVO',
    description: 'Weighted Volume growth',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_iws',
    name: 'Weighted IWS',
    description: 'Weighted Spruce terminal weevil',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_wdu',
    name: 'Weighted WDU',
    description: 'Weighted Wood durability',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'w_wwd',
    name: 'Weighted WWD',
    description: 'Weighted Wood quality',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'meanDegLat',
    name: 'Mean degrees latitude',
    description: 'Mean degrees latitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanMinLat',
    name: 'Mean minutes latitude',
    description: 'Mean minutes latitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanDegLong',
    name: 'Mean degrees longitude',
    description: 'Mean degrees longitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanMinLong',
    name: 'Mean minutes longitude',
    description: 'Mean minutes longitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanElevation',
    name: 'Mean elevation',
    description: 'Mean elevation',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'actions',
    name: 'Actions',
    description: 'Actions',
    enabled: true,
    editable: false,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  }
];

export const PageSizesConfig = [
  20, 40, 60, 80, 100
];

export const SummarySectionConfig = {
  coneTab: {
    title: 'Summary',
    description: 'Check the parent tree contribution summary',
    infoItems: {
      totalCone: {
        name: 'Total number of cone count',
        value: EMPTY_NUMBER_STRING
      },
      totalPollen: {
        name: 'Total number of pollen count',
        value: EMPTY_NUMBER_STRING
      }
    }
  },
  successTab: {
    title: 'Summary',
    description: 'Check the SMP success on parent summary',
    infoItems: {
      avgSMPSuccess: {
        name: 'Average number of SMP success %',
        value: EMPTY_NUMBER_STRING
      },
      avgNonOrchardContam: {
        name: 'Average number of non-orchard pollen contam. (%)',
        value: EMPTY_NUMBER_STRING
      }
    }
  },
  mixTab: {
    title: 'Breeding value SMP mix used',
    description: 'Check the breeding value of SMP mix used on parent',
    infoItems: {
      parentsOutside: {
        name: 'Number of SMP parents from outside',
        value: EMPTY_NUMBER_STRING
      },
      totalVolume: {
        name: 'Total volume (ml)',
        value: EMPTY_NUMBER_STRING
      }
    }
  },
  sharedItems: {
    totalParentTree: {
      name: 'Total number of parent trees',
      value: EMPTY_NUMBER_STRING
    }
  }
};

export const PopSizeAndDiversityConfig: InfoSectionConfigType = {
  ne: {
    name: 'Effective population size (Ne)',
    value: EMPTY_NUMBER_STRING
  },
  coancestry: {
    name: 'Coancestry (Sum PiPj * Cij)',
    value: EMPTY_NUMBER_STRING
  },
  outsideSMPParent: {
    name: 'Number of SMP parents from outside',
    value: EMPTY_NUMBER_STRING
  }
};

export const fileConfigTemplate: FileConfigType = {
  file: null,
  fileName: '',
  fileAdded: false,
  uploaderStatus: 'edit',
  errorSub: '',
  errorMessage: '',
  invalidFile: true
};

export const getEmptySectionDescription = (setStep: Function) => (
  <span>
    To see your orchard&apos;s composition, you must first fill
    <br />
    the orchard id field in the previous step,&nbsp;&quot;
    <Button className="empty-section-button" kind="ghost" onClick={() => setStep(-1)}>Orchard</Button>
    &quot;.
    <br />
    Please, fill the orchard ID to complete the cone and pollen table.
  </span>
);
