import React from 'react';
import { Modal } from '@carbon/react';
import modalConfig from './constants';

import './styles.scss';

interface OrchardModalProps {
  open: boolean;
  setOpen: Function;
  deleteFunction: Function;
  addFunction: Function;
  modalType: string;
}

const OrchardModal = (
  {
    open, setOpen, deleteFunction, addFunction, modalType
  }: OrchardModalProps
) => (
  <Modal
    className="orchard-modal"
    modalLabel={modalConfig[modalType].label}
    modalHeading={modalConfig[modalType].title}
    primaryButtonText={modalConfig[modalType].buttons.primary}
    secondaryButtonText={modalConfig[modalType].buttons.secondary}
    open={open}
    onRequestClose={() => {
      setOpen(false);
    }}
    onRequestSubmit={() => {
      if (modalType === 'delete') {
        deleteFunction();
      }
      if (modalType === 'add') {
        addFunction();
      }
      setOpen(false);
    }}
    size="sm"
    danger
  />
);

export default OrchardModal;
