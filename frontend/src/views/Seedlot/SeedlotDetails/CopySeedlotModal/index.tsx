import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineNotification, Modal } from '@carbon/react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { postCopySeedlot } from '../../../../api-service/seedlotAPI';
import ROUTES from '../../../../routes/constants';
import { addParamToPath } from '../../../../utils/PathUtils';
import SuccessToast from '../../../../components/Toast/SuccessToast';
import { ErrToastOption } from '../../../../config/ToastifyConfig';

type Props = {
  open: boolean;
  seedlotNumber: string;
  onClose: () => void;
};

const CopySeedlotModal = ({ open, seedlotNumber, onClose }: Props) => {
  const navigate = useNavigate();
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  const copyMutation = useMutation({
    mutationFn: () => postCopySeedlot(seedlotNumber),
    onError: (err: AxiosError) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err.response?.data as any)?.message ?? `${err.code}: ${err.message}`;
      setApiErrorMsg(msg);
    },
    onSuccess: (res) => {
      onClose();
      toast.success(
        <SuccessToast
          title="Seedlot duplicated:"
          subtitle={`Copy of lot ${seedlotNumber} to new lot ${res.seedlotNumber} successful.`}
        />,
        ErrToastOption
      );
      navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, res.seedlotNumber));
    }
  });

  const handleClose = () => {
    if (copyMutation.isPending) return;
    setApiErrorMsg(null);
    copyMutation.reset();
    onClose();
  };

  return (
    <Modal
      className="spar-modal"
      open={open}
      modalHeading={`Duplicate seedlot ${seedlotNumber}`}
      primaryButtonText={copyMutation.isPending ? 'Copying...' : 'Copy'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={copyMutation.isPending}
      onRequestClose={handleClose}
      onRequestSubmit={() => { setApiErrorMsg(null); copyMutation.mutate(); }}
      size="sm"
    >
      <p>This will create a copy of the seedlot record. Do you wish to continue?</p>

      {apiErrorMsg && (
        <InlineNotification
          kind="error"
          title="Error:"
          subtitle={apiErrorMsg}
          hideCloseButton
          lowContrast
        />
      )}
    </Modal>
  );
};

export default CopySeedlotModal;
