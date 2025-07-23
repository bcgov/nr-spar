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

import './styles.scss';

type ActivityResultProp = {
  replicatesData: ReplicateType[],
  replicateType: TestingTypes,
  riaKey: number,
  isEditable: boolean,
  setAlert: (isSuccess: boolean, message: string) => void
  tableBodyRef: React.RefObject<HTMLTableSectionElement>
}

const useReplicates = (
  riaKey: number,
  replicateType: TestingTypes,
  setAlert: (isSuccess: boolean, message: string) => void
) => {
  const [replicatesList, setReplicatesList] = useState<ReplicateType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);

  const lastCheckedListRef = useRef<string | null>(null);

  const updateReplicateListMutation = useMutation({
    mutationFn: (replicates: ReplicateType[]) => testingActivitiesAPI(
      replicateType,
      'updateMultipleReplicates',
      { riaKey, replicates }
    ),
    onSuccess: (_, variables) => {
      lastCheckedListRef.current = JSON.stringify(variables);
    },
    onError: (error) => {
      setAlert(false, `Failed to update replicates: ${(error as AxiosError).message}`);
    }
  });

  const deleteReplicateMutation = useMutation({
    mutationFn: (replicateNumber: number) => testingActivitiesAPI(
      replicateType,
      'deleteSingleReplicate',
      { riaKey, replicateNumber }
    ),
    onSuccess: (data) => {
      setAlert(true, 'Replicate deleted successfully');
      const updatedList = data.data.replicatesList;
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
  replicatesData, replicateType, riaKey,
  isEditable, setAlert, tableBodyRef
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
  } = useReplicates(riaKey, replicateType, setAlert);

  const deleteReplicatesMutation = useMutation({
    mutationFn: (replicateNumbers: number[]) => testingActivitiesAPI(
      replicateType,
      'deleteMultipleReplicates',
      { riaKey, replicateNumbers }
    ),
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
    {
      label: 'Clear data',
      icon: <Icons.TrashCan size={15} />,
      action: handleAllClearData
    },
    {
      label: 'Accept all',
      icon: <Icons.CheckboxChecked size={15} />,
      action: () => setReplicatesList(replicatesList.map((r) => ({ ...r, replicateAccInd: 1 })))
    },
    {
      label: 'Add row',
      icon: <Icons.AddAlt size={15} />,
      action: addRow
    }
  ];

  const createReplicateList = (replicates: ReplicateType[]): ReplicateType[] => {
    switch (replicateType) {
      case 'moistureTest':
        return replicates.map((item) => ({
          ...item,
          mcValue: ('freshSeed' in item) && item.freshSeed && item.dryWeight
            ? (Math.round(
              ((item.freshSeed - item.dryWeight) / item.freshSeed + Number.EPSILON) * 100
            )).toFixed(2)
            : undefined
        }));
      case 'purityTest':
        return replicates.map((item) => ({
          ...item,
          purityValue:
          ('pureSeedWeight' in item) && item.pureSeedWeight && item.pureSeedWeight > 0
          && item.otherSeedWeight && item.inertMttrWeight
            ? (Math.round(
              (item.pureSeedWeight
                / (item.otherSeedWeight + item.inertMttrWeight + item.pureSeedWeight)) * 100
            )).toFixed(2)
            : undefined,
          dryWeight: ('containerAndDryWeight' in item) && item.containerAndDryWeight && item.containerWeight
            ? parseFloat((item.containerAndDryWeight - item.containerWeight).toFixed(4))
            : undefined
        }));
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

    setReplicatesList(createReplicateList(updatedList));
  };

  const getTableColumns = () => {
    switch (replicateType) {
      case 'moistureTest':
        return getMccColumns(
          !isEditable,
          (num) => deleteRow(num),
          updateRow,
          validationErrors,
          setValidationErrors
        );
      case 'purityTest':
        return getPurityColumns(
          !isEditable,
          (num) => deleteRow(num),
          updateRow,
          validationErrors,
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
          {actions.map(({ label, icon, action }) => (
            <button
              key={label}
              className={isEditable ? 'action-item' : 'action-item-disabled'}
              onClick={action}
              type="button"
              aria-label={label}
              disabled={!isEditable}
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
