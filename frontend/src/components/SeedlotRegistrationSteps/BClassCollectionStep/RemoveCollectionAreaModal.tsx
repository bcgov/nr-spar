import React from 'react';
import { Modal } from '@carbon/react';

export const REMOVE_COLLECTION_AREA_WARNING = 'This removes the collection area and also clears the '
  + 'latitude and longitude, elevation, collection radius, and BEC zone, subzone, and variant '
  + 'on the registration form.';

type RemoveCollectionAreaModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const RemoveCollectionAreaModal = ({ open, onClose, onConfirm }: RemoveCollectionAreaModalProps) => (
  <Modal
    open={open}
    danger
    size="sm"
    modalHeading="Remove collection area?"
    primaryButtonText="Remove collection area"
    secondaryButtonText="Cancel"
    onRequestClose={onClose}
    onRequestSubmit={onConfirm}
  >
    <p>{REMOVE_COLLECTION_AREA_WARNING}</p>
  </Modal>
);

export default RemoveCollectionAreaModal;
