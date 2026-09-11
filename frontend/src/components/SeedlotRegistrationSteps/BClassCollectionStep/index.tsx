import React, {
  useContext, useEffect, useMemo, useRef, useState
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FlexGrid } from '@carbon/react';
import validator from 'validator';

import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';
import getCaptureMethods from '../../../api-service/captureMethodsAPI';
import getNumberTreesCollected from '../../../api-service/numberTreesCollectedAPI';
import getOrgUnitDistricts from '../../../api-service/orgUnitDistrictsAPI';
import getBecCatalogue from '../../../api-service/becCatalogueAPI';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import { StringInputType } from '../../../types/FormInputType';

import ScrollToTop from '../../ScrollToTop';
import ClassBContext from '../../../views/Seedlot/ContextContainerClassB/context';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import type { CollectionAreaResult } from '../../../types/SparMapTypes';

import { BClassCollectionForm } from './definitions';
import {
  becVariantPlaceholder,
  calcVolume,
  getBecSubzoneItems,
  getBecVariantItems,
  getBecZoneItems,
  isBecVariantRequired,
  isNumNotInRange
} from './utils';
import { applyCollectionAreaResult } from './mapIntegration';
import {
  CollectionBecSection,
  CollectionLatLongSection,
  CollectionLocationSection,
  CollectionMethodsSection
} from './formSections';

import './styles.scss';

type BClassCollectionStepProps = {
  isReview?: boolean
};

