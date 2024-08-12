import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FlexGrid,
  Row,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  InlineNotification
} from '@carbon/react';

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { SeedlotApplicantType, SeedlotDisplayType, SeedlotType } from '../../../types/SeedlotType';

import PageTitle from '../../../components/PageTitle';
import ComboButton from '../../../components/ComboButton';
import useWindowSize from '../../../hooks/UseWindowSize';

import { getSeedlotById } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import { convertToApplicantInfoObj, covertRawToDisplayObj } from '../../../utils/SeedlotUtils';
import { getForestClientByNumberOrAcronym } from '../../../api-service/forestClientsAPI';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import { StatusOnSaveType } from '../../../api-service/tscAdminAPI';
import AuthContext from '../../../contexts/AuthContext';

import SeedlotSummary from './SeedlotSummary';
import ApplicantInformation from './ApplicantInformation';
import FormProgress from './FormProgress';
import TscReviewSection from './TscReviewSection';

import './styles.scss';

const SeedlotDetails = () => {
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const { isTscAdmin } = useContext(AuthContext);
  const { seedlotNumber } = useParams();
  const [searchParams] = useSearchParams();
  const [seedlotData, setSeedlotData] = useState<SeedlotDisplayType>();
  const [applicantData, setApplicantData] = useState<SeedlotApplicantType>();

  const isSubmitSuccess = searchParams.get('isSubmitSuccess') === 'true';

  const statusOnSave = searchParams.get('statusOnSave') as StatusOnSaveType | null;

  const manageOptions = [
    {
      text: 'Edit seedlot applicant',
      onClickFunction: () => navigate(addParamToPath(ROUTES.SEEDLOT_A_CLASS_EDIT, seedlotNumber ?? '')),
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
    queryFn: () => getVegCodes(),
    select: (data) => getMultiOptList(data, true, true),
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
    },
    select: (data) => data.seedlot
  });

  const getActBtnLabel = (): string => {
    if (isTscAdmin && seedlotData?.seedlotStatus === 'Submitted') {
      return 'Review seedlot';
    }
    if (seedlotData?.seedlotStatus === 'Submitted') {
      return 'View your seedlot';
    }
    return 'Edit seedlot form';
  };

  useEffect(() => {
    if (seedlotQuery.isFetched || seedlotQuery.isFetchedAfterMount || seedlotQuery.status === 'success') {
      covertToDisplayObj(seedlotQuery.data);
    }
  }, [seedlotQuery.isFetched, seedlotQuery.isFetchedAfterMount, seedlotQuery.status]);

  const applicantClientNumber = seedlotQuery.data?.applicantClientNumber;

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', applicantClientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(applicantClientNumber!),
    enabled: !!applicantClientNumber,
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
  }, [forestClientQuery.isFetched, seedlotQuery.isFetchedAfterMount, seedlotQuery.status]);

  return (
    <FlexGrid className="seedlot-details-page">
      <Row className="seedlot-details-breadcrumb">
        <Breadcrumbs crumbs={[
          { name: 'Seedlots', path: ROUTES.SEEDLOTS },
          { name: 'My seedlots', path: ROUTES.MY_SEEDLOTS }
        ]}
        />
      </Row>
      <Row className="page-title">
        <Column className={windowSize.innerWidth < MEDIUM_SCREEN_WIDTH ? 'summary-title-flex-col' : 'summary-title-flex-row'}>
          {
            seedlotQuery.isFetched
            && (
              <>
                <PageTitle
                  title={`Seedlot ${seedlotQuery.data?.id}`}
                  enableFavourite
                />
                <ComboButton
                  title={getActBtnLabel()}
                  items={manageOptions}
                  menuOptionsClass="edit-seedlot-form"
                  titleBtnFunc={() => navigate(addParamToPath(
                    isTscAdmin && seedlotData?.seedlotStatus !== 'Submitted'
                      ? ROUTES.SEEDLOT_A_CLASS_REVIEW
                      : ROUTES.SEEDLOT_A_CLASS_REGISTRATION,
                    seedlotNumber ?? ''
                  ))}
                />
              </>
            )
          }
        </Column>
      </Row>
      <Row>
        <Column>
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
                {
                  isSubmitSuccess && (seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'SUB')
                    ? (
                      <InlineNotification
                        className="seedlot-submitted-notification"
                        lowContrast
                        kind="success"
                        title="Submitted:"
                        subtitle="Your seedlot registration was submitted with success and is now under review by the TSC"
                      />
                    )
                    : null
                }
                {
                  statusOnSave === 'APP' && (seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'APP')
                    ? (
                      <InlineNotification
                        className="seedlot-submitted-notification"
                        lowContrast
                        kind="success"
                        title="Seedlot approved::"
                        subtitle="This seedlot have been reviewed and approved"
                      />
                    )
                    : null
                }
                {
                  statusOnSave === 'PND' && (seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'PND')
                    ? (
                      <InlineNotification
                        className="seedlot-submitted-notification"
                        lowContrast
                        kind="error"
                        title="Seedlot has been refused:"
                        subtitle="This seedlot has been refused by the TSC due to an issue on its form. Please, edit this seedlot and try submitting it again "
                      />
                    )
                    : null
                }
                <FormProgress
                  seedlotNumber={seedlotNumber}
                  seedlotStatusCode={seedlotQuery.data?.seedlotStatus.seedlotStatusCode}
                  getSeedlotQueryStatus={seedlotQuery.status}
                />
                <ApplicantInformation
                  seedlotNumber={seedlotNumber}
                  applicant={applicantData}
                  isFetching={forestClientQuery?.isFetching}
                />
                {
                  (
                    isTscAdmin
                    && seedlotData?.seedlotStatus !== 'Pending'
                    && seedlotData?.seedlotStatus !== 'Incomplete'
                  )
                    ? <TscReviewSection seedlotNumber={seedlotNumber ?? ''} />
                    : null
                }
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default SeedlotDetails;
