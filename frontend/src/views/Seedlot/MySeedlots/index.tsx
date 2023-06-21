import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Row,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  FlexGrid,
  Button
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

import PageTitle from '../../../components/PageTitle';
import SeedlotDataTable from './SeedlotDataTable';

import api from '../../../api-service/api';
import ApiConfig from '../../../api-service/ApiConfig';
import Seedlot from '../../../types/Seedlot';

import './styles.scss';
import { tableText } from './constants';

const MySeedlots = () => {
  const navigate = useNavigate();

  const [seedlotsData, setSeedlotsData] = useState<Array<Seedlot>>([]);

  const getSeedlotsData = () => {
    const url = ApiConfig.seedlot;
    api.get(url)
      .then((response) => {
        setSeedlotsData(response.data.seedlotData.reverse());
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  useEffect(() => {
    getSeedlotsData();
  }, []);

  return (
    <FlexGrid fullWidth className="my-seedlot-content">
      <Row className="my-seedlot-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlot')}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="my-seedlot-title">
        <Column sm={4} md={6} lg={14} xlg={12}>
          <PageTitle
            title={tableText.pageTitle}
            subtitle={tableText.pageSubtitle}
            enableFavourite
            activity="My Seedlots"
          />
        </Column>
        <Column sm={4} md={2} lg={2} xlg={4}>
          <Button
            kind="primary"
            onClick={() => { navigate('/seedlot/register-a-class'); }}
            size="lg"
            className="btn-my-seedlot"
            renderIcon={Add}
          >
            {tableText.buttonText}
          </Button>
        </Column>
      </Row>
      <Row className="my-seedlot-data-table-row">
        {seedlotsData.length > 0 && <SeedlotDataTable seedlots={seedlotsData} /> }
      </Row>
    </FlexGrid>
  );
};

export default MySeedlots;
