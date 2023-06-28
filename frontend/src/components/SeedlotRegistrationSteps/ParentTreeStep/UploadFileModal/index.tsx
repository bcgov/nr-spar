import React from 'react';
import {
  ToastNotification,
  Modal,
  FileUploaderDropContainer,
  FileUploaderItem
} from '@carbon/react';
import textConfig from './constants';
import { FileConfigType } from '../definitions';

import './styles.scss';

interface UploadFileModalProps {
  open: boolean;
  setOpen: Function;
  onSubmit: Function;
  fileUploadConfig: FileConfigType;
  setFileUploadConfig: Function;
  resetFileUploadConfig: Function;
}

const UploadFileModal = (
  {
    open, setOpen, onSubmit,
    fileUploadConfig, setFileUploadConfig, resetFileUploadConfig
  }: UploadFileModalProps
) => (
  <Modal
    className="upload-file-modal"
    modalLabel={textConfig.label}
    modalHeading={textConfig.title}
    primaryButtonText={textConfig.buttons.confirm}
    secondaryButtonText={textConfig.buttons.cancel}
    open={open}
    onRequestClose={() => {
      setOpen(false);
      resetFileUploadConfig();
    }}
    onRequestSubmit={() => {
      onSubmit(fileUploadConfig.file);
    }}
    primaryButtonDisabled={fileUploadConfig.invalidFile}
    size="sm"
  >
    <p className="upload-modal-description">
      {textConfig.description}
    </p>
    <FileUploaderDropContainer
      className="upload-file-component"
      labelText={textConfig.uploadFile}
      accept={['.csv']}
      onAddFiles={
        (e: React.ChangeEvent<HTMLInputElement>, { addedFiles }: any) => {
          e.stopPropagation();
          const fileToUpload = addedFiles[0];
          const newFileUploadConfig = { ...fileUploadConfig };
          // setFileAdded(true);
          newFileUploadConfig.fileAdded = true;
          // setFileName(fileToUpload.name);
          newFileUploadConfig.fileName = fileToUpload.name;
          if (fileToUpload.type !== 'text/csv') {
            // setErrorSub(textConfig.uploadedFileErrorType);
            newFileUploadConfig.errorSub = textConfig.uploadedFileErrorType;
            // setErrorMessage(textConfig.uploadedFileErrorMessageType);
            newFileUploadConfig.errorMessage = textConfig.uploadedFileErrorMessageType;
          } else if (fileToUpload.size > 512000) {
            // setErrorSub(textConfig.uploadedFileErrorSize);
            newFileUploadConfig.errorSub = textConfig.uploadedFileErrorSize;
            // setErrorMessage(textConfig.uploadedFileErrorMessageSize);
            newFileUploadConfig.errorMessage = textConfig.uploadedFileErrorMessageSize;
          } else {
            // setInvalidFile(false);
            newFileUploadConfig.invalidFile = false;
            // setFile(fileToUpload);
            newFileUploadConfig.file = fileToUpload;
          }
          setFileUploadConfig(newFileUploadConfig);
        }
      }
    />
    {
      fileUploadConfig.fileAdded
        ? (
          <FileUploaderItem
            name={fileUploadConfig.fileName}
            errorSubject={fileUploadConfig.errorSub}
            errorBody={fileUploadConfig.errorMessage}
            invalid={fileUploadConfig.invalidFile}
            iconDescription={textConfig.uploadedFileIconDesc}
            status={fileUploadConfig.uploaderStatus}
            onDelete={() => resetFileUploadConfig()}
          />
        )
        : null
    }
    <ToastNotification
      className="upload-notification"
      hideCloseButton
      lowContrast
      kind="info"
      title={textConfig.notification.title}
      subtitle={textConfig.notification.description}
    />
  </Modal>
);

export default UploadFileModal;
