import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Button, FlexGrid, Row,
  Column, Loading, Modal,
  InlineNotification
} from '@carbon/react';
import { toast } from 'react-toastify';
import {
  Edit, Save, Pending, Checkmark
} from '@carbon/icons-react';
import { Beforeunload } from 'react-beforeunload';

import { putBClassSeedlot } from '../../../api-service/seedlotAPI';
import getBecCatalogue from '../../../api-service/becCatalogueAPI';
import { updateSeedlotStatus } from '../../../api-service/tscAdminAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageTitle from '../../../components/PageTitle';
import RowGap from '../../../components/RowGap';
import ErrorToast from '../../../components/Toast/ErrorToast';
import BClassCollectionStep from '../../../components/SeedlotRegistrationSteps/BClassCollectionStep';
import OwnershipStep from '../../../components/SeedlotRegistrationSteps/OwnershipStep';
import InterimStep from '../../../components/SeedlotRegistrationSteps/InterimStep';
import ExtractionAndStorage from '../../../components/SeedlotRegistrationSteps/ExtractionAndStorageStep';
import {
  SeedlotBClassSubmitType, SeedlotStatusCode
} from '../../../types/SeedlotType';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import AuthContext from '../../../contexts/AuthContext';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import { getSeedlotBreadcrumbs } from '../../../utils/BreadcrumbUtils';

import ClassBContext from '../ContextContainerClassB/context';
import { SaveStatusModalText } from '../SeedlotReview/constants';

import ApplicantAndSeedlotRead from './read/ApplicantAndSeedlotRead';
import CollectionRead from './read/CollectionRead';
import OwnershipRead from './read/OwnershipRead';
import InterimRead from './read/InterimRead';
import ExtractionStorageRead from './read/ExtractionStorageRead';
import AreaOfUseRead from './read/AreaOfUseRead';
import { buildBClassReviewPayload, validateBClassReviewForm } from './utils';

type SaveMutationVars = {
  payload: SeedlotBClassSubmitType,
  statusAfterSave: SeedlotStatusCode | null
};

