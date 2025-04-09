import React, { useEffect } from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import { useMutation } from '@tanstack/react-query';

import GenericTable from '../../../../components/GenericTable';
import { ReplicateType } from '../../../../types/consep/TestingActivityType';

import { updateReplicates } from '../../../../api-service/moistureContentAPI';

import { getColumns } from './constants';

import './styles.scss';

type ActivityResultProp = {
  replicatesData: ReplicateType[],
  riaKey: number
}

const ActivityResult = ({ replicatesData, riaKey }: ActivityResultProp) => {
  const [replicatesList, setReplicatesList] = React.useState<ReplicateType[]>([]);
  const TITLE = 'Activity results per replicate';
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const updateReplicateListMutation = useMutation({
    mutationFn: (replicates: ReplicateType[]) => updateReplicates(riaKey, replicates),
    onSuccess: () => {
      console.log('Replicates updated successfully');
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });
  useEffect(() => {
    setIsLoading(true);
    setReplicatesList(replicatesData);
    setIsLoading(false);
  }, [replicatesData]);
  console.log(1111, replicatesList);

  const addRow = () => {
    const newRow = {
      riaKey,
      replicateNumber: replicatesList.length + 1,
      replicateAccInd: 1
    };
    const updatedReplicatesList = [...replicatesList, newRow];
    setReplicatesList(updatedReplicatesList);
  };

  const deleteRow = (replicateNumber: number) => {
    const updatedList = replicatesList.filter((item) => item.replicateNumber !== replicateNumber);
    setReplicatesList(updatedList);
  };

  const handleEditSave = (updatedRow: ReplicateType, rowIndex: number) => {
    const updatedList = [...replicatesList];
    updatedList[rowIndex] = updatedRow;
    setReplicatesList(updatedList);
  };

  const clearAll = () => {
    setReplicatesList([]);
  };

  const acceptAll = () => {
    const updatedList = replicatesList.map((item) => ({
      ...item,
      replicateAccInd: 1
    }));
    setReplicatesList(updatedList);
  };

  const actions = [
    {
      label: 'Clear data',
      icon: <Icons.TrashCan size={15} />,
      action: clearAll
    },
    {
      label: 'Accept all',
      icon: <Icons.CheckboxChecked size={15} />,
      action: acceptAll
    },
    {
      label: 'Add row',
      icon: <Icons.AddAlt size={15} />,
      action: addRow
    },
    {
      label: 'Save',
      icon: <Icons.Save size={15} />,
      action: () => {
        setIsLoading(true);
        updateReplicateListMutation.mutate(replicatesList);
        setIsLoading(false);
      }
    }
  ];

  return (
    <FlexGrid className="activity-result-container">
      <Row>
        <h3 className="activity-result-title">{TITLE}</h3>
      </Row>
      <Row className="activity-result-actions">
        <Column lg={8} />
        <Column lg={4} className="activity-result-actions">
          {actions.map((action) => (
            <span key={action.label} className="action-item" onClick={action.action}>
              {action.label}
              {action.icon}
            </span>
          ))}

        </Column>
      </Row>
      <Row>
        <GenericTable
          columns={getColumns(deleteRow)}
          data={replicatesList}
          isLoading={isLoading}
          isCompacted
          enableSorting
          onEditingRowSave={handleEditSave}
        />
      </Row>
    </FlexGrid>
  );
};

export default ActivityResult;
