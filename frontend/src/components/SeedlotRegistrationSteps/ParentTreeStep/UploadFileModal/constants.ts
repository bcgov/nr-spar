const textConfig = {
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
    description: 'When uploading a file, all previously filled data in the table will be replaced.'
  },
  buttons: {
    cancel: 'Cancel',
    confirm: 'Import file and continue'
  }
};

export default textConfig;
