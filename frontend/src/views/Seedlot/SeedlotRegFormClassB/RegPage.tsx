import React, { useContext } from 'react';
import {
  Button,
  FlexGrid,
  Row,
  Column,
  Grid,
  InlineLoading,
  InlineNotification,
  ActionableNotification,
  Loading,
  ProgressIndicatorSkeleton
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import Breadcrumbs from '../../../components/Breadcrumbs';
import PageTitle from '../../../components/PageTitle';
import SeedlotRegistrationProgressClassB from '../../../components/SeedlotRegistrationProgressClassB';
import SaveTooltipLabel from '../SeedlotRegFormClassA/SaveTooltip';
import SubmitModal from '../../../components/SeedlotRegistrationSteps/SubmitModal';
import RegForm from './RegForm';
import AuthContext from '../../../contexts/AuthContext';
import ClassBContext from '../ContextContainerClassB/context';
import { getSeedlotSubmitErrDescription } from '../ContextContainerClassA/utils';
import { addParamToPath } from '../../../utils/PathUtils';
import { getSeedlotBreadcrumbs } from '../../../utils/BreadcrumbUtils';
import { ErrorDescriptionType } from '../../../types/ErrorDescriptionType';
import ROUTES from '../../../routes/constants';
import { completeProgressConfig, smartSaveText } from '../ContextContainerClassB/constants';
import {
  getBClassSubmitErrDescription,
  groupSubmitFieldErrorsByStep
} from '../ContextContainerClassB/utils';

import './styles.scss';

const isEditableStatus = (statusCode?: string) => statusCode === 'PND' || statusCode === 'INC';

const getSubmitErrDescription = (
  submitError: AxiosError | null
): ErrorDescriptionType | null => {
  const submitFieldErrors = groupSubmitFieldErrorsByStep(submitError);
  if (submitFieldErrors) {
    return getBClassSubmitErrDescription(submitFieldErrors);
  }
  return submitError ? getSeedlotSubmitErrDescription(submitError) : null;
};

const SubmitErrorNotification = (
  { errDescription }: { errDescription: ErrorDescriptionType | null }
) => {
  if (!errDescription) {
    return null;
  }
  return (
    <Row>
      <Column>
        <InlineNotification
          lowContrast
          kind="error"
          title={errDescription.title}
          subtitle={errDescription.description}
        />
      </Column>
    </Row>
  );
};

type SaveErrorNotificationProps = {
  saveStatus: string;
  reloadFormDraft: () => void;
  handleSaveBtn: () => void;
};

const SaveErrorNotification = (
  { saveStatus, reloadFormDraft, handleSaveBtn }: SaveErrorNotificationProps
) => {
  if (saveStatus === 'conflict') {
    return (
      <ActionableNotification
        className="save-conflict-actionable-notification"
        lowContrast
        kind="error"
        title={`${smartSaveText.conflictTitle}`}
        subtitle={smartSaveText.conflictSuggestion}
        actionButtonLabel={smartSaveText.reload}
        onActionButtonClick={reloadFormDraft}
      />
    );
  }
  return (
    <ActionableNotification
      className="save-error-actionable-notification"
      lowContrast
      kind="error"
      title={`${smartSaveText.error}:\u00A0`}
      subtitle={smartSaveText.suggestion}
      actionButtonLabel={smartSaveText.idle}
      onActionButtonClick={handleSaveBtn}
    />
  );
};

type BackOrCancelButtonProps = {
  isFirstStep: boolean;
  onBack: () => void;
  onCancel: () => void;
};

const BackOrCancelButton = ({ isFirstStep, onBack, onCancel }: BackOrCancelButtonProps) => (
  <Button
    kind="secondary"
    size="lg"
    className="form-action-btn"
    onClick={isFirstStep ? onCancel : onBack}
  >
    {isFirstStep ? 'Cancel' : 'Back'}
  </Button>
);

const NextButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    kind="primary"
    size="lg"
    className="form-action-btn"
    onClick={onClick}
    renderIcon={ArrowRight}
  >
    Next
  </Button>
);

