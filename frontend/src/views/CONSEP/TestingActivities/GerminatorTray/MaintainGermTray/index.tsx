import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback
} from 'react';
import { useSearchParams } from 'react-router-dom';
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
  getGerminatorTrayContents,
  getGerminatorTraysByIds
} from '../../../../../api-service/consep/germinatorTrayAPI';
import {
  GermTrayDeleteContentType,
  GermTrayTestType,
  GermTrayType
} from '../../../../../types/consep/GerminatorTrayType';
import { getGermTrayColumns, getGermTrayTestsColumns } from './constants';
import { GermTrayColumn } from './definitions';
import useAutosave from '../../../../../hooks/useAutosave';
import SaveStatus from '../../../../../components/CONSEP/SaveStatus';
import useActivityConflict from '../../hooks/useActivityConflict';
import './styles.scss';

const BREAD_CRUMB_ITEMS = [{ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES }];

/** `?trayIds=1311,1312` → [1311, 1312]; anything that is not a positive integer is dropped. */
const parseTrayIds = (value: string | null): number[] => [...new Set(
  (value ?? '')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0)
)];

const toColumn = (tray: GermTrayType): GermTrayColumn => ({
  germinatorTrayId: tray.germinatorTrayId,
  activityTypeCd: tray.activityTypeCd,
  actualStartDate: tray.actualStartDate,
  germinatorId: tray.germinatorId ?? ''
});

/** What the server holds for a tray, as far as this page knows. */
type SavedTray = { germinatorId: string; revisionCount: number };

