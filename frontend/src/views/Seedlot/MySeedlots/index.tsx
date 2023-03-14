import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

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

import { useAuth } from '../../../contexts/AuthContext';
import getUrl from '../../../utils/ApiUtils';
import ApiAddresses from '../../../utils/ApiAddresses';
import Seedlot from '../../../types/Seedlot';

import './styles.scss';

const MySeedlots = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [seedlotsData, setSeedlotsData] = useState<Seedlot[]>();

  const getAxiosConfig = () => {
    const axiosConfig = {};
    if (token) {
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      Object.assign(axiosConfig, headers);
    }
    return axiosConfig;
  };

  const getSeedlotsData = () => {
    axios.get(getUrl(ApiAddresses.SeedlotRetrieveAll), getAxiosConfig())
      .then((response) => {
        setSeedlotsData(response.data.seedlotData);
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  getSeedlotsData();

  return (
    <FlexGrid>
      <Row className="my-seedlot-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlot')}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="my-seedlot-title">
        <PageTitle
          title="My Seedlots"
          subtitle="Check and manage my seedlots"
          favourite
        />
        <Button
          kind="primary"
          onClick={() => { navigate('/seedlot/register-a-class'); }}
          size="md"
          className="btn-my-seedlot"
          renderIcon={Add}
        >
          Register a new seedlot
        </Button>
      </Row>
      <Row className="my-seedlot-data-table-row">
        {seedlotsData && <SeedlotDataTable seedlots={seedlotsData} /> }
      </Row>
    </FlexGrid>
  );
};

export default MySeedlots;
