import React, { useState } from 'react';
import {
  Checkbox,
  Button,
  Modal,
  ToastNotification
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import ModalStateManager from '../../ModalStateManager';

import { AllStepData } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { SeedlotAClassSubmitType } from '../../../types/SeedlotType';
import {
  convertCollection, convertInterim, convertOrchard,
  convertOwnership, convertParentTree, convertExtraction
} from './utils';

import inputText from './constants';

import './styles.scss';

type SubmitModalProps = {
  btnText: string;
  renderIconName?: string;
  disableBtn: boolean;
  allStepData: AllStepData;
  seedlotNumber: string;
}

const SubmitModal = (
  {
    btnText,
    renderIconName,
    disableBtn,
    allStepData,
    seedlotNumber
  }: SubmitModalProps
) => {
  const [declareTrue, setDeclareTrue] = useState<boolean>(false);

  const convertToAClasPayload = (): SeedlotAClassSubmitType => ({
    seedlotFormCollectionDto: convertCollection(allStepData.collectionStep),
    seedlotFormOwnershipDtoList: convertOwnership(allStepData.ownershipStep),
    seedlotFormInterimDto: convertInterim(allStepData.interimStep),
    seedlotFormOrchardDto: convertOrchard(
      allStepData.orchardStep,
      allStepData.parentTreeStep.tableRowData
    ),
    seedlotFormParentTreeSmpDtoList: convertParentTree(allStepData.parentTreeStep, seedlotNumber),
    seedlotFormExtractionDto: convertExtraction(allStepData.extractionStorageStep)
  });

  return (
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
          onRequestSubmit={() => {
            const payload = convertToAClasPayload();
            console.log(payload);
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
};

export default SubmitModal;
