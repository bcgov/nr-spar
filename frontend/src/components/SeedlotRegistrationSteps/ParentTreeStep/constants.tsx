import { SMPMixEntriesType } from '../../../types/SeedlotTypes/ParentTree';
import { TableHeaders, ParentTreesType, SMPSuccessFixedFiltersType } from './definitions';

export const DEFAULT_INITIAL_ROWS = 20;
export const PAGINATION_OPTIONS = [20, 40, 60, 80, 100];

export const pageTexts = {
  tabTitles: {
    coneTab: 'Cone and pollen count',
    smpTab: 'SMP success on parent',
    mixTab: 'Calculation of SMP mix'
  },
  sharedTabTexts: {
    notification: {
      title: 'Upload spreadsheet to table',
      actionButtonLabel: 'Close notification'
    },
    geneticWorth: {
      title: 'Genetic worth and diversity',
      subtitle: 'Check the genetic worth and diversity of your seedlot',
      defaultFieldsLabels: {
        populationSize: 'Effective population size (Ne)',
        testedParentTree: 'Tested parent tree contribution (%)',
        coancestry: 'Coancestry (Sum PiPj * Cij)',
        smpParents: 'Number of SMP parents from outside'
      }
    },
    modal: {
      title: 'Upload from file',
      label: 'Seedlot registration',
      description: 'Select the spreadsheet file for the cone and pollen count table with the data you want to import. The supported file format is .csv.',
      uploadFile: 'Click to upload or drag and drop the file here',
      uploadedFileErrorSize: 'File size exceeds limit',
      uploadedFileErrorType: 'Incorrect file format',
      uploadedFileErrorMessageSize: '500kb max file size. Select a new file and try again.',
      uploadedFileErrorMessageType: 'Only CSV files are supported. Select a new file and try again.',
      uploadedFileIconDesc: 'Delete file',
      notification: {
        title: 'Note:',
        description: 'When uploading a file all previously filled data within the table will be replaced'
      },
      buttons: {
        cancel: 'Cancel',
        confirm: 'Import file and continue'
      }
    },
    overflowMenus: {
      columnsOverflow: 'Show/Hide columns',
      breedingValues: 'Show breeding values',
      smpMixUsed: 'Show SMP mix used on parent',
      clonalValue: 'Show clonal value',
      weightedValue: 'Show weighted value',
      optionsOverflow: 'More options',
      downloadTable: 'Download table template',
      exportPdf: 'Export table as PDF file',
      cleanTable: 'Clean table data'
    },
    uploadButtonLabel: 'Upload from file',
    uploadButtonIconDesc: 'Upload file',
    tableInputPlaceholder: 'Add value',
    pagination: {
      previous: 'Previous page',
      next: 'Next page',
      pageNumber: 'Page Number'
    }
  },
  coneAndPollen: {
    subtitle: 'Enter the cone and pollen count manually or upload a spreadsheet file with the template for the cone and pollen count table. Remember to keep your orchard updated, you can go to orchard\'s management page to edit the listed parent trees in your orchard.',
    tableSubtitle: 'Enter the estimative of cone and pollen count for the orchard\'s seedlot (*required)',
    notification: {
      subtitle: 'You can import one spreadsheet file for the cone and pollen count table with the data you want to use. For further guidance on how to organize the data, do use the SPAR\'s spreadsheet template.',
      templateLink: 'Download cone and pollen count template'
    },
    summary: {
      title: 'Summary',
      subtitle: 'Check the parent tree contribution summary',
      fieldLabels: {
        totalParentTrees: 'Total number of parent trees',
        totalConeCount: 'Total number of cone count',
        totalPollenCount: 'Total number of pollen count',
        averageSMP: 'Average number of SMP success %'
      }
    }
  },
  smpSuccess: {
    subtitle: 'Enter the SMP success on parent manually or upload a spreadsheet file with the template for the cone and pollen count table. Remember to keep your orchard updated, you can go to orchard\'s management page to edit the listed parent trees in your orchard.',
    tableSubtitle: 'Enter the estimative of SMP success for the orchard\'s seedlot',
    notification: {
      subtitle: 'You can import one spreadsheet file for the SMP success on parent table with the data you want to use. For further guidance on how to organize the data, do use the SPAR\'s spreadsheet template.',
      templateLink: 'Download SMP success on parent template'
    },
    bulkCheckboxLabel: 'Enter the same SMP success on parent or Non-orchard pollen contaminant to all parent trees',
    bulkSuccessInputLabel: 'SMP Success on parent (%)',
    bulkNonOrchardInputLabel: 'Non-orchard pollen contaminant (%)',
    summary: {
      title: 'Summary',
      subtitle: 'Check the SMP success on parent summary',
      fieldLabels: {
        totalParentTrees: 'Total number of parent trees',
        averageSMPSuccess: 'Average number of SMP success %',
        averageNonOrchard: 'Average number of non-orchard pollen contam. (%)'
      }
    }
  },
  smpMix: {
    subtitle: 'Enter the calculation of SMP mix manually or upload a spreadsheet file with the template for the cone and pollen count table. Remember to keep your orchard updated, you can go to orchard\'s management page to edit the listed parent trees in your orchard.',
    tableSubtitle: 'Enter the estimative volume of SMP mix used for each clone',
    tableActions: 'Actions',
    addButtonDesc: 'Add row',
    deleteRow: 'Delete row',
    clonalHeader: '- Clonal value',
    weightedHeader: '- Weighted value',
    notification: {
      subtitle: 'You can import one spreadsheet file for calculation of SMP mix table with the data you want to use. For further guidance on how to organize the data, do use the SPAR\'s spreadsheet template.',
      templateLink: 'Download calculation of SMP mix template'
    },
    summary: {
      title: 'Breeding value SMP mix used',
      subtitle: 'Check the breeding value of SMP mix used on parent',
      fieldLabels: {
        smpParentTrees: 'Number of SMP parents from outside',
        totalVolume: 'Total volume (ml)'
      }
    }
  }
};

