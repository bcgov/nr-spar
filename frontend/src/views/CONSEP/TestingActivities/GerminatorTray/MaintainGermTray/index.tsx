import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FlexGrid, Row, InlineNotification } from '@carbon/react';
import GenericTable from '../../../../../components/GenericTable';
import ROUTES from '../../../../../routes/constants';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import PageTitle from '../../../../../components/PageTitle';
import { assignGerminatorId, getGerminatorTrayContents } from '../../../../../api-service/consep/germinatorTrayAPI';
import { GermTrayCreateResponseType } from '../../../../../types/consep/GerminatorTrayType';
import { getGermTrayColumns, getGermTrayTestsColumns } from './constants';
import { GermTrayColumn } from './definitions';
import './styles.scss';

const BREAD_CRUMB_ITEMS = [{ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES }];

const MaintainGermTray = () => {
  const location = useLocation();
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

  const trayContentsQuery = useQuery({
    queryKey: ['germinatorTrayContents', selectedTrayId],
    queryFn: () => getGerminatorTrayContents(selectedTrayId!),
    enabled: selectedTrayId !== null
  });

  const handleTrayRowClick = useCallback((row: GermTrayColumn) => {
    setSelectedTrayId(row.germinatorTrayId);
  }, []);

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

  const germTrayColumns = useMemo(() => getGermTrayColumns(updateRow), [updateRow]);
  const germTrayTestsColumns = useMemo(() => getGermTrayTestsColumns(), []);

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
    </FlexGrid>
  );
};

export default MaintainGermTray;