const MaintainGermTray = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const trayIdsParam = searchParams.get('trayIds');
  const trayIds = useMemo(() => parseTrayIds(trayIdsParam), [trayIdsParam]);
  const [alert, setAlert] = useState<{
    status: 'error' | 'info' | 'success' | 'warning';
    message: string;
  } | null>(null);
  const [trays, setTrays] = useState<GermTrayColumn[]>([]);
  // False until the trays are loaded: nothing is saved before there is a baseline.
  const [hydrated, setHydrated] = useState(false);
  // Per tray, the germinator id and revision count last confirmed by the server. Updated as
  // each PATCH succeeds, so a save that fails part way still locks the trays it already saved
  // on their new revision (#2856); the autosave baseline only moves when the whole save works.
  const savedTraysRef = useRef(new Map<number, SavedTray>());
  const [traySearch, setTraySearch] = useState('');
  const [selectedTrayId, setSelectedTrayId] = useState<number | null>(null);
  const [pendingDeleteTray, setPendingDeleteTray] = useState<GermTrayColumn | null>(null);
  const [pendingDeleteTest, setPendingDeleteTest] = useState<GermTrayTestType | null>(null);
  // A 409 here means a test's activity (stale updateTimestamp) or a tray (stale
  // revisionCount) changed under us.
  const { isConflict, markConflict, clearConflict } = useActivityConflict();

  const traysQuery = useQuery({
    queryKey: ['germinatorTrays', trayIds],
    queryFn: () => getGerminatorTraysByIds(trayIds),
    enabled: trayIds.length > 0
  });

  const traysErrorMessage = traysQuery.isError
    ? ((traysQuery.error as any)?.response?.data?.message
      || (traysQuery.error as any)?.message
      || 'Failed to load germination trays')
    : null;

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

  const assignMutation = useMutation({
    mutationFn: ({
      germinatorTrayId,
      germinatorId,
      revisionCount
    }: {
      germinatorTrayId: number;
      germinatorId: string;
      revisionCount: number;
    }) => assignGerminatorId(germinatorTrayId, germinatorId, revisionCount),
    // Failures show as SaveStatus "Not saved" (or the conflict state on 409), not as a toast.
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        markConflict();
      }
    }
  });

  const { status: saveStatus, flush, markSaved } = useAutosave<GermTrayColumn[]>({
    data: trays,
    enabled: hydrated,
    conflict: isConflict,
    onSave: async (curr) => {
      // Compare with what the server holds, not with the last snapshot: after a partial
      // failure the trays that did save are not sent again.
      const changed = curr.filter((tray) => {
        const saved = savedTraysRef.current.get(tray.germinatorTrayId);
        return saved !== undefined && tray.germinatorId !== saved.germinatorId;
      });

      // One at a time, each locked on the revision its tray is at when its turn comes.
      await changed.reduce<Promise<void>>(
        (promise, tray) => promise.then(async () => {
          const saved = savedTraysRef.current.get(tray.germinatorTrayId)!;
          const response = await assignMutation.mutateAsync({
            germinatorTrayId: tray.germinatorTrayId,
            germinatorId: tray.germinatorId,
            revisionCount: saved.revisionCount
          });
          savedTraysRef.current.set(tray.germinatorTrayId, {
            germinatorId: response.germinatorId ?? '',
            revisionCount: response.revisionCount
          });
        }),
        Promise.resolve()
      );
    }
  });

  // The loaded trays are the saved baseline, so loading them never PATCHes.
  const hydrate = (data: GermTrayType[]) => {
    const rows = data.map(toColumn);
    savedTraysRef.current = new Map(data.map((tray) => [
      tray.germinatorTrayId,
      { germinatorId: tray.germinatorId ?? '', revisionCount: tray.revisionCount }
    ]));
    setTrays(rows);
    markSaved(rows);
    setHydrated(true);
  };

  // Hydrate from the query only (first load and Reload); local edits must not reset it.
  useEffect(() => {
    if (traysQuery.data) {
      hydrate(traysQuery.data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traysQuery.data]);

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
      if (error?.response?.status === 409) {
        markConflict();
        return;
      }
      const message = error?.response?.data?.message || error?.message || 'Failed to remove test from tray';
      setAlert({ status: 'error', message });
    }
  });

  const deleteTrayMutation = useMutation({
    mutationFn: async (tray: GermTrayColumn) => {
      // Save a germinator id edit first, so the delete locks on the tray's latest revision.
      await flush();
      const saved = savedTraysRef.current.get(tray.germinatorTrayId);
      if (!saved) {
        throw new Error('Cannot delete: tray not loaded');
      }
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

      return deleteGerminatorTray(tray.germinatorTrayId, saved.revisionCount, deleteContents);
    },
    onSuccess: (_, tray) => {
      setAlert(null);
      setTrays((prev) => prev.filter((t) => t.germinatorTrayId !== tray.germinatorTrayId));
      savedTraysRef.current.delete(tray.germinatorTrayId);
      if (selectedTrayId === tray.germinatorTrayId) {
        setSelectedTrayId(null);
        queryClient.removeQueries({ queryKey: ['germinatorTrayContents', tray.germinatorTrayId] });
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        markConflict();
        return;
      }
      const message = error?.response?.data?.message || error?.message || 'Failed to delete tray';
      setAlert({ status: 'error', message });
    }
  });

  const handleReloadOnConflict = async () => {
    await Promise.all([
      // New germinator ids and revision counts; the hydrate effect applies them.
      trayIds.length > 0 ? traysQuery.refetch() : undefined,
      // 'all': deleting a tray reads its contents from cache even when that tray is not the
      // selected (active) one, so inactive entries need fresh timestamps too.
      queryClient.invalidateQueries({ queryKey: ['germinatorTrayContents'], refetchType: 'all' })
    ]);
    clearConflict();
  };

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

  const updateRow = useCallback((updatedRow: GermTrayColumn) => {
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
        <SaveStatus status={saveStatus} onRetry={flush} onReload={handleReloadOnConflict} />
      </Row>
      {(alert?.message || traysErrorMessage || trayContentsErrorMessage) && (
        <Row className="consep-maintain-germ-tray-alert">
          <InlineNotification
            lowContrast
            kind={alert?.status ?? 'error'}
            subtitle={alert?.message ?? traysErrorMessage ?? trayContentsErrorMessage}
            onClose={() => setAlert(null)}
          />
        </Row>
      )}
      {trayIds.length === 0 && (
        <Row className="consep-maintain-germ-tray-alert">
          <InlineNotification
            lowContrast
            hideCloseButton
            kind="info"
            subtitle="No germination trays to show. Create trays from the testing activities search."
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
          isLoading={traysQuery.isLoading}
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
