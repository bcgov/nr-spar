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
  Loading
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { getBreadcrumbs, getSeedlotSubmitErrDescription } from '../ContextContainerClassA/utils';
import PageTitle from '../../../components/PageTitle';
import SaveTooltipLabel from './SaveTooltip';
import SeedlotRegistrationProgress from '../../../components/SeedlotRegistrationProgress';
import RegForm from './RegForm';
import SubmitModal from '../../../components/SeedlotRegistrationSteps/SubmitModal';
import ClassAContext from '../ContextContainerClassA/context';
import { addParamToPath } from '../../../utils/PathUtils';
import ROUTES from '../../../routes/constants';
import { completeProgressConfig, smartSaveText } from '../ContextContainerClassA/constants';

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
    getFormDraftQuery
  } = useContext(ClassAContext);

  const reloadFormDraft = () => getFormDraftQuery.refetch();

  return (
    <div className="seedlot-registration-page">
      <FlexGrid fullWidth>
        <Row>
          <Column className="seedlot-registration-breadcrumb">
            <Breadcrumbs crumbs={getBreadcrumbs(seedlotNumber!)} />
          </Column>
        </Row>
        <Row>
          <Column className="seedlot-registration-title">
            <PageTitle
              title="Seedlot Registration"
              subtitle={(
                <div className="seedlot-form-subtitle">
                  <span>
                    {`Seedlot ${seedlotNumber}`}
                  </span>
                  {
                    isFormIncomplete
                      ? (
                        <>
                          <span>
                            &nbsp;
                            -
                            &nbsp;
                          </span>
                          <SaveTooltipLabel
                            handleSaveBtn={handleSaveBtn}
                            saveStatus={saveStatus}
                            saveDescription={saveDescription}
                            mutationStatus={saveProgressStatus}
                            lastSaveTimestamp={lastSaveTimestamp}
                            reloadFormDraft={reloadFormDraft}
                          />
                        </>
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
            <SeedlotRegistrationProgress
              progressStatus={
                seedlotData?.seedlotStatus.seedlotStatusCode === 'PND' || seedlotData?.seedlotStatus.seedlotStatusCode === 'INC'
                  ? progressStatus
                  : completeProgressConfig
              }
              interactFunction={(e: number) => {
                updateProgressStatus(e, formStep);
                setStep((e - formStep));
              }}
            />
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
                      disableBtn={!allStepCompleted || saveStatus === 'conflict'}
                      submitFn={() => {
                        submitSeedlot.mutate(getSeedlotPayload(allStepData, seedlotNumber));
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