const BClassCollectionStep = ({ isReview }: BClassCollectionStepProps) => {
  const {
    allStepData: { collectionStep: state },
    setStepData,
    defaultClientNumber,
    defaultCode,
    isFormSubmitted,
    seedlotNumber
  } = useContext(ClassBContext);

  const [isCalcWrong, setIsCalcWrong] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const setClientAndCode = (
    agency: StringInputType,
    locationCode: StringInputType
  ) => {
    const clonedState = structuredClone(state);
    clonedState.collectorAgency = agency;
    clonedState.locationCode = locationCode;
    setStepData('collectionStep', clonedState);
  };

  const updateState = (clonedState: BClassCollectionForm) => {
    setStepData('collectionStep', clonedState);
  };

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const captureMethodsQuery = useQuery({
    queryKey: ['capture-methods'],
    queryFn: getCaptureMethods,
    select: (data) => getMultiOptList(data, true, true).map((item) => ({
      ...item,
      label: item.description
    })),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const numberTreesQuery = useQuery({
    queryKey: ['number-trees-collected'],
    queryFn: getNumberTreesCollected,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const orgUnitQuery = useQuery({
    queryKey: ['org-unit-districts'],
    queryFn: getOrgUnitDistricts,
    select: (data) => data.map((unit) => ({
      code: String(unit.orgUnitNo),
      description: unit.orgUnitName,
      label: `${unit.orgUnitCode} - ${unit.orgUnitName}`
    })),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const becCatalogueQuery = useQuery({
    queryKey: ['bec-catalogue'],
    queryFn: getBecCatalogue,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const selectedZoneCode = state.becZone.value.code;
  const selectedSubzoneCode = state.becSubzone.value.code;

  const captureMethodItems = useMemo(
    () => captureMethodsQuery.data ?? [],
    [captureMethodsQuery.data]
  );

  const selectedCaptureMethod = useMemo(() => {
    const { code } = state.captureMethod.value;
    if (!code) return null;
    return captureMethodItems.find((item) => item.code === code) ?? state.captureMethod.value;
  }, [captureMethodItems, state.captureMethod.value]);

  const becZoneItems = useMemo(
    () => getBecZoneItems(becCatalogueQuery.data),
    [becCatalogueQuery.data]
  );

  const becSubzoneItems = useMemo(
    () => getBecSubzoneItems(becCatalogueQuery.data, selectedZoneCode),
    [becCatalogueQuery.data, selectedZoneCode]
  );

  const becVariantItems = useMemo(
    () => getBecVariantItems(becCatalogueQuery.data, selectedZoneCode, selectedSubzoneCode),
    [becCatalogueQuery.data, selectedZoneCode, selectedSubzoneCode]
  );

  const handleDateChange = (isStartDate: boolean, value: string) => {
    const clonedState = structuredClone(state);
    const dateType: 'startDate' | 'endDate' = isStartDate ? 'startDate' : 'endDate';

    clonedState[dateType].value = value;

    const isInvalid = clonedState.endDate.value < clonedState.startDate.value;

    clonedState.startDate.isInvalid = isInvalid;
    clonedState.endDate.isInvalid = isInvalid;

    updateState(clonedState);
  };

  const handleContainerNumAndVol = (isNum: boolean, value: string) => {
    const clonedState = structuredClone(state);
    const isOverDecimal = !validator.isDecimal(value, { decimal_digits: '0,3' });
    const isNotInRange = isNumNotInRange(value);
    const valType: 'numberOfContainers' | 'volumePerContainers' = isNum
      ? 'numberOfContainers'
      : 'volumePerContainers';
    clonedState[valType].value = value;
    clonedState[valType].isInvalid = isNotInRange || isOverDecimal;

    clonedState.volumeOfCones.value = calcVolume(
      clonedState.numberOfContainers.value,
      clonedState.volumePerContainers.value
    );

    updateState(clonedState);
  };

  const handleVolOfCones = (value: string) => {
    const clonedState = structuredClone(state);
    const isOverDecimal = !validator.isDecimal(value, { decimal_digits: '0,3' });
    clonedState.volumeOfCones.isInvalid = isOverDecimal;
    clonedState.volumeOfCones.value = value;

    const multipliedVol = calcVolume(
      clonedState.numberOfContainers.value,
      clonedState.volumePerContainers.value
    );

    if (!isOverDecimal) {
      setIsCalcWrong(Number(multipliedVol).toFixed(3) !== Number(value).toFixed(3));
    }
    updateState(clonedState);
  };

  const handleCollectionMethods = (selectedMethod: string) => {
    const clonedState = structuredClone(state);
    const index = clonedState.selectedCollectionCodes.value.indexOf(selectedMethod);
    if (index > -1) {
      clonedState.selectedCollectionCodes.value.splice(index, 1);
    } else {
      clonedState.selectedCollectionCodes.value.push(selectedMethod);
    }
    updateState(clonedState);
  };

  const handleComment = (value: string) => {
    const clonedState = structuredClone(state);
    clonedState.comments.value = value;
    updateState(clonedState);
  };

  // Always apply map results against the latest form snapshot — not the
  // render that first saw `location.state` — so edits aren't overwritten.
  const stateRef = useRef(state);
  stateRef.current = state;
  const pendingMapResultRef = useRef<CollectionAreaResult | null>(null);

  // Consume collection-area values from SeedMap via router state. Clear the
  // router payload immediately, but hold the result until the BEC catalogue
  // is ready when labels are needed (otherwise zone codes stick without names).
  useEffect(() => {
    const fromRouter = (location.state as { collectionAreaResult?: CollectionAreaResult } | null)
      ?.collectionAreaResult;
    if (fromRouter) {
      pendingMapResultRef.current = fromRouter;
      navigate('.', { replace: true, state: null });
    }

    const pending = pendingMapResultRef.current;
    if (!pending) {
      return;
    }

    const needsCatalogue = Boolean(pending.becVariant || pending.becZones.length > 0);
    if (needsCatalogue && becCatalogueQuery.isLoading && !becCatalogueQuery.data) {
      return;
    }

    setStepData(
      'collectionStep',
      applyCollectionAreaResult(stateRef.current, pending, becCatalogueQuery.data)
    );
    pendingMapResultRef.current = null;
  }, [
    location.state,
    becCatalogueQuery.data,
    becCatalogueQuery.isLoading,
    navigate,
    setStepData
  ]);

  const launchCollectionAreaMap = () => {
    const returnTo = `${addParamToPath(ROUTES.SEEDLOT_B_CLASS_REGISTRATION, seedlotNumber ?? '')}?step=1`;
    const mapPath = `${addParamToPath(ROUTES.SEEDLOT_MAP, seedlotNumber ?? '')}?theme=COLAREA&returnTo=${encodeURIComponent(returnTo)}`;
    navigate(
      mapPath,
      state.collectionGeometry.value
        ? { state: { initialAoiGeoJson: state.collectionGeometry.value } }
        : undefined
    );
  };

  const readOnly = isFormSubmitted && !isReview;

  const handleStringFieldChange = (
    field:
      | 'latDeg' | 'latMin' | 'latSec' | 'longDeg' | 'longMin' | 'longSec'
      | 'elevationMin' | 'elevationMax' | 'elevationMean',
    value: string
  ) => {
    const clonedState = structuredClone(state);
    clonedState[field].value = value;
    updateState(clonedState);
  };

  const handleUseLatLongForBec = (checked: boolean) => {
    const clonedState = structuredClone(state);
    clonedState.useLatLongForBec.value = checked;
    updateState(clonedState);
  };

  const handleComboSelection = (
    field: 'orgUnit' | 'captureMethod' | 'numberTreesFrom' | 'becZone' | 'becSubzone' | 'becVariant',
    selected: MultiOptionsObj | null | undefined
  ) => {
    const clonedState = structuredClone(state);

    // Carbon ComboBox can fire onChange(null) on unmount or item refresh; keep the saved code.
    if (!selected?.code
      && (field === 'captureMethod' || field === 'orgUnit' || field === 'numberTreesFrom')
      && clonedState[field].value.code) {
      return;
    }

    const zoneCode = field === 'becZone' ? (selected?.code ?? '') : clonedState.becZone.value.code;
    const subzoneCode = field === 'becSubzone' ? (selected?.code ?? '') : clonedState.becSubzone.value.code;
    const variantRequired = isBecVariantRequired(becCatalogueQuery.data, zoneCode, subzoneCode);

    if (field === 'becVariant') {
      clonedState.becVariant.value = selected ?? EmptyMultiOptObj;
      clonedState.becVariant.isInvalid = variantRequired && !selected;
    } else {
      clonedState[field].value = selected ?? EmptyMultiOptObj;
      clonedState[field].isInvalid = !selected;
    }

    if (field === 'becZone') {
      clonedState.becSubzone.value = EmptyMultiOptObj;
      clonedState.becSubzone.isInvalid = false;
      clonedState.becVariant.value = EmptyMultiOptObj;
      clonedState.becVariant.isInvalid = false;
    }
    if (field === 'becSubzone') {
      clonedState.becVariant.value = EmptyMultiOptObj;
      clonedState.becVariant.isInvalid = false;
    }
    if ((field === 'becZone' || field === 'becSubzone') && !variantRequired) {
      clonedState.becVariant.isInvalid = false;
    }
    updateState(clonedState);
  };

  const handleLocationAreaChange = (value: string) => {
    const clonedState = structuredClone(state);
    clonedState.locationArea.value = value;
    updateState(clonedState);
  };

  const handleRadiusChange = (value: number | string) => {
    const clonedState = structuredClone(state);
    clonedState.collectionRadius.value = value === '' ? '' : String(value);
    updateState(clonedState);
  };

  return (
    <FlexGrid className="b-class-collection-step">
      <ScrollToTop enabled={!isReview} />
      <CollectionLatLongSection
        state={state}
        isReview={isReview}
        readOnly={readOnly}
        seedlotNumber={seedlotNumber}
        onLaunchMap={launchCollectionAreaMap}
        onDmsChange={handleStringFieldChange}
      />
      <CollectionBecSection
        state={state}
        isReview={isReview}
        readOnly={readOnly}
        selectedZoneCode={selectedZoneCode}
        selectedSubzoneCode={selectedSubzoneCode}
        becZoneItems={becZoneItems}
        becSubzoneItems={becSubzoneItems}
        becVariantItems={becVariantItems}
        becVariantPlaceholderText={becVariantPlaceholder(selectedSubzoneCode, becVariantItems.length)}
        catalogueFetching={becCatalogueQuery.isFetching}
        onUseLatLongForBec={handleUseLatLongForBec}
        onComboSelection={handleComboSelection}
      />
      <CollectionLocationSection
        state={state}
        isReview={isReview}
        readOnly={readOnly}
        defaultClientNumber={defaultClientNumber}
        defaultCode={defaultCode}
        orgUnitItems={orgUnitQuery.data ?? []}
        orgUnitFetching={orgUnitQuery.isFetching}
        onSetClientAndCode={setClientAndCode}
        onComboSelection={handleComboSelection}
        onLocationAreaChange={handleLocationAreaChange}
        onRadiusChange={handleRadiusChange}
        onElevationChange={handleStringFieldChange}
      />
      <CollectionMethodsSection
        state={state}
        isReview={isReview}
        readOnly={readOnly}
        isCalcWrong={isCalcWrong}
        captureMethodItems={captureMethodItems}
        selectedCaptureMethod={selectedCaptureMethod}
        captureFetching={captureMethodsQuery.isFetching}
        coneMethodsFetching={coneCollectionMethodsQuery.isFetching}
        coneMethods={coneCollectionMethodsQuery.data as MultiOptionsObj[] | undefined}
        numberTreesFetching={numberTreesQuery.isFetching}
        numberTreesItems={numberTreesQuery.data}
        onComboSelection={handleComboSelection}
        onDateChange={handleDateChange}
        onContainerNumAndVol={handleContainerNumAndVol}
        onVolOfCones={handleVolOfCones}
        onCollectionMethods={handleCollectionMethods}
        onComment={handleComment}
      />
    </FlexGrid>
  );
};

export default BClassCollectionStep;
