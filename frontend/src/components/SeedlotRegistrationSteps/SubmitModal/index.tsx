import React from 'react';
import {
  Checkbox,
  Button,
  Modal,
  ToastNotification
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import ModalStateManager from '../../ModalStateManager';
import inputText from './constants';
import './styles.scss';

type SubmitModalProps = {
  btnText: string;
  renderIconName?: string;
  disableBtn: boolean;
}

const SubmitModal = (
  {
    btnText,
    renderIconName,
    disableBtn
  }: SubmitModalProps
) => (
  <ModalStateManager
    renderLauncher={({ setOpen }: any) => (
      <Button
        className="submit-modal-btn"
        onClick={() => setOpen(true)}
        renderIcon={renderIconName ? Icons[renderIconName] : null}
        disabled={disableBtn}
      >
        {btnText}
      </Button>
    )}
  >
    {({ open, setOpen }: any) => (
      <Modal
        size="sm"
        className="seedlot-registration-modal"
        modalLabel={inputText.modal.modalLabel}
        modalHeading={inputText.modal.modalHeading}
        primaryButtonText={inputText.modal.primaryButtonText}
        secondaryButtonText={inputText.modal.secondaryButtonText}
        open={open}
        onRequestClose={() => setOpen(false)}
      >
        <p>{inputText.modal.helperText}</p>
        <Checkbox
          id="declaration-modal-checkbox"
          name="declaration-modal"
          labelText={inputText.modal.checkboxLabelText}
        />
        <ToastNotification
          lowContrast
          kind="info"
          title={inputText.modal.notification.title}
          subtitle={inputText.modal.notification.subtitle}
          caption={inputText.modal.notification.link}
        />
      </Modal>
    )}
  </ModalStateManager>
);

export default SubmitModal;
