import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FlexGrid,
  Row,
  Column,
  Stack,
  Breadcrumb,
  BreadcrumbItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@carbon/react';

import Seedlot from '../../../types/Seedlot';
import SeedlotRegistration from '../../../types/SeedlotRegistration';

import { useAuth } from '../../../contexts/AuthContext';

import getUrl from '../../../utils/ApiUtils';
import ApiAddresses from '../../../utils/ApiAddresses';

import PageTitle from '../../../components/PageTitle';
import ComboButton from '../../../components/ComboButton';
import SeedlotSummary from '../../../components/SeedlotSummary';
import ApplicantSeedlotInformation from '../../../components/ApplicantSeedlotInformation';
import FormProgress from '../../../components/FormProgress';
import FormReview from '../../../components/FormReview';
import SeedlotActivityHistory from '../../../components/SeedlotActivityHistory';

import './styles.scss';

const manageOptions = [
  {
    text: 'Edit seedlot applicant',
    onClickFunction: () => null
  },
  {
    text: 'Print seedlot',
    onClickFunction: () => null
  },
  {
    text: 'Duplicate seedlot',
    onClickFunction: () => null
  },
  {
    text: 'Delete seedlot',
    onClickFunction: () => null
  }
];

const SeedlotDetails = () => {
  const { token } = useAuth();
  const { seedlot } = useParams();
  const [seedlotData, setSeedlotData] = useState<Seedlot>();
  const [seedlotApplicantData, setSeedlotApplicantData] = useState<SeedlotRegistration>();

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

  const getSeedlotData = () => {
    if (seedlot) {
      axios.get(getUrl(ApiAddresses.SeedlotRetrieveOne).replace(':seedlotnumber', seedlot), getAxiosConfig())
        .then((response) => {
          if (response.data.seedlot && response.data.seedlotApplicantInfo) {
            setSeedlotData(response.data.seedlot);
            setSeedlotApplicantData(response.data.seedlotApplicantInfo);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(`Error: ${error}`);
        });
    }
  };

  getSeedlotData();

  const navigate = useNavigate();
  return (
    <FlexGrid className="seedlot-details-page">
      <Row className="seedlot-details-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlot')}>Seedlots</BreadcrumbItem>
          <BreadcrumbItem>My seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Stack gap={6}>
        <Row className="seedlot-summary-title">
          {
            seedlotData
            && (
              <PageTitle
                title={`Seedlot ${seedlotData.number}`}
                subtitle="Check and manage this seedlot"
                favourite
              />
            )
          }
          <ComboButton title="Edit seedlot form" items={manageOptions} menuOptionsClass="edit-seedlot-form" />
        </Row>
        <section title="Seedlot Summary">
          <Row className="seedlot-summary-content">
            <Column sm={4}>
              {
                seedlotData
                && <SeedlotSummary seedlotData={seedlotData} />
              }
            </Column>
          </Row>
        </section>
        <section title="Seedlot Details">
          <Row className="seedlot-details-content">
            <Column sm={4}>
              <Tabs>
                <TabList aria-label="List of tabs">
                  <Tab>Seedlot Details</Tab>
                  <Tab>Activity history</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {
                      seedlotApplicantData
                      && <ApplicantSeedlotInformation seedlotApplicantData={seedlotApplicantData} />
                    }
                    {
                      seedlotData
                      && <FormProgress seedlotNumber={seedlotData.number} />
                    }
                    <FormReview />
                  </TabPanel>
                  <TabPanel>
                    <SeedlotActivityHistory />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Column>
          </Row>
        </section>
      </Stack>
    </FlexGrid>
  );
};

export default SeedlotDetails;
