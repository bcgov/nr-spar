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
import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { getSeedlotSubmitErrDescription } from '../ContextContainerClassA/utils';
import PageTitle from '../../../components/PageTitle';
import SaveTooltipLabel from './SaveTooltip';
import SeedlotRegistrationProgress from '../../../components/SeedlotRegistrationProgress';
import RegForm from './RegForm';
import SubmitModal from '../../../components/SeedlotRegistrationSteps/SubmitModal';
import AuthContext from '../../../contexts/AuthContext';
import ClassAContext from '../ContextContainerClassA/context';
import { addParamToPath } from '../../../utils/PathUtils';
import { getSeedlotBreadcrumbs } from '../../../utils/BreadcrumbUtils';
import ROUTES from '../../../routes/constants';
import { completeProgressConfig, smartSaveText } from '../ContextContainerClassA/constants';

import './styles.scss';

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
    cleanParentTables,
    submitSeedlot,
    getSeedlotPayload,
    updateProgressStatus,
    saveProgressStatus,
    isFetchingData,
    seedlotData,
    getFormDraftQuery,
    seedlotSpecies,
    popSizeAndDiversityConfig
  } = useContext(ClassAContext);

  const reloadFormDraft = () => getFormDraftQuery.refetch();

  const { isTscAdmin } = useContext(AuthContext);

  const disableSubmit = !allStepCompleted
    || saveStatus === 'conflict'
    || !seedlotData
    || (seedlotData.seedlotStatus.seedlotStatusCode !== 'PND'
    && seedlotData.seedlotStatus.seedlotStatusCode !== 'INC');

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
              title={`Registration for seedlot ${seedlotNumber}`}
              subtitle={(
                <div className="seedlot-form-subtitle">
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
                <SeedlotRegistrationProgress
                  progressStatus={
                seedlotData.seedlotStatus.seedlotStatusCode === 'PND' || seedlotData.seedlotStatus.seedlotStatusCode === 'INC'
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
        {
          submitSeedlot.isError
            ? (
              <Row>
                <Column>
                  <InlineNotification
                    lowContrast
                    kind="error"
                    title={
                      getSeedlotSubmitErrDescription((submitSeedlot.error as AxiosError)).title
                    }
                    subtitle={
                      getSeedlotSubmitErrDescription((submitSeedlot.error as AxiosError))
                        .description
                    }
                  />
                </Column>
              </Row>
            )
            : null
        }
        {
          saveStatus === 'conflict' || saveStatus === 'error'
            ? (
              <Row>
                <Column>
                  <ActionableNotification
                    className={saveStatus === 'conflict' ? 'save-conflict-actionable-notification' : 'save-error-actionable-notification'}
                    lowContrast
                    kind="error"
                    title={saveStatus === 'conflict' ? `${smartSaveText.conflictTitle}` : `${smartSaveText.error}:\u00A0`}
                    subtitle={saveStatus === 'conflict' ? smartSaveText.conflictSuggestion : smartSaveText.suggestion}
                    actionButtonLabel={saveStatus === 'conflict' ? smartSaveText.reload : smartSaveText.idle}
                    onActionButtonClick={saveStatus === 'conflict' ? reloadFormDraft : handleSaveBtn}
                  />
                </Column>
              </Row>
            )
            : null
        }
        <Row>
          <Column className="seedlot-registration-row">
            {
              isFetchingData || submitSeedlot.status === 'loading'
                ? <Loading />
                : (
                  <RegForm
                    cleanParentTables={cleanParentTables}
                  />
                )
            }
          </Column>
        </Row>
        <Row className="seedlot-registration-button-row">
          {
            formStep === 5 && disableSubmit
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
              {
                formStep !== 0
                  ? (
                    <Button
                      kind="secondary"
                      size="lg"
                      className="form-action-btn"
                      onClick={() => setStep(-1)}
                    >
                      Back
                    </Button>
                  )
                  : (
                    <Button
                      kind="secondary"
                      size="lg"
                      className="form-action-btn"
                      onClick={() => navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? ''))}
                    >
                      Cancel
                    </Button>
                  )
              }
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
                      disabled={saveProgressStatus === 'loading' || saveStatus === 'conflict'}
                    >
                      <InlineLoading status={saveStatus === 'conflict' ? 'error' : saveStatus} description={saveDescription} />
                    </Button>
                  </Column>
                )
                : null
            }
            <Column sm={4} md={3} lg={3} xlg={4}>
              {
                formStep !== 5
                  ? (
                    <Button
                      kind="primary"
                      size="lg"
                      className="form-action-btn"
                      onClick={() => setStep(1)}
                      renderIcon={ArrowRight}
                    >
                      Next
                    </Button>
                  )
                  : (
                    <SubmitModal
                      btnText="Submit Registration"
                      renderIconName="CheckmarkOutline"
                      disableBtn={disableSubmit}
                      submitFn={() => {
                        submitSeedlot.mutate(
                          getSeedlotPayload(
                            allStepData,
                            seedlotNumber,
                            seedlotSpecies.code,
                            popSizeAndDiversityConfig
                          )
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
