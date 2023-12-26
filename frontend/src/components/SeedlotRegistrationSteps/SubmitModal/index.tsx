import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
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
import { putAClassSeedlot } from '../../../api-service/seedlotAPI';

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
  // const navigate = useNavigate();
  const [declareTrue, setDeclareTrue] = useState<boolean>(false);

  const payload: SeedlotAClassSubmitType = {
    seedlotFormCollectionDto: convertCollection(allStepData.collectionStep),
    seedlotFormOwnershipDtoList: convertOwnership(allStepData.ownershipStep),
    seedlotFormInterimDto: convertInterim(allStepData.interimStep),
    seedlotFormOrchardDto: convertOrchard(
      allStepData.orchardStep,
      allStepData.parentTreeStep.tableRowData
    ),
    seedlotFormParentTreeSmpDtoList: convertParentTree(allStepData.parentTreeStep, seedlotNumber),
    seedlotFormExtractionDto: convertExtraction(allStepData.extractionStorageStep)
  };

  const submitSeedlot = useMutation({
    mutationFn: () => putAClassSeedlot(seedlotNumber, payload),
    onSuccess: () => {
      // eslint-disable-next-line no-alert
      window.alert('Something is right');
      // navigate(`/seedlots/details/${seedlotNumber}`);
    },
    onError: () => {
      // eslint-disable-next-line no-alert
      window.alert('Something is wrong');
    }
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
            submitSeedlot.mutate();
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
