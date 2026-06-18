import React, { useEffect, useState, useRef } from 'react';
import {
  FlexGrid, Row, Column, ActionableNotification
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import GenericTable from '../../../../components/GenericTable';
import { ReplicateType, TestingTypes } from '../../../../types/consep/TestingActivityType';
import testingActivitiesAPI from '../../../../api-service/consep/testingActivitiesAPI';
import { getMccColumns, getPurityColumns, TABLE_TITLE } from './constants';
import useAutosave from '../../../../hooks/useAutosave';

import './styles.scss';

type ActivityResultProp = {
  replicatesData: ReplicateType[],
  replicateType: TestingTypes,
  riaKey: number,
  isEditable: boolean,
  initValidationErrors: Record<string, string>,
  hideActions?: boolean,
  setAlert: (isSuccess: boolean, message: string) => void
  updateReplicates: (replicatesList: ReplicateType[]) => void
  tableBodyRef: React.RefObject<HTMLTableSectionElement>
}

const useReplicates = (
  riaKey: number,
  replicateType: TestingTypes,
  updateReplicates: (replicatesList: ReplicateType[]) => void,
  setAlert: (isSuccess: boolean, message: string) => void
) => {
  const [replicatesList, setReplicatesList] = useState<ReplicateType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);

  const isDeletingRef = useRef(false);

  const updateReplicateListMutation = useMutation({
    mutationFn: (replicates: ReplicateType[]) => testingActivitiesAPI(
      replicateType,
      'updateMultipleReplicates',
      { riaKey, replicates }
    ),
    onError: (error) => {
      setAlert(false, `Failed to update replicates: ${(error as AxiosError).message}`);
    }
  });

  const { markSaved } = useAutosave<ReplicateType[]>({
    data: replicatesList,
    onSave: (list) => updateReplicateListMutation.mutate(list),
    enabled:
      !Object.values(validationErrors).some(Boolean)
      && !updateReplicateListMutation.isPending
      && !isDeletingRef.current
  });

  const deleteReplicateMutation = useMutation({
    mutationFn: (replicateNumber: number) => testingActivitiesAPI(
      replicateType,
      'deleteSingleReplicate',
      { riaKey, replicateNumber }
    ),
    onMutate: () => {
      isDeletingRef.current = true;
    },
    onSuccess: (data) => {
      setAlert(true, 'Replicate deleted successfully');
      const updatedList = data.data.replicatesList;
      setReplicatesList(updatedList);
      updateReplicates(updatedList);
      markSaved(updatedList);
    },
    onError: (error) => {
      setAlert(false, `Failed to delete replicate: ${(error as AxiosError).message}`);
    },
    onSettled: () => {
      isDeletingRef.current = false;
    }
  });

  const syncWithInitialData = (data: ReplicateType[]) => {
    setIsLoading(true);
    setReplicatesList(data);
    markSaved(data);
    setIsLoading(false);
  };

  return {
    replicatesList,
    setReplicatesList,
    isLoading,
    validationErrors,
    setValidationErrors,
    showDeleteNotification,
    setShowDeleteNotification,
    deleteReplicateMutation,
    isDeletingRef,
    syncWithInitialData,
    markSaved
  };
};

