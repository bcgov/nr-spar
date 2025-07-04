import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Button, FlexGrid, Row,
  Column, Loading, Modal,
  InlineNotification
} from '@carbon/react';
import { toast } from 'react-toastify';
import {
  Edit, Save, Pending, Checkmark, Warning
} from '@carbon/icons-react';
import { Beforeunload } from 'react-beforeunload';

import { getSeedlotById, putAClassSeedlotProgress } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageTitle from '../../../components/PageTitle';
import RowGap from '../../../components/RowGap';
import ErrorToast from '../../../components/Toast/ErrorToast';
import ApplicantAndSeedlotRead from '../../../components/SeedlotReviewSteps/ApplicantAndSeedlot/Read';
import ApplicantAndSeedlotEdit from '../../../components/SeedlotReviewSteps/ApplicantAndSeedlot/Edit';
import { SeedlotPatchPayloadType, SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';
import { InitialSeedlotRegFormData } from '../CreateAClass/constants';
import CollectionReviewRead from '../../../components/SeedlotReviewSteps/Collection/Read';
import CollectionReviewEdit from '../../../components/SeedlotReviewSteps/Collection/Edit';
import OwnershipReviewRead from '../../../components/SeedlotReviewSteps/Ownership/Read';
import OwnershipReviewEdit from '../../../components/SeedlotReviewSteps/Ownership/Edit';
import InterimReviewRead from '../../../components/SeedlotReviewSteps/Interim/Read';
import InterimReviewEdit from '../../../components/SeedlotReviewSteps/Interim/Edit';
import OrchardReviewRead from '../../../components/SeedlotReviewSteps/Orchard/Read';
import OrchardReviewEdit from '../../../components/SeedlotReviewSteps/Orchard/Edit';
import ParentTreeReview from '../../../components/SeedlotReviewSteps/ParentTrees';
import AreaOfUseRead from '../../../components/SeedlotReviewSteps/AreaOfUse/Read';
import AreaOfUseEdit from '../../../components/SeedlotReviewSteps/AreaOfUse/Edit';
import ExtractionStorageReviewRead from '../../../components/SeedlotReviewSteps/ExtractionStorage/Read';
import ExtractionStorageReviewEdit from '../../../components/SeedlotReviewSteps/ExtractionStorage/Edit';
import AuditInfo from '../../../components/SeedlotReviewSteps/AuditInfo';

import {
  PutTscSeedlotMutationObj, putTscSeedlotWithStatus,
  updateSeedlotStatus
} from '../../../api-service/tscAdminAPI';
import {
  SeedPlanZoneDto, SeedlotReviewElevationLatLongDto,
  SeedlotReviewGeoInformationDto, SeedlotStatusCode, TscSeedlotEditPayloadType
} from '../../../types/SeedlotType';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import AuthContext from '../../../contexts/AuthContext';
import { GeneticTrait } from '../../../types/PtCalcTypes';
import { getSeedlotBreadcrumbs } from '../../../utils/BreadcrumbUtils';

import ClassAContext from '../ContextContainerClassA/context';
import { validateRegForm } from '../CreateAClass/utils';
import {
  getSeedlotPayload,
  initOwnershipState,
  validateCollectionStep, validateExtractionStep, validateInterimStep, validateOrchardStep,
  validateOwnershipStep, validateParentStep, verifyCollectionStepCompleteness,
  verifyExtractionStepCompleteness,
  verifyInterimStepCompleteness, verifyOrchardStepCompleteness, verifyOwnershipStepCompleteness,
  verifyParentStepCompleteness
} from '../ContextContainerClassA/utils';

import {
  validateAreaOfUse, validateCollectGeoVals,
  validateGeneticWorth
} from './utils';
import { GenWorthValType } from './definitions';
import { IS_DEV_FEATURE_ENABLED, SaveStatusModalText } from './constants';
import { completeProgressConfig, emptyOwnershipStep, initialProgressConfig } from '../ContextContainerClassA/constants';
import { AllStepData } from '../ContextContainerClassA/definitions';

const SeedlotReviewContent = () => {
  const navigate = useNavigate();
  /**
   * Back/Cancel button confirmation modal.
   */
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  /**
   * Save and send to pending/approved
   */
  const [isSaveStatusModalOpen, setIsSaveStatusModalOpen] = useState(false);

  const [statusToUpdateTo, setStatusToUpdateTo] = useState<SeedlotStatusCode>('PND');

  const { seedlotNumber } = useParams();

  const { isTscAdmin } = useContext(AuthContext);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: getVegCodes,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    enabled: vegCodeQuery.isFetched,
    refetchOnMount: true
  });

  useEffect(() => {
    const { status } = seedlotQuery;

    // Handle error
    if (status === 'error') {
      const err = seedlotQuery.error as AxiosError;
      // Handle 404
      if (err.response?.status === 404) {
        navigate('/404');
      }
    }
  }, [seedlotQuery.status]);

  // True if in view mode, false in edit mode.
  const [isReadMode, setIsReadMode] = useState(true);

  useEffect(() => {
    if (seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode === 'INC'
      || seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode === 'PND'
    ) {
      // Navigate back to the seedlot detail page if the seedlot is pending or incomplete
      navigate(`/seedlots/details/${seedlotNumber}`);
    }
  }, [seedlotNumber]);

  /**
   * Applicant info data, form data should be accessed through context.
   */
  const [
    applicantData,
    setApplicantData
  ] = useState<SeedlotRegFormType>(InitialSeedlotRegFormData);

  const {
    allStepData,
    genWorthVals,
    geoInfoVals,
    areaOfUseData,
    isFetchingData,
    seedlotData,
    genWorthInfoItems,
    seedlotSpecies,
    popSizeAndDiversityConfig
  } = useContext(ClassAContext);

  const verifyFormData = (): boolean => {
    let isValid = false;
    const focusOnInvalid = true;
    const focusOnIncomplete = true;
    const {
      collectionStep, ownershipStep, interimStep,
      orchardStep, parentTreeStep, extractionStorageStep
    } = allStepData;

    // Step 1: Applicant and Seedlot
    if (!validateRegForm(applicantData, setApplicantData)) {
      return isValid;
    }

    // Step 2: Collection
    if (validateCollectionStep(collectionStep, focusOnInvalid)) {
      return isValid;
    }
    if (!verifyCollectionStepCompleteness(collectionStep, focusOnIncomplete)) {
      return isValid;
    }

    // Step 3: Ownership
    if (validateOwnershipStep(ownershipStep, focusOnInvalid)) {
      return isValid;
    }
    if (!verifyOwnershipStepCompleteness(ownershipStep, focusOnIncomplete)) {
      return isValid;
    }

    // Step 4: Interim storage
    if (validateInterimStep(interimStep, focusOnInvalid)) {
      return isValid;
    }
    if (!verifyInterimStepCompleteness(interimStep, focusOnIncomplete)) {
      return isValid;
    }

    // Step 5: Orchard
    if (validateOrchardStep(orchardStep, focusOnInvalid)) {
      return isValid;
    }
    if (!verifyOrchardStepCompleteness(orchardStep, focusOnIncomplete)) {
      return isValid;
    }

    // Step 6: Parent Tree
    if (validateParentStep(parentTreeStep, focusOnInvalid)) {
      return isValid;
    }
    if (!verifyParentStepCompleteness(parentTreeStep, focusOnIncomplete)) {
      return isValid;
    }

    // Step 6-A: genetic worth values
    if (validateGeneticWorth(genWorthVals)) {
      return isValid;
    }

    // Step 6-B: geo info vals (collection lat long and effective pop size)
    if (validateCollectGeoVals(geoInfoVals)) {
      return isValid;
    }

    // Step 7: Area of Use
    if (validateAreaOfUse(areaOfUseData)) {
      return isValid;
    }

    // Step 8: Extraction
    if (validateExtractionStep(extractionStorageStep, focusOnInvalid)) {
      return isValid;
    }
    if (!verifyExtractionStepCompleteness(extractionStorageStep, focusOnIncomplete)) {
      return isValid;
    }

    isValid = true;
    return isValid;
  };

  const generatePayload = (): TscSeedlotEditPayloadType => {
    const regFormPayload = getSeedlotPayload(
      allStepData,
      seedlotNumber,
      seedlotSpecies.code,
      popSizeAndDiversityConfig
    );

    const applicantAndSeedlotInfo: SeedlotPatchPayloadType = {
      applicantEmailAddress: applicantData.email.value,
      seedlotSourceCode: applicantData.sourceCode.value,
      toBeRegistrdInd: applicantData.willBeRegistered.value,
      bcSourceInd: applicantData.isBcSource.value,
      revisionCount: seedlotData?.revisionCount
    };

    const seedlotReviewSeedPlanZones: SeedPlanZoneDto[] = [{
      code: areaOfUseData.primarySpz.value.code,
      description: areaOfUseData.primarySpz.value.description,
      isPrimary: true
    }];

    areaOfUseData.additionalSpzList.forEach((spz) => seedlotReviewSeedPlanZones.push({
      code: spz.value.code,
      description: spz.value.description,
      isPrimary: false
    }));

    const seedlotReviewElevationLatLong: SeedlotReviewElevationLatLongDto = {
      minElevation: Number(areaOfUseData.minElevation.value),
      maxElevation: Number(areaOfUseData.maxElevation.value),
      minLatitudeDeg: Number(areaOfUseData.minLatDeg.value),
      minLatitudeMin: Number(areaOfUseData.minLatMinute.value),
      minLatitudeSec: Number(areaOfUseData.minLatSec.value),
      maxLatitudeDeg: Number(areaOfUseData.maxLatDeg.value),
      maxLatitudeMin: Number(areaOfUseData.maxLatMinute.value),
      maxLatitudeSec: Number(areaOfUseData.maxLatSec.value),
      minLongitudeDeg: Number(areaOfUseData.minLongDeg.value),
      minLongitudeMin: Number(areaOfUseData.minLongMinute.value),
      minLongitudeSec: Number(areaOfUseData.minLongSec.value),
      maxLongitudeDeg: Number(areaOfUseData.maxLongDeg.value),
      maxLongitudeMin: Number(areaOfUseData.maxLongMinute.value),
      maxLongitudeSec: Number(areaOfUseData.maxLongSec.value),
      areaOfUseComment: areaOfUseData.comment.value
    };

    const seedlotReviewGeneticWorth: GeneticTrait[] = [];
    (Object.keys(genWorthVals) as (keyof GenWorthValType)[])
      .forEach((genWorthKey) => {
        if (genWorthVals[genWorthKey].value) {
          const upperCaseCode = genWorthKey.toUpperCase();
          seedlotReviewGeneticWorth.push({
            traitCode: upperCaseCode,
            calculatedValue: Number(genWorthVals[genWorthKey].value),
            testedParentTreePerc:
              genWorthInfoItems[genWorthKey]
                // Dividing by 100 since the current value is in percentage and we need
                // to submit the real value
                ? Number(genWorthInfoItems[genWorthKey][1].value) / 100
                : 0
          });
        }
      });

    const seedlotReviewGeoInformation: SeedlotReviewGeoInformationDto = {
      meanLatitudeDegree: Number(geoInfoVals.meanLatDeg.value),
      meanLatitudeMinute: Number(geoInfoVals.meanLatMinute.value),
      meanLatitudeSecond: Number(geoInfoVals.meanLatSec.value),
      meanLongitudeDegree: Number(geoInfoVals.meanLongDeg.value),
      meanLongitudeMinute: Number(geoInfoVals.meanLongMinute.value),
      meanLongitudeSecond: Number(geoInfoVals.meanLongSec.value),
      meanLatitude: 0,
      meanLongitude: 0,
      meanElevation: Number(geoInfoVals.meanElevation.value),
      effectivePopulationSize: Number(geoInfoVals.effectivePopSize.value)
    };

    return {
      ...regFormPayload,
      applicantAndSeedlotInfo,
      seedlotReviewSeedPlanZones,
      seedlotReviewElevationLatLong,
      seedlotReviewGeneticWorth,
      seedlotReviewGeoInformation
    };
  };

  const queryClient = useQueryClient();

  const tscSeedlotMutation = useMutation({
    mutationFn: (
      { seedlotNum, statusOnSave, payload }: PutTscSeedlotMutationObj
    ) => putTscSeedlotWithStatus(seedlotNum, statusOnSave, payload),
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Edit seedlot failed"
          subtitle={`Cannot save seedlot. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['seedlots', seedlotNumber] });
      await queryClient.invalidateQueries({ queryKey: ['seedlot-full-form', seedlotNumber] });
      setIsReadMode(true);
      if (variables.statusOnSave !== 'SUB') {
        navigate(`/seedlots/details/${seedlotNumber}/?statusOnSave=${variables.statusOnSave}`);
      }
    }
  });

  const statusOnlyMutation = useMutation({
    mutationFn: (
      { seedlotNum, statusOnSave }: Omit<PutTscSeedlotMutationObj, 'payload'>
    ) => updateSeedlotStatus(seedlotNum, statusOnSave),
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Edit seedlot failed"
          subtitle={`Cannot update seedlot. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['seedlots', seedlotNumber] });
      await queryClient.invalidateQueries({ queryKey: ['seedlot-full-form', seedlotNumber] });
      setIsReadMode(true);
      if (variables.statusOnSave !== 'SUB') {
        navigate(`/seedlots/details/${seedlotNumber}/?statusOnSave=${variables.statusOnSave}`);
      }
    }
  });

  /**
   * This is only used when we send SUB seedlots back to pending when
   * we migrate historical data from Oracle to Postgres. PND seedlots on Oracle
   * will come in as SUB, so we need to manually send them back to PND in order to
   * generate a draft json object in the seedlot_registration_a_class_save table.
   */
  const getAllStepDataForPayload = ():AllStepData => {
    const allData = { ...allStepData };
    if (allData.ownershipStep.length === 0) {
      const emptyOwner = initOwnershipState('', emptyOwnershipStep)[0];
      emptyOwner.ownerAgency.value = seedlotData?.applicantClientNumber ?? '';
      emptyOwner.ownerCode.value = seedlotData?.applicantLocationCode ?? '';
      allData.ownershipStep = [emptyOwner];
    }
    return allData;
  };

  const updateDraftMutation = useMutation({
    mutationFn: (
      // It will be used later at onSuccess
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _variables: PutTscSeedlotMutationObj
    ) => (
      putAClassSeedlotProgress(
        seedlotNumber!,
        {
          allStepData,
          progressStatus: completeProgressConfig,
          // We don't know the previous revision count
          revisionCount: -1
        }
      )
    ),
    onSuccess: (_data, variables) => {
      tscSeedlotMutation.mutate(variables);
    },
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Edit seedlot failed"
          subtitle={`Cannot save seedlot. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    retry: 0
  });

  /**
   * Used for handling migrated pending seedlots from oracle.
   */
  const createDraftForPendMutation = useMutation({
    mutationFn: () => (
      putAClassSeedlotProgress(
        seedlotNumber!,
        {
          allStepData: getAllStepDataForPayload(),
          progressStatus: initialProgressConfig,
          // We don't know the previous revision count
          revisionCount: -1
        }
      )
    ),
    onSuccess: () => {
      statusOnlyMutation.mutate({ seedlotNum: seedlotNumber!, statusOnSave: 'PND' });
    },
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Create draft for seedlot failed"
          subtitle={`Cannot create draft for seedlot. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    retry: 0
  });

  /**
   * The handler for the button that is floating on the bottom right.
   */
  const handleEditSaveBtn = () => {
    // If the form is in read mode, then enable edit mode only,
    // but wait for parent tree data to load first.
    if (isReadMode && Object.keys(allStepData.parentTreeStep.allParentTreeData).length > 0) {
      setIsReadMode(!isReadMode);
      return;
    }

    // Validate the form before Edit going to Read mode.
    const isFormDataValid = verifyFormData();

    if (isFormDataValid) {
      const payload = generatePayload();
      updateDraftMutation.mutate({
        seedlotNum: seedlotNumber!,
        statusOnSave: seedlotData?.seedlotStatus.seedlotStatusCode ?? 'SUB',
        payload
      });
      setIsReadMode(!isReadMode);
    }
  };

  /**
   * The handler for the send back to pending or approve buttons.
   */
  const handleSaveAndStatus = (statusOnSave: SeedlotStatusCode) => {
    if (isReadMode) {
      statusOnlyMutation.mutate({ seedlotNum: seedlotNumber!, statusOnSave });
    } else {
      const isFormDataValid = verifyFormData();
      if (isFormDataValid) {
        const payload = generatePayload();
        updateDraftMutation.mutate({ seedlotNum: seedlotNumber!, statusOnSave, payload });
      }
    }
  };

  const handleCancelClick = () => {
    if (isReadMode) {
      navigate(`/seedlots/details/${seedlotNumber}`);
    } else {
      setIsCancelModalOpen(true);
    }
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  const closeSaveStatusModal = () => {
    setIsSaveStatusModalOpen(false);
  };

  const openSaveStatusModal = (status: SeedlotStatusCode) => {
    setStatusToUpdateTo(status);
    setIsSaveStatusModalOpen(true);
  };

  /**
   * Discard changes without saving.
   */
  const discardChanges = () => {
    setIsReadMode(true);
    queryClient.refetchQueries(['seedlots', seedlotNumber]);
    queryClient.refetchQueries(['seedlot-full-form', seedlotNumber]);
    closeCancelModal();
  };

  /**
   * Custom blocker function to prevent navigation with unsaved changes.
   */
  const blockerFunction = () => {
    if (
      !isReadMode
      && !tscSeedlotMutation.isLoading
      && !statusOnlyMutation.isLoading
    ) {
      setIsCancelModalOpen(true); // Show modal if there are unsaved changes
      return true; // Block navigation
    }
    return false; // Allow navigation
  };

  useBlocker(blockerFunction);

  return (
    <FlexGrid className="seedlot-review-grid">
      <Loading
        active={
          updateDraftMutation.isLoading
          || tscSeedlotMutation.isLoading
          || isFetchingData
        }
      />

      <Button
        kind="secondary"
        size="md"
        className="edit-save-btn"
        renderIcon={isReadMode ? Edit : Save}
        onClick={handleEditSaveBtn}
      >
        {isReadMode ? 'Edit seedlot' : 'Save edit'}
      </Button>

      <Breadcrumbs
        crumbs={
          getSeedlotBreadcrumbs(
            seedlotNumber!,
            seedlotData?.applicantClientNumber!,
            isTscAdmin
          )
        }
      />
      <Row>
        <PageTitle
          title={`Review Seedlot ${seedlotQuery.data?.seedlot.id}`}
          subtitle={`${seedlotQuery.data?.seedlot.seedlotStatus.description} status`}
        />
      </Row>

      {
        seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode === 'APP'
          ? (
            <Row>
              <InlineNotification
                className="seedlot-approved-notification"
                lowContrast
                hideCloseButton
                kind="success"
                title="Seedlot approved:"
                subtitle="This seedlot have been reviewed and approved"
              />
            </Row>
          )
          : null
      }

      <Row className="section-title-row">
        <Column className="section-title-col">
          Applicant and seedlot
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <ApplicantAndSeedlotRead />
              : (
                <ApplicantAndSeedlotEdit
                  applicantData={applicantData}
                  setApplicantData={setApplicantData}
                />
              )
          }
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Collection
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <CollectionReviewRead />
              : (
                <CollectionReviewEdit />
              )
          }
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Ownership
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <OwnershipReviewRead />
              : (
                <OwnershipReviewEdit />
              )
          }
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Interim storage
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <InterimReviewRead />
              : <InterimReviewEdit />
          }
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Orchard
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <OrchardReviewRead />
              : (
                <OrchardReviewEdit />
              )
          }
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Parent tree and SMP
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          <ParentTreeReview isRead={isReadMode} />
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Area of use
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <AreaOfUseRead />
              : <AreaOfUseEdit />
          }
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Extraction and storage information
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <ExtractionStorageReviewRead />
              : (
                <ExtractionStorageReviewEdit />
              )
          }
        </Column>
      </Row>

      <RowGap />

      <Row className="section-title-row">
        <Column className="section-title-col">
          Audit history
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          <AuditInfo />
        </Column>
      </Row>
      {
        seedlotData?.seedlotStatus.seedlotStatusCode === 'SUB'
          ? (
            <Row className="action-button-row">
              <Column sm={4} md={4} lg={4}>
                <Button
                  kind="secondary"
                  onClick={handleCancelClick}
                >
                  {isReadMode ? 'Back' : 'Back to review'}
                </Button>
              </Column>

              <Column className="action-button-col" sm={4} md={4} lg={4}>
                <Button
                  kind="secondary"
                  renderIcon={Pending}
                  onClick={() => openSaveStatusModal('PND')}
                >
                  Send back to pending
                </Button>
              </Column>
              <Column className="action-button-col" sm={4} md={4} lg={4}>
                <Button
                  renderIcon={Checkmark}
                  onClick={() => openSaveStatusModal('APP')}
                >
                  Approve seedlot
                </Button>
              </Column>
            </Row>
          )
          : null
      }
      {
        // this and its related code such as createDraftForPendMutation
        // needs to be deleted in the future
        IS_DEV_FEATURE_ENABLED
          ? (
            <Row className="action-button-row">
              <Column className="action-button-col" sm={4} md={4} lg={8}>
                <Button
                  kind="danger"
                  renderIcon={Warning}
                  onClick={() => createDraftForPendMutation.mutate()}
                >
                  Historical SUB to PND (DEV ONLY!)
                </Button>
              </Column>
            </Row>
          )
          : null
      }

      {/* Cancel Confirm Modal */}

      <Modal
        className="cancel-confirm-modal"
        open={isCancelModalOpen}
        modalHeading="Seedlot review"
        onRequestClose={closeCancelModal}
        passiveModal
      >
        <div className="modal-content">
          <h5 className="modal-header">
            Any changes you made will be discarded unless saved.
          </h5>
          <div className="modal-button-group">
            <Button kind="secondary" onClick={discardChanges}>Discard changes</Button>
            <Button
              kind="primary"
              onClick={() => {
                closeCancelModal();
                handleEditSaveBtn();
              }}
              renderIcon={Save}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Save and update status confirm modal */}

      <Modal
        className="save-and-update-confirm-modal"
        open={isSaveStatusModalOpen}
        modalHeading={`Review seedlot ${seedlotNumber}`}
        onRequestClose={closeSaveStatusModal}
        passiveModal
      >
        <div className="modal-content">
          {
              statusToUpdateTo === 'PND'
                ? (
                  <div className="modal-text">
                    {SaveStatusModalText.pendingHeader}
                    {SaveStatusModalText.pendingBody}
                  </div>
                )
                : (
                  <div className="modal-text">{SaveStatusModalText.approveHeader}</div>
                )
            }
          <div className="modal-button-group">
            <Button kind="secondary" onClick={closeSaveStatusModal}>Cancel</Button>
            {
              statusToUpdateTo === 'PND'
                ? (
                  <Button
                    kind="primary"
                    onClick={() => {
                      closeSaveStatusModal();
                      handleSaveAndStatus('PND');
                    }}
                    disabled={tscSeedlotMutation.isLoading || updateDraftMutation.isLoading}
                  >
                    Send back to pending
                  </Button>
                )
                : (
                  <Button
                    kind="primary"
                    onClick={() => {
                      closeSaveStatusModal();
                      handleSaveAndStatus('APP');
                    }}
                    renderIcon={Checkmark}
                    disabled={tscSeedlotMutation.isLoading || updateDraftMutation.isLoading}
                  >
                    Approve seedlot
                  </Button>
                )
            }
          </div>
        </div>
      </Modal>
      {
        !isReadMode
        && (
        <Beforeunload onBeforeunload={(event) => event.preventDefault()} />
        )
      }
    </FlexGrid>
  );
};

export default SeedlotReviewContent;