export const geneticTraits = {
  ad: {
    code: 'ad',
    description: 'Genetic worth AD',
    filterLabel: 'Deer browse (AD)'
  },
  dfs: {
    code: 'dfs',
    description: 'Genetic worth DFS',
    filterLabel: 'Dothistroma needle blight (DFS)'
  },
  dfu: {
    code: 'dfu',
    description: 'Genetic worth DFU',
    filterLabel: 'Cedar leaf blight (DFU)'
  },
  dfw: {
    code: 'dfw',
    description: 'Genetic worth DFW',
    filterLabel: 'Swiss needle cast (DFW)'
  },
  dsb: {
    code: 'dsb',
    description: 'Genetic worth DSB',
    filterLabel: 'White pine blister rust (DSB)'
  },
  dsc: {
    code: 'dsc',
    description: 'Genetic worth DSC',
    filterLabel: 'Comandra blister rust (DSC)'
  },
  dsg: {
    code: 'dsg',
    description: 'Genetic worth DSG',
    filterLabel: 'Western gall rust (DSG)'
  },
  gvo: {
    code: 'gvo',
    description: 'Genetic worth GVO',
    filterLabel: 'Volume growth (GVO)'
  },
  iws: {
    code: 'iws',
    description: 'Genetic worth IWS',
    filterLabel: 'White pine terminal weevil (IWS)'
  },
  wdu: {
    code: 'wdu',
    description: 'Genetic worth WDU',
    filterLabel: 'Durability (WDU)'
  },
  wwd: {
    code: 'wwd',
    description: 'Genetic worth WWD',
    filterLabel: 'Wood density (WWD)'
  },
  wve: {
    code: 'wve',
    description: 'Genetic worth WVE',
    filterLabel: 'Wood velocity measures (WVE)'
  }
};

export const coneAndPollenFixedHeaders:Array<TableHeaders> = [
  {
    key: '1',
    header: 'Clone number'
  },
  {
    key: '2',
    header: 'Cone count'
  },
  {
    key: '3',
    header: 'Pollen count'
  },
  {
    key: '4',
    header: 'SMP success (%)'
  }
];

export const smpSuccessFixedHeaders:Array<TableHeaders> = [
  {
    key: '1',
    header: 'Clone number'
  },
  {
    key: '2',
    header: 'SMP success on parent (%)'
  },
  {
    key: '3',
    header: 'Non-orchard pollen contam. (%)'
  }
];

export const smpSuccessFixedFilters: Array<SMPSuccessFixedFiltersType> = [
  {
    code: 'meanDegreesLat',
    description: 'Mean degrees latitude'
  },
  {
    code: 'meanMinutesLat',
    description: 'Mean minutes latitude'
  },
  {
    code: 'meanDegreesLong',
    description: 'Mean degrees longitude'
  },
  {
    code: 'meanMinutesLong',
    description: 'Mean minutes longitude'
  },
  {
    code: 'meanElevation',
    description: 'Mean elevation'
  }
];

export const smpMixFixedHeaders:Array<TableHeaders> = [
  {
    key: '1',
    header: 'Clone number'
  },
  {
    key: '2',
    header: 'Volume (ml)'
  },
  {
    key: '3',
    header: 'Proportion'
  }
];

export const newSMPMixEntry:SMPMixEntriesType = {
  cloneNumber: '',
  volume: '',
  proportion: '',
  adClonal: '',
  dfsClonal: '',
  dfuClonal: '',
  dfwClonal: '',
  dsbClonal: '',
  dscClonal: '',
  dsgClonal: '',
  gvoClonal: '',
  iwsClonal: '',
  wduClonal: '',
  wwdClonal: '',
  wveClonal: '',
  adWeighted: '',
  dfsWeighted: '',
  dfuWeighted: '',
  dfwWeighted: '',
  dsbWeighted: '',
  dscWeighted: '',
  dsgWeighted: '',
  gvoWeighted: '',
  iwsWeighted: '',
  wduWeighted: '',
  wwdWeighted: '',
  wveWeighted: ''
};

// This function will be removed once we start using the real API
export const getTestParentTrees = (orchardID: string[]): Array<ParentTreesType> => {
  const returnObj:Array<ParentTreesType> = [];
  orchardID.forEach((id) => {
    for (let index = 1; index < 26; index += 1) {
      returnObj.push({
        id: `${index.toString()}-${id}`,
        value: index.toString()
      });
    }
  });
  return returnObj;
};
