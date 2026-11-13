import React, { useRef, useState } from 'react';
import {
  Checkbox,
  Button,
  Modal,
  ActionableNotification,
  Link
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import ModalStateManager from '../../ModalStateManager';

import inputText from './constants';

import './styles.scss';

type SubmitModalProps = {
  btnText: string;
  renderIconName?: string;
  disableBtn: boolean;
  submitFn: Function;
  setStepFn: Function;
}

const SubmitModal = (
  {
    btnText,
    renderIconName,
    disableBtn,
    submitFn,
    setStepFn
  }: SubmitModalProps
) => {
  const [declareTrue, setDeclareTrue] = useState<boolean>(false);
  // A fast double click on the primary button can fire onRequestSubmit twice
  // before the modal closes; only the first one submits.
  const submittedRef = useRef(false);

  return (
    <ModalStateManager
      renderLauncher={({ setOpen }: any) => (
        <Button
          className="submit-modal-btn"
          onClick={() => {
            submittedRef.current = false;
            setOpen(true);
          }}
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
          onRequestSubmit={() => {
            if (submittedRef.current) {
              return;
            }
            submittedRef.current = true;
            setOpen(false);
            submitFn();
          }}
          primaryButtonDisabled={!declareTrue}
        >
          <p>{inputText.modal.helperText}</p>
          <Checkbox
            id="declaration-modal-checkbox"
            name="declaration-modal"
            labelText={inputText.modal.checkboxLabelText}
            checked={declareTrue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDeclareTrue(e.target.checked);
            }}
          />
          <ActionableNotification
            lowContrast
            kind="info"
            className="submit-notification"
            title={inputText.modal.notification.title}
            subtitle={(
              <span>
                {inputText.modal.notification.subtitle}
                <br />
                <br />
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <Link
                  tabIndex={0}
                  href="#"
                  onClick={() => {
                    setStepFn(0);
                  }}
                >
                  {inputText.modal.notification.link}
                </Link>
              </span>
            )}
          />
        </Modal>
      )}
    </ModalStateManager>
  );
};

export default SubmitModal;
