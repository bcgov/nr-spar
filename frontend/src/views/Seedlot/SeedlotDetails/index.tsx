import React, {
  useContext, useEffect, useMemo, useState
} from 'react';
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

import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { SeedlotStatusCode } from '../../../types/SeedlotType';

import PageTitle from '../../../components/PageTitle';
import ComboButton from '../../../components/ComboButton';
import ErrorToast from '../../../components/Toast/ErrorToast';
import useWindowSize from '../../../hooks/UseWindowSize';

import { downloadBClassRegistrationReport, getSeedlotById } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import { convertToApplicantInfoObj, covertRawToDisplayObj } from '../../../utils/SeedlotUtils';
import { openBlankTab, openBlobInNewTab } from '../../../utils/DownloadUtils';
import { getForestClientByNumberOrAcronym } from '../../../api-service/forestClientsAPI';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import { MEDIUM_SCREEN_WIDTH, MINISTRY_OF_FOREST_ID } from '../../../shared-constants/shared-constants';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import AuthContext from '../../../contexts/AuthContext';
import CopySeedlotModal from './CopySeedlotModal';

import SeedlotSummary from './SeedlotSummary';
import ApplicantInformation from './ApplicantInformation';
import FormProgress from './FormProgress';
import TscReviewSection from './TscReviewSection';
import { getPrintSeedlotLabel, isBClassSeedlot } from './utils';

import './styles.scss';

const SeedlotDetails = () => {
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const { isTscAdmin } = useContext(AuthContext);
  const { seedlotNumber } = useParams();
  const [searchParams] = useSearchParams();

  const isSubmitSuccess = searchParams.get('isSubmitSuccess') === 'true';

  const statusOnSave = searchParams.get('statusOnSave') as SeedlotStatusCode | null;

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: getVegCodes,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: vegCodeQuery.isFetched,
    refetchOnMount: true,
    select: (data) => data.seedlot
  });

  const seedlotData = useMemo(
    () => (vegCodeQuery.data && seedlotQuery.data
      ? covertRawToDisplayObj(seedlotQuery.data, vegCodeQuery.data)
      : undefined),
    [seedlotQuery.data, vegCodeQuery.data]
  );

  const viewOnlySeedlot: boolean = seedlotData?.seedlotStatus === 'Submitted'
    || seedlotData?.seedlotStatus === 'Expired'
    || seedlotData?.seedlotStatus === 'Complete'
    || seedlotData?.seedlotStatus === 'Approved';

  const isBClass = isBClassSeedlot(seedlotQuery.data);

  const downloadReportMutation = useMutation({
    mutationFn: () => downloadBClassRegistrationReport(seedlotNumber ?? ''),
    onMutate: () => ({ reportWindow: openBlankTab() }),
    onSuccess: (pdfBlob, _vars, context) => {
      openBlobInNewTab(
        pdfBlob,
        context?.reportWindow,
        `SPRR001-${seedlotNumber ?? 'seedlot'}.pdf`
      );
    },
    onError: (err: AxiosError, _vars, context) => {
      context?.reportWindow?.close();
      toast.error(
        <ErrorToast
          title="Download failed"
          subtitle={`Cannot generate the SPRR001 report. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    }
  });

  const manageOptions = useMemo(() => [
    {
      text: 'Edit seedlot applicant',
      onClickFunction: () => navigate(addParamToPath(ROUTES.SEEDLOT_A_CLASS_EDIT, seedlotNumber ?? '')),
      disabled: viewOnlySeedlot
    },
    {
      text: getPrintSeedlotLabel(isBClass, downloadReportMutation.isPending),
      onClickFunction: () => downloadReportMutation.mutate(),
      disabled: !isBClass || downloadReportMutation.isPending
    },
    {
      text: 'Duplicate seedlot',
      onClickFunction: () => setIsCopyModalOpen(true),
      disabled: !isTscAdmin
    },
    {
      text: 'Delete seedlot',
      onClickFunction: () => null,
      disabled: true
    }
  ], [
    navigate, seedlotNumber, viewOnlySeedlot, isBClass, isTscAdmin, downloadReportMutation
  ]);

  const getActBtnLabel = (): string => {
    if (isTscAdmin && seedlotData?.seedlotStatus === 'Submitted') {
      return 'Review seedlot';
    }
    if (viewOnlySeedlot) {
      return 'View your seedlot';
    }
    return 'Edit seedlot form';
  };

  useEffect(() => {
    if (seedlotQuery.error instanceof AxiosError && seedlotQuery.error.response?.status === 404) {
      navigate(ROUTES.FOUR_OH_FOUR);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedlotQuery.error]);

  const applicantClientNumber = seedlotQuery.data?.applicantClientNumber;

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', applicantClientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(applicantClientNumber!),
    enabled: !!applicantClientNumber,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const applicantData = useMemo(
    () => (seedlotQuery.data && vegCodeQuery.data && forestClientQuery.data
      ? convertToApplicantInfoObj(seedlotQuery.data, vegCodeQuery.data, forestClientQuery.data)
      : undefined),
    [seedlotQuery.data, vegCodeQuery.data, forestClientQuery.data]
  );

  const createBreadcrumbItems = () => {
    const crumbsList = [];
    crumbsList.push({ name: 'Seedlots', path: ROUTES.SEEDLOTS });
    if (isTscAdmin && seedlotData?.applicantAgency !== MINISTRY_OF_FOREST_ID) {
      crumbsList.push({ name: 'Review Seedlots', path: ROUTES.TSC_SEEDLOTS_TABLE });
    } else {
      crumbsList.push({ name: 'My seedlots', path: ROUTES.MY_SEEDLOTS });
    }
    return crumbsList;
  };

  return (
    <FlexGrid className="seedlot-details-page">
      <Row className="seedlot-details-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
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
                  titleBtnFunc={() => {
                    let route = ROUTES.SEEDLOT_A_CLASS_REGISTRATION;
                    if (isTscAdmin && seedlotData?.seedlotStatus === 'Submitted') {
                      route = ROUTES.SEEDLOT_A_CLASS_REVIEW;
                    }
                    navigate(addParamToPath(route, seedlotNumber ?? ''));
                  }}
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
                        title="Seedlot approved:"
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
                  isFetching={seedlotQuery.isFetching || forestClientQuery.isFetching}
                  hideEditButton={!isTscAdmin && viewOnlySeedlot}
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
      <CopySeedlotModal
        open={isCopyModalOpen}
        seedlotNumber={seedlotNumber ?? ''}
        onClose={() => setIsCopyModalOpen(false)}
      />
    </FlexGrid>
  );
};

export default SeedlotDetails;
