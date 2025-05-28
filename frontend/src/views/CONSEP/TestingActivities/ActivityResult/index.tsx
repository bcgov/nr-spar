import React, { useEffect, useState, useRef } from 'react';
import {
  FlexGrid, Row, Column, ActionableNotification
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import GenericTable from '../../../../components/GenericTable';
import { ReplicateType } from '../../../../types/consep/TestingActivityType';
import { updateReplicates, deleteReplicate, deleteReplicates } from '../../../../api-service/moistureContentAPI';
import { getColumns } from './constants';

import './styles.scss';

const TITLE = 'Activity results per replicate';

type ActivityResultProp = {
  replicatesData: ReplicateType[],
  riaKey: number,
  isEditable: boolean,
  setAlert: (isSuccess: boolean, message: string) => void
  tableBodyRef: React.RefObject<HTMLTableSectionElement>
}

const useReplicates = (riaKey: number, setAlert: (isSuccess: boolean, message: string) => void) => {
  const [replicatesList, setReplicatesList] = useState<ReplicateType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);

  const lastCheckedListRef = useRef<string | null>(null);

  const updateReplicateListMutation = useMutation({
    mutationFn: (replicates: ReplicateType[]) => updateReplicates(riaKey, replicates),
    onSuccess: (_, variables) => {
      lastCheckedListRef.current = JSON.stringify(variables);
    },
    onError: (error) => {
      setAlert(false, `Failed to update replicates: ${(error as AxiosError).message}`);
    }
  });

  const deleteReplicateMutation = useMutation({
    mutationFn: (replicateNumber: number) => deleteReplicate(riaKey, replicateNumber),
    onSuccess: (data) => {
      setAlert(true, 'Replicate deleted successfully');
      const replicateNumber = data.data;
      const updatedList = replicatesList.filter((item) => item.replicateNumber !== replicateNumber);
      lastCheckedListRef.current = JSON.stringify(updatedList);
      setReplicatesList(updatedList);
    }
  });

  const syncWithInitialData = (data: ReplicateType[]) => {
    setIsLoading(true);
    const dataString = JSON.stringify(data);
    setReplicatesList(data);
    lastCheckedListRef.current = dataString;
    setIsLoading(false);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const hasValidationErrors = Object.values(validationErrors).some(Boolean);
      if (hasValidationErrors || updateReplicateListMutation.isLoading) {
        return;
      }

      const currentListString = JSON.stringify(replicatesList);
      if (currentListString !== lastCheckedListRef.current) {
        updateReplicateListMutation.mutate(replicatesList);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [replicatesList, validationErrors, updateReplicateListMutation]);

  return {
    replicatesList,
    setReplicatesList,
    isLoading,
    validationErrors,
    setValidationErrors,
    showDeleteNotification,
    setShowDeleteNotification,
    deleteReplicateMutation,
    syncWithInitialData
  };
};

const ActivityResult = ({
  replicatesData, riaKey, isEditable, setAlert, tableBodyRef
}: ActivityResultProp) => {
  const {
    replicatesList,
    setReplicatesList,
    isLoading,
    validationErrors,
    setValidationErrors,
    showDeleteNotification,
    setShowDeleteNotification,
    deleteReplicateMutation,
    syncWithInitialData
  } = useReplicates(riaKey, setAlert);

  const deleteReplicatesMutation = useMutation({
    mutationFn: (replicateNumbers: number[]) => deleteReplicates(riaKey, replicateNumbers),
    onSuccess: () => {
      setAlert(true, 'Replicates deleted successfully');
      setReplicatesList([]);
    },
    onError: (error) => {
      setAlert(false, `Failed to delete replicates: ${(error as AxiosError).message}`);
    }
  });

  useEffect(() => {
    syncWithInitialData(replicatesData);
  }, [replicatesData]);

  const addRow = () => {
    const newRow = { riaKey, replicateNumber: replicatesList.length + 1, replicateAccInd: 1 };
    setReplicatesList([...replicatesList, newRow]);
  };

  const handleAllClearData = () => {
    setShowDeleteNotification(true);
  };

  const deleteAllRows = () => {
    setShowDeleteNotification(false);
    deleteReplicatesMutation.mutate(replicatesList.map((item) => item.replicateNumber));
  };

  const deleteRow = (replicateNumber: number) => {
    deleteReplicateMutation.mutate(replicateNumber);
  };

  const actions = [
    { label: 'Clear data', icon: <Icons.TrashCan size={15} />, action: handleAllClearData },
    { label: 'Accept all', icon: <Icons.CheckboxChecked size={15} />, action: () => setReplicatesList(replicatesList.map((r) => ({ ...r, replicateAccInd: 1 }))) },
    { label: 'Add row', icon: <Icons.AddAlt size={15} />, action: addRow }
  ];

  const updateRow = (row: ReplicateType) => {
    const updatedList = replicatesList.map((item) => (item.replicateNumber === row.replicateNumber
      ? { ...item, ...row }
      : item));
    const updatedListWithMCValue = updatedList.map((item) => ({
      ...item,
      mcValue: item.freshSeed && item.dryWeight
        ? Math.round(
          ((item.freshSeed - item.dryWeight) / item.freshSeed + Number.EPSILON) * 100
        ) / 100
        : undefined
    }));
    setReplicatesList(updatedListWithMCValue);
  };

  const replicateListWithMCValue = replicatesList.map((item) => ({
    ...item,
    mcValue: item.freshSeed && item.dryWeight
      ? (Math.round(
        ((item.freshSeed - item.dryWeight) / item.freshSeed + Number.EPSILON) * 100
      )).toFixed(2)
      : undefined
  }));

  return (
    <FlexGrid className="activity-result-container">
      {showDeleteNotification && (
        <ActionableNotification
          className="activity-result-notification"
          actionButtonLabel="Clear"
          aria-label="close notification"
          closeOnEscape
          kind="warning"
          onActionButtonClick={deleteAllRows}
          statusIconDescription="notification"
          title="Are you sure?"
          subtitle="This action will clear the data in the table."
        />
      )}
      <Row>
        <h3 className="activity-result-title">{TITLE}</h3>
      </Row>
      <Row className="activity-result-actions">
        <Column lg={8} />
        <Column lg={4} className="activity-result-actions">
          {actions.map(({ label, icon, action }) => (
            <button key={label} className={isEditable ? 'action-item' : 'action-item-disabled'} onClick={action} type="button" aria-label={label} disabled={!isEditable}>
              {label}
              {icon}
            </button>
          ))}
        </Column>
      </Row>
      <Row>
        <GenericTable
          columns={getColumns(
            !isEditable,
            (num) => deleteRow(num),
            updateRow,
            validationErrors,
            setValidationErrors
          )}
          data={replicateListWithMCValue}
          isLoading={isLoading}
          enableEditing={isEditable}
          isCompacted
          enableSorting
          tableBodyRef={tableBodyRef}
        />
      </Row>
    </FlexGrid>
  );
};

export default ActivityResult;
