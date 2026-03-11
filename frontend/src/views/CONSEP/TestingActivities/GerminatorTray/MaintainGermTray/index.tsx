import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FlexGrid, Row } from '@carbon/react';
import GenericTable from '../../../../../components/GenericTable';
import ROUTES from '../../../../../routes/constants';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import PageTitle from '../../../../../components/PageTitle';
import { assignGerminatorId } from '../../../../../api-service/consep/germinatorTrayAPI';
import { GermTrayCreateResponseType } from '../../../../../types/consep/GerminatorTrayType';
import { getGermTrayColumns } from './constants';
import { GermTrayColumn } from './definitions';
import './styles.scss';

const BREAD_CRUMB_ITEMS = [{ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES }];

const MaintainGermTray = () => {
  const location = useLocation();
  const [trays, setTrays] = useState<GermTrayColumn[]>([]);
  // const germinatorTrays = location.state?.germinatorTrays?.map(
  //   (tray: GermTrayCreateResponseType) => ({
  //     ...tray,
  //     germinatorId: ''
  //   })
  // ) ?? [];
  const germinatorTrays = [
    { activityTypeCd: 'G20', germinatorTrayId: 16962, actualStartDate: '2026-03-03T00:00:00' },
    { activityTypeCd: 'G10', germinatorTrayId: 16963, actualStartDate: '2026-03-03T00:00:00' },
    { activityTypeCd: 'G12', germinatorTrayId: 16964, actualStartDate: '2026-03-03T00:00:00' },
    { activityTypeCd: 'G11', germinatorTrayId: 16965, actualStartDate: '2026-03-03T00:00:00' },
    { activityTypeCd: 'G20', germinatorTrayId: 16966, actualStartDate: '2026-03-03T00:00:00' },
    { activityTypeCd: 'G10', germinatorTrayId: 16967, actualStartDate: '2026-03-03T00:00:00' }
  ].map((tray: GermTrayCreateResponseType) => ({
    ...tray,
    germinatorId: ''
  })) ?? [];

  const lastSyncedRef = useRef<string | null>(null);
  const assignMutation = useMutation({
    mutationFn: ({
      germinatorTrayId,
      germinatorId
    }: {
      germinatorTrayId: number;
      germinatorId: string;
    }) => assignGerminatorId(germinatorTrayId, germinatorId),
    onSuccess: () => {
      console.log('Germinator assigned');
    },
    onError: (error) => {
      console.error('Failed to assign germinator', error);
    }
  });

  useEffect(() => {
    setTrays(germinatorTrays);
    lastSyncedRef.current = JSON.stringify(germinatorTrays);
  }, [location.state]);

  const updateRow = (updatedRow: GermTrayCreateResponseType) => {
    setTrays((prev) => prev.map(
      (row) => (
        row.germinatorTrayId === updatedRow.germinatorTrayId
          ? { ...row, ...updatedRow }
          : row
      )
    ));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (assignMutation.isPending) return;

      const current = JSON.stringify(trays);

      if (current !== lastSyncedRef.current) {
        // find changed rows only
        const prev = JSON.parse(lastSyncedRef.current || '[]');

        trays.forEach((tray, index) => {
          if (tray.germinatorId !== prev[index]?.germinatorId) {
            if (tray.germinatorId) {
              assignMutation.mutate({
                germinatorTrayId: tray.germinatorTrayId,
                germinatorId: tray.germinatorId
              });
            }
          }
        });

        lastSyncedRef.current = current;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trays, assignMutation]);

  const germTrayColumns = useMemo(() => getGermTrayColumns(updateRow), []);

  return (
    <FlexGrid className="consep-maintain-germ-tray">
      <Row className="consep-maintain-germ-tray-breadcrumb">
        <Breadcrumbs crumbs={BREAD_CRUMB_ITEMS} />
      </Row>
      <Row className="consep-maintain-germ-tray-title">
        <PageTitle title="Maintain germ tray" />
      </Row>
      <Row className="consep-maintain-germ-tray-table">
        <GenericTable
          columns={germTrayColumns}
          data={germinatorTrays}
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
