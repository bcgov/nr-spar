import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Button,
  FlexGrid,
  Row,
  Column,
  Loading
} from '@carbon/react';
import { toast } from 'react-toastify';
import {
  Edit, Save, Pending, Checkmark
} from '@carbon/icons-react';

import { getSeedlotById } from '../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageTitle from '../../../components/PageTitle';
import RowGap from '../../../components/RowGap';
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
import {
  PutTscSeedlotMutationObj, StatusOnSaveType, putTscSeedlotWithStatus,
  updateSeedlotStatus
} from '../../../api-service/tscAdminAPI';
import {
  SeedPlanZoneDto, SeedlotReviewElevationLatLongDto,
  SeedlotReviewGeoInformationDto, TscSeedlotEditPayloadType
} from '../../../types/SeedlotType';
import ErrorToast from '../../../components/Toast/ErrorToast';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import { GeneticTrait } from '../../../types/PtCalcTypes';

import ClassAContext from '../ContextContainerClassA/context';
import { validateRegForm } from '../CreateAClass/utils';
import {
  getSeedlotPayload,
  validateCollectionStep, validateExtractionStep, validateInterimStep, validateOrchardStep,
  validateOwnershipStep, validateParentStep, verifyCollectionStepCompleteness,
  verifyExtractionStepCompleteness,
  verifyInterimStepCompleteness, verifyOrchardStepCompleteness, verifyOwnershipStepCompleteness,
  verifyParentStepCompleteness
} from '../ContextContainerClassA/utils';

import {
  getBreadcrumbs, validateAreaOfUse, validateCollectGeoVals,
  validateGeneticWorth
} from './utils';
import { GenWorthValType } from './definitions';

const SeedlotReviewContent = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(),
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
    allStepData, genWorthVals, geoInfoVals,
    areaOfUseData, isFetchingData
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

  const generatePaylod = (): TscSeedlotEditPayloadType => {
    const regFormPayload = getSeedlotPayload(allStepData, seedlotNumber);

    const applicantAndSeedlotInfo: SeedlotPatchPayloadType = {
      applicantEmailAddress: applicantData.email.value,
      seedlotSourceCode: applicantData.sourceCode.value,
      toBeRegistrdInd: applicantData.willBeRegistered.value,
      bcSourceInd: applicantData.isBcSource.value
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
          seedlotReviewGeneticWorth.push({
            traitCode: genWorthKey,
            traitValue: Number(genWorthVals[genWorthKey].value)
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
      if (variables.statusOnSave !== 'SUB') {
        navigate(`/seedlots/details/${seedlotNumber}/?statusOnSave=${variables.statusOnSave}`);
      }
      setIsReadMode(true);
    }
  });

  const statusOnlyMutaion = useMutation({
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
      if (variables.statusOnSave !== 'SUB') {
        navigate(`/seedlots/details/${seedlotNumber}/?statusOnSave=${variables.statusOnSave}`);
      }
      setIsReadMode(true);
    }
  });

  const handleEditSaveBtn = () => {
    // If the form is in read mode, then enable edit mode only.
    if (isReadMode) {
      setIsReadMode(!isReadMode);
      return;
    }

    // Validate the form before Edit going to Read mode.
    const isFormDataValid = verifyFormData();

    if (isFormDataValid) {
      const payload = generatePaylod();
      tscSeedlotMutation.mutate({ seedlotNum: seedlotNumber!, statusOnSave: 'SUB', payload });
      setIsReadMode(!isReadMode);
    }
  };

  const handleSaveAndStatus = (statusOnSave: StatusOnSaveType) => {
    if (isReadMode) {
      statusOnlyMutaion.mutate({ seedlotNum: seedlotNumber!, statusOnSave });
    } else {
      const isFormDataValid = verifyFormData();
      if (isFormDataValid) {
        const payload = generatePaylod();
        tscSeedlotMutation.mutate({ seedlotNum: seedlotNumber!, statusOnSave, payload });
      }
    }
  };

  return (
    <FlexGrid className="seedlot-review-grid">
      <Loading
        active={tscSeedlotMutation.isLoading || isFetchingData}
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

      <Breadcrumbs crumbs={getBreadcrumbs(seedlotNumber ?? '')} />
      <Row>
        <PageTitle
          title={`Review Seedlot ${seedlotQuery.data?.seedlot.id}`}
          subtitle={`${seedlotQuery.data?.seedlot.seedlotStatus.description} status`}
        />
      </Row>

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
              : (
                <InterimReviewEdit />
              )
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
      <Row className="action-button-row">
        <Column className="action-button-col" sm={4} md={4} lg={4}>
          <Button
            kind="secondary"
            renderIcon={Pending}
            onClick={() => handleSaveAndStatus('PND')}
          >
            Send back to pending
          </Button>
        </Column>
        <Column className="action-button-col" sm={4} md={4} lg={4}>
          <Button
            renderIcon={Checkmark}
            onClick={() => handleSaveAndStatus('APP')}
          >
            Approve seedlot
          </Button>
        </Column>
      </Row>

    </FlexGrid>
  );
};

export default SeedlotReviewContent;
