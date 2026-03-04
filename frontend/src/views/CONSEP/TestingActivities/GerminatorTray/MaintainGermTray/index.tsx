import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FlexGrid, Row } from '@carbon/react';
import GenericTable from '../../../../../components/GenericTable';
import ROUTES from '../../../../../routes/constants';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import PageTitle from '../../../../../components/PageTitle';
import { GermTrayCreateResponseType } from '../../../../../types/consep/GerminatorTrayType';
import { getGermTrayColumns } from './constants';
import './styles.scss';

const BREAD_CRUMB_ITEMS = [{ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES }];

const MaintainGermTray = () => {
  const location = useLocation();
  const germTrayColumns = useMemo(() => getGermTrayColumns(), []);
  const germinatorTrays = location.state?.germinatorTrays?.map(
    (tray: GermTrayCreateResponseType) => ({
      ...tray,
      germinatorId: ''
    })
  ) ?? [];

  return (
    <FlexGrid className="consep-maintain-germ-tray">
      <Row className="consep-maintain-germ-tray-breadcrumb">
        <Breadcrumbs crumbs={BREAD_CRUMB_ITEMS} />
      </Row>
      <Row className="consep-maintain-germ-tray-title">
        <PageTitle title="Maintain germ tray" />
      </Row>
      <Row className="concep-maintain-germ-tray-table">
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
