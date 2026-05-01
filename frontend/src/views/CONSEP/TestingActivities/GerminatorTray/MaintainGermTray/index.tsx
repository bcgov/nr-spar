import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  InlineNotification,
  Modal
} from '@carbon/react';
import GenericTable from '../../../../../components/GenericTable';
import ROUTES from '../../../../../routes/constants';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import PageTitle from '../../../../../components/PageTitle';
import {
  assignGerminatorId,
  deleteTestFromTray,
  deleteGerminatorTray,
  getGerminatorTrayContents
} from '../../../../../api-service/consep/germinatorTrayAPI';
import {
  GermTrayCreateResponseType,
  GermTrayDeleteContentType,
  GermTrayTestType
} from '../../../../../types/consep/GerminatorTrayType';
import { getGermTrayColumns, getGermTrayTestsColumns } from './constants';
import { GermTrayColumn } from './definitions';
import './styles.scss';

const BREAD_CRUMB_ITEMS = [{ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES }];

const MaintainGermTray = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const germinatorTrays = location.state?.germinatorTrays?.map(
    (tray: GermTrayCreateResponseType) => ({
      ...tray,
      germinatorId: ''
    })
  ) ?? [];
  const [alert, setAlert] = useState<{
    status: 'error' | 'info' | 'success' | 'warning';
    message: string;
  } | null>(null);
  const [trays, setTrays] = useState<GermTrayColumn[]>(germinatorTrays);
  const lastSyncedRef = useRef<string | null>(JSON.stringify(germinatorTrays));
  const [selectedTrayId, setSelectedTrayId] = useState<number | null>(null);
  const [pendingDeleteTray, setPendingDeleteTray] = useState<GermTrayColumn | null>(null);
  const [pendingDeleteTest, setPendingDeleteTest] = useState<GermTrayTestType | null>(null);

  const trayContentsQuery = useQuery({
    queryKey: ['germinatorTrayContents', selectedTrayId],
    queryFn: () => getGerminatorTrayContents(selectedTrayId!),
    enabled: selectedTrayId !== null
  });

  useEffect(() => {
    if (trayContentsQuery.isError) {
      const error = trayContentsQuery.error as any;
      const message = error?.response?.data?.message
        || error?.message
        || 'Failed to load tray contents';
      setAlert({ status: 'error', message });
    }
  }, [trayContentsQuery.isError, trayContentsQuery.error]);

  const handleTrayRowClick = useCallback((row: GermTrayColumn) => {
    setSelectedTrayId(row.germinatorTrayId);
  }, []);

  const deleteFromTrayMutation = useMutation({
    mutationFn: (row: GermTrayTestType) => {
      if (row.riaSkey == null || row.updateTimestamp == null) {
        return Promise.reject(new Error('Cannot delete: missing test data'));
      }
      return deleteTestFromTray(row.germinatorTrayId, row.riaSkey, row.updateTimestamp);
    },
    onSuccess: (_, row) => {
      setAlert(null);
      const remainingCount = (trayContentsQuery.data?.length ?? 0) - 1;
      if (remainingCount === 0) {
        setTrays((prev) => prev.filter((t) => t.germinatorTrayId !== row.germinatorTrayId));
        setSelectedTrayId(null);
      } else {
        queryClient.invalidateQueries({ queryKey: ['germinatorTrayContents', row.germinatorTrayId] });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to remove test from tray';
      setAlert({ status: 'error', message });
    }
  });

  const deleteTrayMutation = useMutation({
    mutationFn: async (tray: GermTrayColumn) => {
      const queryKey = [
        'germinatorTrayContents',
        tray.germinatorTrayId
      ];
      const cachedContents = queryClient.getQueryData<GermTrayTestType[]>(queryKey);
      const contents = cachedContents ?? await queryClient.fetchQuery<GermTrayTestType[]>({
        queryKey,
        queryFn: () => getGerminatorTrayContents(tray.germinatorTrayId)
      });

      const deleteContents: GermTrayDeleteContentType[] = contents.map((content) => {
        if (content.riaSkey == null || content.updateTimestamp == null) {
          throw new Error('Cannot delete: missing test data');
        }
        return {
          riaSkey: content.riaSkey,
          updateTimestamp: content.updateTimestamp
        };
      });

      return deleteGerminatorTray(tray.germinatorTrayId, deleteContents);
    },
    onSuccess: (_, tray) => {
      setAlert(null);
      setTrays((prev) => prev.filter((t) => t.germinatorTrayId !== tray.germinatorTrayId));
      if (selectedTrayId === tray.germinatorTrayId) {
        setSelectedTrayId(null);
        queryClient.removeQueries({ queryKey: ['germinatorTrayContents', tray.germinatorTrayId] });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete tray';
      setAlert({ status: 'error', message });
    }
  });

  const handleConfirmDeleteTray = useCallback(() => {
    if (!pendingDeleteTray) return;
    deleteTrayMutation.mutate(pendingDeleteTray);
    setPendingDeleteTray(null);
  }, [pendingDeleteTray, deleteTrayMutation]);

  const handleConfirmDeleteTest = useCallback(() => {
    if (!pendingDeleteTest) return;
    deleteFromTrayMutation.mutate(pendingDeleteTest);
    setPendingDeleteTest(null);
  }, [pendingDeleteTest, deleteFromTrayMutation]);

  const assignMutation = useMutation({
    mutationFn: ({
      germinatorTrayId,
      germinatorId
    }: {
      germinatorTrayId: number;
      germinatorId: string;
    }) => assignGerminatorId(germinatorTrayId, germinatorId),
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Assign germinator id API request failed';
      setAlert({ status: 'error', message });
    },
    onSuccess: () => { setAlert(null); }
  });

  const updateRow = useCallback((updatedRow: GermTrayCreateResponseType) => {
    setTrays((prev) => prev.map(
      (row) => (
        row.germinatorTrayId === updatedRow.germinatorTrayId
          ? { ...row, ...updatedRow }
          : row
      )
    ));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (assignMutation.isPending) return;

      const current = JSON.stringify(trays);
      if (current === lastSyncedRef.current) return;

      const prev: GermTrayColumn[] = JSON.parse(lastSyncedRef.current || '[]');
      const prevMap = new Map(prev.map((tray) => [tray.germinatorTrayId, tray]));

      // find the first changed tray only
      const changedTray = trays.find(
        (tray) => tray.germinatorId !== prevMap.get(tray.germinatorTrayId)?.germinatorId
      );

      if (!changedTray) return;

      assignMutation.mutate({
        germinatorTrayId: changedTray.germinatorTrayId,
        germinatorId: changedTray.germinatorId
      });

      lastSyncedRef.current = current;
    }, 1000);

    return () => clearInterval(interval);
  }, [trays, assignMutation]);

  const handleDeleteTrayClick = useCallback(
    (tray: GermTrayColumn) => setPendingDeleteTray(tray),
    []
  );
  const handleDeleteTestClick = useCallback(
    (test: GermTrayTestType) => setPendingDeleteTest(test),
    []
  );

  const germTrayColumns = useMemo(
    () => getGermTrayColumns(updateRow, handleDeleteTrayClick),
    [updateRow, handleDeleteTrayClick]
  );
  const germTrayTestsColumns = useMemo(
    () => getGermTrayTestsColumns(handleDeleteTestClick),
    [handleDeleteTestClick]
  );

  return (
    <FlexGrid className="consep-maintain-germ-tray">
      <Row className="consep-maintain-germ-tray-breadcrumb">
        <Breadcrumbs crumbs={BREAD_CRUMB_ITEMS} />
      </Row>
      <Row className="consep-maintain-germ-tray-title">
        <PageTitle title="Maintain germ tray" />
      </Row>
      {alert?.message && (
        <Row className="consep-maintain-germ-tray-alert">
          <InlineNotification
            lowContrast
            kind={alert.status}
            subtitle={alert?.message}
            onClose={() => setAlert(null)}
          />
        </Row>
      )}
      <Row className="consep-maintain-germ-tray-table">
        <GenericTable
          columns={germTrayColumns}
          data={trays}
          hideToolbar
          enablePagination
          onRowClick={handleTrayRowClick}
          initialState={{
            pagination: { pageSize: 5, pageIndex: 0 }
          }}
        />
      </Row>
      <Row className="consep-maintain-germ-tray-tests-table">
        <GenericTable
          columns={germTrayTestsColumns}
          data={(trayContentsQuery.data ?? [])}
          isLoading={trayContentsQuery.isLoading}
          hideToolbar
          enablePagination
          initialState={{
            pagination: { pageSize: 5, pageIndex: 0 }
          }}
        />
      </Row>
      <Modal
        open={pendingDeleteTray !== null}
        danger
        size="sm"
        modalHeading="Confirm deletion"
        primaryButtonText="Delete germ tray"
        secondaryButtonText="Back"
        onRequestSubmit={handleConfirmDeleteTray}
        onRequestClose={() => setPendingDeleteTray(null)}
      >
        <p>
          {`Please confirm you want to delete germination tray ${pendingDeleteTray?.germinatorTrayId}. This action cannot be undone.`}
        </p>
      </Modal>
      <Modal
        open={pendingDeleteTest !== null}
        danger
        modalHeading="Confirm deletion"
        primaryButtonText="Delete germ test"
        secondaryButtonText="Back"
        onRequestSubmit={handleConfirmDeleteTest}
        onRequestClose={() => setPendingDeleteTest(null)}
      >
        <p>
          {`Please confirm you want to delete germination test ID ${pendingDeleteTest?.requestId} for seedlot #${pendingDeleteTest?.seedlotNumber}. This action cannot be undone.`}
        </p>
      </Modal>
    </FlexGrid>
  );
};

export default MaintainGermTray;