const RegPage = () => {
  const navigate = useNavigate();
  const {
    allStepData,
    seedlotNumber,
    setStep,
    handleSaveBtn,
    formStep,
    isFormIncomplete,
    saveStatus,
    saveDescription,
    lastSaveTimestamp,
    allStepCompleted,
    progressStatus,
    updateProgressStatus,
    saveProgressStatus,
    isFetchingData,
    seedlotData,
    richSeedlotData,
    getFormDraftQuery,
    isFormReady,
    submitSeedlot,
    getBClassSeedlotPayload
  } = useContext(ClassBContext);

  const reloadFormDraft = () => getFormDraftQuery.refetch();

  const { isTscAdmin } = useContext(AuthContext);

  const isEditable = isEditableStatus(seedlotData?.seedlotStatus.seedlotStatusCode);
  const disableSubmit = !allStepCompleted || saveStatus === 'conflict' || !isEditable;

  const submitError = submitSeedlot.isError ? (submitSeedlot.error as AxiosError) : null;
  const submitErrDescription = getSubmitErrDescription(submitError);

  return (
    <div className="seedlot-registration-page">
      <FlexGrid fullWidth>
        <Row>
          <Column className="seedlot-registration-breadcrumb">
            <Breadcrumbs
              crumbs={
                getSeedlotBreadcrumbs(
                  seedlotNumber!,
                  seedlotData?.applicantClientNumber!,
                  isTscAdmin
                )
              }
            />
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-title">
            <PageTitle
              title="Seedlot registration"
              subtitle={(
                <div className="seedlot-form-subtitle">
                  {
                    seedlotNumber
                      ? (
                        <>
                          Seedlot
                          {' '}
                          {seedlotNumber}
                          {' '}
                          - All changes saved
                        </>
                      )
                      : null
                  }
                  {
                    isFormIncomplete
                      ? (
                        <SaveTooltipLabel
                          handleSaveBtn={handleSaveBtn}
                          saveStatus={saveStatus}
                          saveDescription={saveDescription}
                          mutationStatus={saveProgressStatus}
                          lastSaveTimestamp={lastSaveTimestamp}
                          reloadFormDraft={reloadFormDraft}
                        />
                      )
                      : null
                  }
                </div>
              )}
            />
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-progress">
            {
            seedlotData
              ? (
                <SeedlotRegistrationProgressClassB
                  progressStatus={
                isEditable
                  ? progressStatus
                  : completeProgressConfig
              }
                  interactFunction={(e: number) => {
                    updateProgressStatus(e, formStep);
                    setStep((e - formStep));
                  }}
                />
              )
              : <ProgressIndicatorSkeleton />
          }
          </Column>
        </Row>
        <SubmitErrorNotification errDescription={submitErrDescription} />
        {
          saveStatus === 'conflict' || saveStatus === 'error'
            ? (
              <Row>
                <Column>
                  <SaveErrorNotification
                    saveStatus={saveStatus}
                    reloadFormDraft={reloadFormDraft}
                    handleSaveBtn={handleSaveBtn}
                  />
                </Column>
              </Row>
            )
            : null
        }
        <Row>
          <Column className="seedlot-registration-row">
            {
              (isFetchingData || submitSeedlot.status === 'pending' || !isFormReady)
                ? <Loading />
                : <RegForm />
            }
          </Column>
        </Row>
        <Row className="seedlot-registration-button-row">
          {
            formStep === 3 && disableSubmit
              ? (
                <Column sm={4} md={8} lg={16} xlg={12}>
                  <InlineNotification
                    lowContrast
                    kind="warning"
                    title="Missing fields:"
                    subtitle="Submit registration is disabled until mandatory fields are filled in
                              correctly. You can check for blank or invalid fields on every step."
                  />
                </Column>
              )
              : null
          }
          <Grid narrow>
            <Column sm={4} md={3} lg={3} xlg={4}>
              <BackOrCancelButton
                isFirstStep={formStep === 0}
                onBack={() => setStep(-1)}
                onCancel={() => {
                  Promise.resolve(navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? '')))
                    .catch(() => undefined);
                }}
              />
            </Column>
            {
              isFormIncomplete
                ? (
                  <Column sm={4} md={3} lg={3} xlg={4}>
                    <Button
                      kind="secondary"
                      size="lg"
                      className="form-action-btn"
                      onClick={() => handleSaveBtn()}
                      disabled={saveProgressStatus === 'pending' || saveStatus === 'conflict'}
                    >
                      <InlineLoading status={saveStatus === 'conflict' ? 'error' : saveStatus} description={saveDescription} />
                    </Button>
                  </Column>
                )
                : null
            }
            <Column sm={4} md={3} lg={3} xlg={4}>
              {
                formStep !== 3
                  ? <NextButton onClick={() => setStep(1)} />
                  : (
                    <SubmitModal
                      btnText="Submit Registration"
                      renderIconName="CheckmarkOutline"
                      disableBtn={disableSubmit}
                      submitFn={() => {
                        submitSeedlot.mutate(
                          getBClassSeedlotPayload(allStepData, richSeedlotData)
                        );
                      }}
                      setStepFn={(e: number) => {
                        updateProgressStatus(e, formStep);
                        setStep((e - formStep));
                      }}
                    />
                  )
              }
            </Column>
          </Grid>
        </Row>
      </FlexGrid>
    </div>
  );
};

export default RegPage;
