import React, { useState } from 'react';
import {
  ToastNotification,
  Modal,
  FileUploaderDropContainer,
  FileUploaderItem
} from '@carbon/react';

import { pageTexts } from '../constants';

import './styles.scss';

interface UploadFileModalProps {
  open: boolean;
  setOpen: Function;
  onSubmit: Function;
}

const UploadFileModal = ({ open, setOpen, onSubmit }: UploadFileModalProps) => {
  const [file, setFile] = useState<File>();
  const [fileName, setFileName] = useState<string>('');
  const [fileAdded, setFileAdded] = useState<boolean>(false);
  const [uploaderStatus, setUploaderStatus] = useState<string>('uploading');
  const [errorSub, setErrorSub] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [invalidFile, setInvalidFile] = useState<boolean>(true);

  const resetUploadStatus = () => {
    setFile(undefined);
    setFileName('');
    setFileAdded(false);
    setUploaderStatus('uploading');
    setInvalidFile(true);
  };

  return (
    <Modal
      className="upload-file-modal"
      modalLabel={pageTexts.sharedTabTexts.modal.label}
      modalHeading={pageTexts.sharedTabTexts.modal.title}
      primaryButtonText={pageTexts.sharedTabTexts.modal.buttons.confirm}
      secondaryButtonText={pageTexts.sharedTabTexts.modal.buttons.cancel}
      open={open}
      onRequestClose={() => {
        setOpen(false);
        resetUploadStatus();
      }}
      onRequestSubmit={() => {
        onSubmit(file);
        setOpen(false);
        resetUploadStatus();
      }}
      primaryButtonDisabled={invalidFile}
      size="sm"
    >
      <p className="upload-modal-description">
        {pageTexts.sharedTabTexts.modal.description}
      </p>
      <FileUploaderDropContainer
        className="upload-file-component"
        labelText={pageTexts.sharedTabTexts.modal.uploadFile}
        accept={['.csv']}
        onAddFiles={
          (e: React.ChangeEvent<HTMLInputElement>, { addedFiles }: any) => {
            e.stopPropagation();
            const fileToUpload = addedFiles[0];
            setFileAdded(true);
            setFileName(fileToUpload.name);
            if (fileToUpload.type !== 'text/csv') {
              setErrorSub(pageTexts.sharedTabTexts.modal.uploadedFileErrorType);
              setErrorMessage(pageTexts.sharedTabTexts.modal.uploadedFileErrorMessageType);
            } else if (fileToUpload.filesize > 512000) {
              setErrorSub(pageTexts.sharedTabTexts.modal.uploadedFileErrorSize);
              setErrorMessage(pageTexts.sharedTabTexts.modal.uploadedFileErrorMessageSize);
            } else {
              setInvalidFile(false);
              setFile(fileToUpload);
            }
            setUploaderStatus('edit');
          }
        }
      />
      { fileAdded && (
        <FileUploaderItem
          name={fileName}
          errorSubject={errorSub}
          errorBody={errorMessage}
          invalid={invalidFile}
          iconDescription={pageTexts.sharedTabTexts.modal.uploadedFileIconDesc}
          status={uploaderStatus}
          onDelete={() => resetUploadStatus()}
        />
      )}
      <ToastNotification
        className="upload-notification"
        hideCloseButton
        lowContrast
        kind="info"
        title={pageTexts.sharedTabTexts.modal.notification.title}
        subtitle={pageTexts.sharedTabTexts.modal.notification.description}
      />
    </Modal>
  );
};

export default UploadFileModal;
