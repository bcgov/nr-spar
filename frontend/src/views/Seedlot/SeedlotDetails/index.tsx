import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { SeedlotApplicantType, SeedlotDisplayType, SeedlotType } from '../../../types/SeedlotType';

import PageTitle from '../../../components/PageTitle';
import ComboButton from '../../../components/ComboButton';
import SeedlotSummary from './SeedlotSummary';
import ApplicantInformation from './ApplicantInformation';
import FormProgress from './FormProgress';
import FormReview from '../../../components/FormReview';

import './styles.scss';
import { getSeedlotById } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import { convertToApplicantInfoObj, covertRawToDisplayObj } from '../../../utils/SeedlotUtils';
import { getForestClientByNumber } from '../../../api-service/forestClientsAPI';

const SeedlotDetails = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();
  const [seedlotData, setSeedlotData] = useState<SeedlotDisplayType>();
  const [applicantData, setApplicantData] = useState<SeedlotApplicantType>();

  const manageOptions = [
    {
      text: 'Edit seedlot applicant',
      onClickFunction: () => navigate(`/seedlots/edit-a-class-application/${seedlotNumber}`),
      disabled: false
    },
    {
      text: 'Print seedlot',
      onClickFunction: () => null,
      disabled: true
    },
    {
      text: 'Duplicate seedlot',
      onClickFunction: () => null,
      disabled: true
    },
    {
      text: 'Delete seedlot',
      onClickFunction: () => null,
      disabled: true
    }
  ];

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const covertToDisplayObj = (seedlot?: SeedlotType) => {
    if (vegCodeQuery.data && seedlot) {
      const converted = covertRawToDisplayObj(seedlot, vegCodeQuery.data);
      setSeedlotData(converted);
    }
  };

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: vegCodeQuery.isFetched,
    refetchOnMount: true,
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        navigate('/404');
      }
    }
  });

  useEffect(() => {
    if (seedlotQuery.isFetched || seedlotQuery.isFetchedAfterMount) {
      covertToDisplayObj(seedlotQuery.data);
    }
  }, [seedlotQuery.isFetched, seedlotQuery.isFetchedAfterMount]);

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', seedlotQuery.data?.applicantClientNumber],
    queryFn: () => getForestClientByNumber(seedlotQuery.data?.applicantClientNumber),
    enabled: seedlotQuery.isFetched,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const covertToClientObj = () => {
    if (seedlotQuery.data && vegCodeQuery.data && forestClientQuery.data) {
      const converted = convertToApplicantInfoObj(
        seedlotQuery.data,
        vegCodeQuery.data,
        forestClientQuery.data
      );
      setApplicantData(converted);
    }
  };

  useEffect(() => {
    if (forestClientQuery.isFetched && seedlotQuery.isFetchedAfterMount) {
      covertToClientObj();
    }
  }, [forestClientQuery.isFetched, seedlotQuery.isFetchedAfterMount]);

  return (
    <FlexGrid className="seedlot-details-page">
      <Row className="seedlot-details-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlots')}>Seedlots</BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate('/seedlots/my-seedlots')}>My seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Stack gap={6}>
        <Row className="seedlot-summary-title">
          <Column sm={4} md={6} lg={14} xlg={12}>
            {
              seedlotQuery.isFetched
              && (
                <PageTitle
                  title={`Seedlot ${seedlotQuery.data?.id}`}
                  subtitle="Check and manage this seedlot"
                  enableFavourite
                />
              )
            }
          </Column>
          <Column sm={4} md={2} lg={2} xlg={4}>
            <ComboButton
              title="Edit seedlot form"
              items={manageOptions}
              menuOptionsClass="edit-seedlot-form"
              titleBtnFunc={() => navigate(`/seedlots/a-class-registration/${seedlotNumber}`)}
            />
          </Column>
        </Row>

        <Row className="seedlot-summary-content">
          <Column sm={4}>
            <SeedlotSummary seedlot={seedlotData} isFetching={seedlotQuery.isFetching} />
          </Column>
        </Row>

        <Row className="seedlot-details-content">
          <Column>
            <Tabs>
              <TabList aria-label="List of tabs">
                <Tab>Seedlot Details</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormProgress
                    seedlotNumber={seedlotNumber}
                    isFetching={seedlotQuery.isFetching}
                  />
                  <ApplicantInformation
                    seedlotNumber={seedlotNumber}
                    applicant={applicantData}
                    isFetching={forestClientQuery?.isFetching}
                  />
                  <FormReview />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
        </Row>

      </Stack>
    </FlexGrid>
  );
};

export default SeedlotDetails;
