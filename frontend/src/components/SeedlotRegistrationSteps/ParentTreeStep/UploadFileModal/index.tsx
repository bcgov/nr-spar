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
) => {
  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>, addedFile: File) => {
    e.stopPropagation();
    const fileToUpload = addedFile;
    const newFileUploadConfig = { ...fileUploadConfig };
    newFileUploadConfig.fileAdded = true;
    newFileUploadConfig.fileName = fileToUpload.name;
    if (fileToUpload.type !== 'text/csv') {
      newFileUploadConfig.errorSub = textConfig.uploadedFileErrorType;
      newFileUploadConfig.errorMessage = textConfig.uploadedFileErrorMessageType;
    } else if (fileToUpload.size > 512000) {
      newFileUploadConfig.errorSub = textConfig.uploadedFileErrorSize;
      newFileUploadConfig.errorMessage = textConfig.uploadedFileErrorMessageSize;
    } else {
      newFileUploadConfig.invalidFile = false;
      newFileUploadConfig.file = fileToUpload;
    }
    setFileUploadConfig(newFileUploadConfig);
  };

  return (
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
            handleAddFile(e, addedFiles[0]);
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
};

export default UploadFileModal;
