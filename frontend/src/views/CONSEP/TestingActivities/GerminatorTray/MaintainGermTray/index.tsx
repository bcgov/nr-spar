import React, {
  useMemo,
  useState,
  useCallback
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FlexGrid,
  Row,
  InlineNotification,
  Modal,
  Button,
  TextInput
} from '@carbon/react';
import GenericTable from '../../../../../components/GenericTable';
import ROUTES from '../../../../../routes/constants';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import PageTitle from '../../../../../components/PageTitle';
import SummaryGrid, { SummaryColumn } from '../../../../../components/CONSEP/SummaryGrid';
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
import useAutosave from '../../../../../hooks/useAutosave';
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
  const [traySearch, setTraySearch] = useState('');
  const [selectedTrayId, setSelectedTrayId] = useState<number | null>(null);
  const [pendingDeleteTray, setPendingDeleteTray] = useState<GermTrayColumn | null>(null);
  const [pendingDeleteTest, setPendingDeleteTest] = useState<GermTrayTestType | null>(null);

  const trayContentsQuery = useQuery({
    queryKey: ['germinatorTrayContents', selectedTrayId],
    queryFn: () => getGerminatorTrayContents(selectedTrayId!),
    enabled: selectedTrayId !== null
  });

  const trayContentsErrorMessage = trayContentsQuery.isError
    ? ((trayContentsQuery.error as any)?.response?.data?.message
      || (trayContentsQuery.error as any)?.message
      || 'Failed to load tray contents')
    : null;

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

  useAutosave<GermTrayColumn[]>({
    data: trays,
    enabled: !assignMutation.isPending,
    onSave: async (curr, prev) => {
      const prevMap = new Map(
        (prev ?? []).map((tray) => [tray.germinatorTrayId, tray.germinatorId])
      );

      const updates = curr
        .filter((tray) => tray.germinatorId !== prevMap.get(tray.germinatorTrayId))
        .map((tray) => ({
          germinatorTrayId: tray.germinatorTrayId,
          germinatorId: tray.germinatorId
        }));

      if (updates.length === 0) return;

      await updates.reduce<Promise<void>>(
        (promise, update) => promise.then(
          () => assignMutation.mutateAsync(update).then(() => undefined)
        ),
        Promise.resolve()
      );
    }
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

  const filteredTrays = useMemo(() => {
    const term = traySearch.trim().toLowerCase();
    if (!term) return trays;

    return trays.filter((row) => String(row.germinatorTrayId).toLowerCase().includes(term));
  }, [trays, traySearch]);

  type GermTraySummaryItem = {
    activity?: string;
    testResult?: string;
    seedlotNumber?: string;
    requestId?: string;
    species?: string;
  };

  const selectedTray = trays.find((tray) => tray.germinatorTrayId === selectedTrayId);
  const firstTrayTest = trayContentsQuery.data?.[0];

  const summaryItem: GermTraySummaryItem | undefined = selectedTrayId == null
    ? undefined
    : {
      activity: selectedTray?.activityTypeCd ?? '',
      testResult: firstTrayTest?.testCompleteInd === -1 ? 'Completed' : 'Pending',
      seedlotNumber: firstTrayTest?.seedlotNumber ?? '',
      requestId: firstTrayTest?.requestId ?? '',
      species: firstTrayTest?.vegetationSt ?? ''
    };

  const summaryColumns = useMemo<SummaryColumn<GermTraySummaryItem>[]>(() => ([
    {
      key: 'activity',
      label: 'Activity',
      renderValue: (d) => d?.activity ?? '',
      emphasize: true
    },
    {
      key: 'testResult',
      label: 'Test result',
      renderValue: (d) => d?.testResult ?? ''
    },
    {
      key: 'seedlotNumber',
      label: 'Seedlot#',
      renderValue: (d) => d?.seedlotNumber ?? ''
    },
    {
      key: 'requestId',
      label: 'Request ID',
      renderValue: (d) => d?.requestId ?? ''
    },
    {
      key: 'species',
      label: 'Species',
      renderValue: (d) => d?.species ?? ''
    }
  ]), []);

  const renderTrayActions = () => (
    <div className="consep-maintain-germ-tray-pagination-actions">
      <Button size="sm" kind="ghost">No filter</Button>
      <Button size="sm" kind="secondary">Search</Button>
    </div>
  );

  return (
    <FlexGrid className="consep-maintain-germ-tray">
      <Row className="consep-maintain-germ-tray-breadcrumb">
        <Breadcrumbs crumbs={BREAD_CRUMB_ITEMS} />
      </Row>
      <Row className="consep-maintain-germ-tray-title">
        <PageTitle title="Maintain germ tray" />
      </Row>
      {(alert?.message || trayContentsErrorMessage) && (
        <Row className="consep-maintain-germ-tray-alert">
          <InlineNotification
            lowContrast
            kind={alert?.status ?? 'error'}
            subtitle={alert?.message ?? trayContentsErrorMessage}
            onClose={() => setAlert(null)}
          />
        </Row>
      )}
      <Row className="consep-maintain-germ-tray-activity-summary">
        <SummaryGrid
          item={summaryItem}
          isFetching={trayContentsQuery.isLoading}
          columns={summaryColumns}
        />
      </Row>
      <Row className="consep-maintain-germ-tray-table">
        <GenericTable
          columns={germTrayColumns}
          data={filteredTrays}
          hideToolbar={false}
          renderTopToolbarCustomActions={() => (
            <div className="consep-maintain-germ-tray-search-toolbar">
              <div className="consep-maintain-germ-tray-table-topbar">
                <div className="consep-maintain-germ-tray-tests-title">Find germination tray:</div>
                <TextInput
                  id="find-germination-tray"
                  labelText=""
                  hideLabel
                  placeholder="Germ tray"
                  size="sm"
                  value={traySearch}
                  onChange={(e: any) => setTraySearch(e.target.value)}
                />
              </div>

              <div className="consep-maintain-germ-tray-table-topbar">
                <div className="consep-maintain-germ-tray-germ-entry-label">Germinator entry:</div>
                <TextInput
                  id="germinator-entry-filter"
                  labelText=""
                  hideLabel
                  placeholder="Germinator entry"
                  size="sm"
                />
              </div>
            </div>
          )}
          renderBottomToolbarCustomActions={renderTrayActions}
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
          hideToolbar={false}
          renderTopToolbarCustomActions={() => (<div className="consep-maintain-germ-tray-tests-title">Tray contents</div>)}
          renderBottomToolbarCustomActions={renderTrayActions}
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
      <Row className="consep-maintain-germ-tray-buttons">
        <div className="consep-maintain-germ-tray-left-buttons">
          <Button
            size="md"
            kind="tertiary"
          >
            Labels
          </Button>
          <Button
            size="md"
            kind="tertiary"
          >

            Comments
          </Button>
        </div>
        <Button
          size="md"
          kind="tertiary"
        >
          Remove Tray Contents
        </Button>
      </Row>
    </FlexGrid>
  );
};

export default MaintainGermTray;
