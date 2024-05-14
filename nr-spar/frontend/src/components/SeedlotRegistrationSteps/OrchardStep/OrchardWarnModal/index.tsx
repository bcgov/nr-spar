import React from 'react';
import { Modal } from '@carbon/react';
import modalConfig from './constants';
import orchardModalOptions from './definitions';

import './styles.scss';

interface OrchardWarnModalProps {
  open: boolean;
  setOpen: Function;
  confirmEdit: Function;
  modalType: keyof orchardModalOptions;
}

const OrchardWarnModal = (
  {
    open, setOpen, confirmEdit, modalType
  }: OrchardWarnModalProps
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
      confirmEdit();
      setOpen(false);
    }}
    size="sm"
    danger
  />
);

export default OrchardWarnModal;
