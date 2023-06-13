import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Row,
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
        setSeedlotsData(response.data.seedlotData);
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
    <FlexGrid>
      <Row className="my-seedlot-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlot')}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="my-seedlot-title">
        <PageTitle
          title={tableText.pageTitle}
          subtitle={tableText.pageSubtitle}
          enableFavourite
        />
        <Button
          kind="primary"
          onClick={() => { navigate('/seedlot/register-a-class'); }}
          size="md"
          className="btn-my-seedlot"
          renderIcon={Add}
        >
          {tableText.buttonText}
        </Button>
      </Row>
      <Row className="my-seedlot-data-table-row">
        {seedlotsData.length > 0 && <SeedlotDataTable seedlots={seedlotsData} /> }
      </Row>
    </FlexGrid>
  );
};

export default MySeedlots;