const ReviewContent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isTscAdmin } = useContext(AuthContext);

  const {
    seedlotNumber,
    seedlotData,
    richSeedlotData,
    allStepData,
    isFetchingData,
    isFormReady,
    fundingSourcesQuery,
    methodsOfPaymentQuery
  } = useContext(ClassBContext);

  // True if in view mode, false in edit mode.
  const [isReadMode, setIsReadMode] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSaveStatusModalOpen, setIsSaveStatusModalOpen] = useState(false);
  const [statusToUpdateTo, setStatusToUpdateTo] = useState<SeedlotStatusCode>('PND');

  const statusCode = seedlotData?.seedlotStatus.seedlotStatusCode;

  useEffect(() => {
    // Pending and incomplete seedlots are edited through the registration wizard
    if (statusCode === 'INC' || statusCode === 'PND') {
      navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? ''));
    }
  }, [statusCode]);

  const becCatalogueQuery = useQuery({
    queryKey: ['bec-catalogue'],
    queryFn: getBecCatalogue,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const canEdit = isTscAdmin && (statusCode === 'SUB' || statusCode === 'APP');

  const statusOnlyMutation = useMutation({
    mutationFn: (statusOnSave: SeedlotStatusCode) => (
      updateSeedlotStatus(seedlotNumber!, statusOnSave)
    ),
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Status update failed"
          subtitle={`Cannot update seedlot status. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    onSuccess: async (_data, statusOnSave) => {
      await queryClient.invalidateQueries({ queryKey: ['seedlots', seedlotNumber] });
      await queryClient.invalidateQueries({ queryKey: ['seedlot-b-class-full-form', seedlotNumber] });
      setIsReadMode(true);
      navigate(`${addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? '')}?statusOnSave=${statusOnSave}`);
    }
  });

  const saveEditMutation = useMutation({
    mutationFn: (
      { payload }: SaveMutationVars
    ) => putBClassSeedlot(seedlotNumber ?? '', payload),
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
      if (variables.statusAfterSave) {
        statusOnlyMutation.mutate(variables.statusAfterSave);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['seedlots', seedlotNumber] });
      await queryClient.invalidateQueries({ queryKey: ['seedlot-b-class-full-form', seedlotNumber] });
      setIsReadMode(true);
    }
  });

  const isSaving = saveEditMutation.isPending || statusOnlyMutation.isPending;

  const verifyFormData = (): boolean => {
    const isValid = validateBClassReviewForm(allStepData, becCatalogueQuery.data);
    if (!isValid) {
      toast.error(
        <ErrorToast
          title="Invalid or missing fields"
          subtitle="Please make sure all fields on the form are filled in correctly before saving."
        />,
        ErrToastOption
      );
    }
    return isValid;
  };

  /**
   * Saves current edits. When statusAfterSave is provided, the seedlot
   * status is updated right after a successful save. The b-class submission
   * endpoint sets the status back to submitted, so an approved seedlot
   * that is edited needs to be set back to approved.
   */
  const saveEdits = (statusAfterSave: SeedlotStatusCode | null = null) => {
    if (!verifyFormData()) {
      return;
    }
    const payload = buildBClassReviewPayload(allStepData, richSeedlotData);
    saveEditMutation.mutate({
      payload,
      statusAfterSave: statusAfterSave ?? (statusCode === 'APP' ? 'APP' : null)
    });
  };

  /**
   * The handler for the button that is floating on the bottom right.
   */
  const handleEditSaveBtn = () => {
    if (isReadMode) {
      setIsReadMode(false);
      return;
    }
    saveEdits();
  };

  /**
   * The handler for the send back to pending or approve buttons.
   */
  const handleSaveAndStatus = (statusOnSave: SeedlotStatusCode) => {
    if (isReadMode) {
      statusOnlyMutation.mutate(statusOnSave);
    } else {
      saveEdits(statusOnSave);
    }
  };

  const handleCancelClick = () => {
    if (isReadMode) {
      navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? ''));
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
    queryClient.refetchQueries({ queryKey: ['seedlots', seedlotNumber] });
    queryClient.refetchQueries({ queryKey: ['seedlot-b-class-full-form', seedlotNumber] });
    closeCancelModal();
  };

  /**
   * Custom blocker function to prevent navigation with unsaved changes.
   */
  const blockerFunction = () => {
    if (!isReadMode && !isSaving) {
      setIsCancelModalOpen(true);
      return true;
    }
    return false;
  };

  useBlocker(blockerFunction);

  return (
    <FlexGrid className="seedlot-review-grid">
      <Loading
        active={isSaving || isFetchingData || !isFormReady}
      />

      {
        canEdit
          ? (
            <Button
              kind="secondary"
              size="md"
              className="edit-save-btn"
              renderIcon={isReadMode ? Edit : Save}
              onClick={handleEditSaveBtn}
            >
              {isReadMode ? 'Edit seedlot' : 'Save edit'}
            </Button>
          )
          : null
      }

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
          title={`Review Seedlot ${seedlotNumber}`}
          subtitle={`${seedlotData?.seedlotStatus.description ?? ''} status`}
        />
      </Row>

      {
        statusCode === 'APP'
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
          <ApplicantAndSeedlotRead />
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
              ? <CollectionRead />
              : <BClassCollectionStep isReview />
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
              ? <OwnershipRead />
              : (
                <FlexGrid className="sub-section-grid">
                  <OwnershipStep
                    isReview
                    fundingSourcesQuery={fundingSourcesQuery}
                    methodsOfPaymentQuery={methodsOfPaymentQuery}
                  />
                </FlexGrid>
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
              ? <InterimRead />
              : (
                <FlexGrid className="sub-section-grid">
                  <InterimStep isReview />
                </FlexGrid>
              )
          }
        </Column>
      </Row>

      <RowGap />

      {
        isTscAdmin
          ? (
            <>
              <Row className="section-title-row">
                <Column className="section-title-col">
                  Area of use
                </Column>
              </Row>
              <Row className="section-row">
                <Column>
                  <AreaOfUseRead />
                </Column>
              </Row>

              <RowGap />
            </>
          )
          : null
      }

      <Row className="section-title-row">
        <Column className="section-title-col">
          Extraction and storage information
        </Column>
      </Row>
      <Row className="section-row">
        <Column>
          {
            isReadMode
              ? <ExtractionStorageRead />
              : (
                <FlexGrid className="sub-section-grid">
                  <ExtractionAndStorage isReview />
                </FlexGrid>
              )
          }
        </Column>
      </Row>

      <Row className="action-button-row">
        <Column sm={4} md={4} lg={4}>
          <Button
            kind="secondary"
            onClick={handleCancelClick}
          >
            {isReadMode ? 'Back' : 'Back to review'}
          </Button>
        </Column>
        {
          isTscAdmin && statusCode === 'SUB'
            ? (
              <>
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
              </>
            )
            : null
        }
      </Row>

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
                    disabled={isSaving}
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
                    disabled={isSaving}
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

export default ReviewContent;
