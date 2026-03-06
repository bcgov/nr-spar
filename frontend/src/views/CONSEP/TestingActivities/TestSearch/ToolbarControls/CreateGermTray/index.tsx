import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox, Button, InlineNotification } from '@carbon/react';
import { useMutation } from '@tanstack/react-query';
import ROUTES from '../../../../../../routes/constants';
import { assignGerminatorTrays } from '../../../../../../api-service/consep/germinatorTrayAPI';
import { GermTrayCreateResponseType } from '../../../../../../types/consep/GerminatorTrayType';
import { GermTrayOptions, CreateGermTrayProps, CreateGermTrayRequest } from './definitions';
import './styles.scss';

const CreateGermTray = (
  {
    table,
    onClose
  }: CreateGermTrayProps
) => {
  const selectedRows = table.getSelectedRowModel()?.rows.map((row) => row.original) ?? [];
  const [options, setOptions] = useState<GermTrayOptions>({
    printDishLabels: false,
    printGerminationTrayLabels: false,
    printGerminationCoverSheet: false,
    printGerminationTestRecord: false
  });
  const [alert, setAlert] = useState<{
    status: 'error' | 'info' | 'success' | 'warning';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  const createGerminatorTrayMutation = useMutation({
    mutationFn: (payload: CreateGermTrayRequest[]) => assignGerminatorTrays(payload),
    onSuccess: (data: GermTrayCreateResponseType[]) => {
      navigate(ROUTES.MAINTAIN_GERMINATION_TRAY_SCREEN, {
        state: { germinatorTrays: data }
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Assign germinator trays API request failed';
      setAlert({ status: 'error', message });
    }
  });

  const handleCheckboxChange = (key: keyof GermTrayOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = () => {
    const requestPayload: CreateGermTrayRequest[] = selectedRows.map((row) => ({
      activityTypeCd: row.activityTypeCd,
      riaSkey: row.riaSkey,
      actualBeginDtTm: row.actualBeginDtTm
    }));
    createGerminatorTrayMutation.mutate(requestPayload);
  };

  return (
    <div className="consep-create-germ-tray-modal">
      {alert?.message && (
        <InlineNotification
          className="consep-create-germ-tray-modal-alert"
          lowContrast
          kind={alert.status}
          subtitle={alert?.message}
        />
      )}
      <div className="consep-create-germ-tray-options">
        <Checkbox
          id="print-dish-labels"
          labelText="Print dish labels"
          checked={options.printDishLabels}
          onChange={() => handleCheckboxChange('printDishLabels')}
        />
        <Checkbox
          id="print-germination-tray-labels"
          labelText="Print germination tray labels"
          checked={options.printGerminationTrayLabels}
          onChange={() => handleCheckboxChange('printGerminationTrayLabels')}
        />
        <Checkbox
          id="print-germination-cover-sheet"
          labelText="Print germination cover sheet"
          checked={options.printGerminationCoverSheet}
          onChange={() => handleCheckboxChange('printGerminationCoverSheet')}
        />
        <Checkbox
          id="print-germination-test-record"
          labelText="Print germination test record"
          checked={options.printGerminationTestRecord}
          onChange={() => handleCheckboxChange('printGerminationTestRecord')}
        />
      </div>
      <div className="consep-create-germ-tray-actions">
        <Button kind="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button kind="primary" onClick={handleSubmit} disabled={createGerminatorTrayMutation.isPending}>
          Create germination tray
        </Button>
      </div>
    </div>
  );
};

export default CreateGermTray;
