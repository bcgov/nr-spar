import React from 'react';
import { Modal } from '@carbon/react';
import modalConfig from './constants';
import orchardModalOptions from './definitions';

import './styles.scss';

interface OrchardModalProps {
  open: boolean;
  setOpen: Function;
  submitFunction: Function;
  modalType: keyof orchardModalOptions;
}

const OrchardModal = (
  {
    open, setOpen, submitFunction, modalType
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
      submitFunction();
      setOpen(false);
    }}
    size="sm"
    danger
  />
);

export default OrchardModal;