const ActivityResult = ({
  replicatesData, replicateType, riaKey, initValidationErrors,
  isEditable, hideActions = false, updateReplicates, setAlert, tableBodyRef
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
    isDeletingRef,
    syncWithInitialData,
    markSaved
  } = useReplicates(riaKey, replicateType, updateReplicates, setAlert);

  const replicatesListRef = useRef(replicatesList);
  replicatesListRef.current = replicatesList;

  const deleteReplicatesMutation = useMutation({
    mutationFn: (replicateNumbers: number[]) => testingActivitiesAPI(
      replicateType,
      'deleteMultipleReplicates',
      { riaKey, replicateNumbers }
    ),
    onMutate: () => {
      isDeletingRef.current = true;
    },
    onSuccess: () => {
      setAlert(true, 'Replicates deleted successfully');
      setReplicatesList([]);
      updateReplicates([]);
      markSaved([]);
    },
    onError: (error) => {
      setAlert(false, `Failed to delete replicates: ${(error as AxiosError).message}`);
    },
    onSettled: () => {
      isDeletingRef.current = false;
    }
  });

  // Hydrate when props differ from local (query/refetch). Skip parent echo of updateReplicates.
  useEffect(() => {
    if (JSON.stringify(replicatesData) === JSON.stringify(replicatesListRef.current)) {
      return;
    }
    syncWithInitialData(replicatesData);
  }, [replicatesData]);

  const addRow = () => {
    const newRow = { riaKey, replicateNumber: replicatesList.length + 1, replicateAccInd: 1 };
    const next = [...replicatesList, newRow];
    setReplicatesList(next);
    updateReplicates(next);
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
    {
      label: 'Clear data',
      icon: <Icons.TrashCan size={15} />,
      invisible: hideActions,
      action: handleAllClearData
    },
    {
      label: 'Accept all',
      icon: <Icons.CheckboxChecked size={15} />,
      action: () => {
        const next = replicatesList.map((r) => ({ ...r, replicateAccInd: 1 }));
        setReplicatesList(next);
        updateReplicates(next);
      }
    },
    {
      label: 'Add row',
      icon: <Icons.AddAlt size={15} />,
      invisible: hideActions,
      action: addRow
    }
  ];

  const createReplicateList = (replicates: ReplicateType[]): ReplicateType[] => {
    switch (replicateType) {
      case 'moistureTest':
        return replicates.map((item) => ({
          ...item,
          dryWeight: ('containerAndDryWeight' in item) && item.containerAndDryWeight && item.containerWeight
            ? parseFloat((item.containerAndDryWeight - item.containerWeight).toFixed(4))
            : undefined,
          mcValue: ('freshSeed' in item) && item.freshSeed && item.dryWeight
            ? (Math.round(
              ((item.freshSeed - item.dryWeight) / item.freshSeed + Number.EPSILON) * 100
            )).toFixed(2)
            : undefined
        }));
      case 'purityTest': {
        return replicates.map((item) => ({
          ...item,
          purityValue:
          ('pureSeedWeight' in item) && item.pureSeedWeight && item.pureSeedWeight > 0
          && item.otherSeedWeight && item.inertMttrWeight
            ? (Math.round(
              (item.pureSeedWeight
                / (item.otherSeedWeight + item.inertMttrWeight + item.pureSeedWeight)) * 100
            )).toFixed(2)
            : undefined
        }));
      }
      default:
        break;
    }
    return replicatesList;
  };

  const updateRow = (row: ReplicateType) => {
    const updatedList = replicatesList.map((item) => (
      item.replicateNumber === row.replicateNumber
        ? { ...item, ...row }
        : item
    ));

    const next = createReplicateList(updatedList);
    setReplicatesList(next);
    updateReplicates(next);
  };

  const getTableColumns = () => {
    switch (replicateType) {
      case 'moistureTest':
        return getMccColumns(
          !isEditable,
          (num) => deleteRow(num),
          updateRow,
          Object.keys(validationErrors).length > 0 ? validationErrors : initValidationErrors,
          setValidationErrors
        );
      case 'purityTest':
        return getPurityColumns(
          !isEditable,
          hideActions,
          (num) => deleteRow(num),
          updateRow,
          Object.keys(validationErrors).length > 0 ? validationErrors : initValidationErrors,
          setValidationErrors
        );
      default:
        break;
    }
    return [];
  };

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
      <Row className="activity-result-actions">
        <Column sm={3} md={3} lg={5} className="activity-result-actions-title">
          <h3>{TABLE_TITLE}</h3>
        </Column>
        <Column sm={2} md={2} lg={4} className="activity-result-action-buttons">
          {actions.map(({
            label, icon, invisible, action
          }) => (
            <button
              key={label}
              className={isEditable ? 'action-item' : 'action-item-disabled'}
              onClick={action}
              type="button"
              aria-label={label}
              disabled={!isEditable}
              style={{ display: invisible ? 'none' : 'inline-flex' }}
            >
              {label}
              {icon}
            </button>
          ))}
        </Column>
      </Row>
      <Row>
        <GenericTable
          columns={getTableColumns()}
          data={createReplicateList(replicatesList)}
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
