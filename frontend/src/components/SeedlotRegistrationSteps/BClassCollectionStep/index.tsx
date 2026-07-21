import React, { useContext, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FlexGrid,
  Column,
  Row,
  TextInput,
  CheckboxGroup,
  Checkbox,
  DatePickerInput,
  DatePicker,
  TextArea,
  CheckboxSkeleton,
  ComboBox,
  NumberInput,
  RadioButtonGroup,
  RadioButton,
  Button,
  DropdownSkeleton,
  RadioButtonSkeleton
} from '@carbon/react';
import validator from 'validator';

import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import { now } from '../../../utils/DateUtils';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';
import getCaptureMethods from '../../../api-service/captureMethodsAPI';
import getNumberTreesCollected from '../../../api-service/numberTreesCollectedAPI';
import getOrgUnitDistricts from '../../../api-service/orgUnitDistrictsAPI';
import getBecCatalogue from '../../../api-service/becCatalogueAPI';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import { FilterObj, filterInput } from '../../../utils/FilterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import { StringInputType } from '../../../types/FormInputType';

import Subtitle from '../../Subtitle';
import ClientAndCodeInput from '../../ClientAndCodeInput';
import ScrollToTop from '../../ScrollToTop';
import ClassBContext from '../../../views/Seedlot/ContextContainerClassB/context';

import {
  DATE_FORMAT, agencyFieldsProps, fieldsConfig
} from './constants';
import { BClassCollectionForm } from './definitions';
import {
  calcVolume,
  getBecVariantItems,
  isBecVariantRequired,
  isNumNotInRange
} from './utils';

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
    isFormSubmitted
  } = useContext(ClassBContext);

  const [isCalcWrong, setIsCalcWrong] = useState<boolean>(false);

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

  const becZoneItems = useMemo(() => {
    if (!becCatalogueQuery.data) return [];
    const seen = new Set<string>();
    return becCatalogueQuery.data
      .filter((row) => { const n = !seen.has(row.becZoneCode); seen.add(row.becZoneCode); return n; })
      .map((row) => ({ code: row.becZoneCode, description: row.becZoneName, label: `${row.becZoneCode} - ${row.becZoneName}` }));
  }, [becCatalogueQuery.data]);

  const becSubzoneItems = useMemo(() => {
    if (!becCatalogueQuery.data || !selectedZoneCode) return [];
    const seen = new Set<string>();
    return becCatalogueQuery.data
      .filter((row) => row.becZoneCode === selectedZoneCode)
      .filter((row) => { const n = !seen.has(row.becSubzoneCode); seen.add(row.becSubzoneCode); return n; })
      .map((row) => ({ code: row.becSubzoneCode, description: row.becSubzoneName, label: `${row.becSubzoneCode} - ${row.becSubzoneName}` }));
  }, [becCatalogueQuery.data, selectedZoneCode]);

  const becVariantItems = useMemo(
    () => getBecVariantItems(becCatalogueQuery.data, selectedZoneCode, selectedSubzoneCode),
    [becCatalogueQuery.data, selectedZoneCode, selectedSubzoneCode]
  );

  let becVariantPlaceholder = 'None';
  if (!selectedSubzoneCode) {
    becVariantPlaceholder = 'Choose subzone first';
  } else if (becVariantItems.length > 0) {
    becVariantPlaceholder = 'Choose variant';
  }

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

  const readOnly = isFormSubmitted && !isReview;

  const handleDmsChange = (
    field: 'latDeg' | 'latMin' | 'latSec' | 'longDeg' | 'longMin' | 'longSec',
    value: string
  ) => {
    const clonedState = structuredClone(state);
    clonedState[field].value = value;
    updateState(clonedState);
  };

  const handleBooleanField = (
    field: 'useLatLongForBec' | 'sameBecUnit',
    checked: boolean
  ) => {
    const clonedState = structuredClone(state);
    clonedState[field].value = checked;
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

  return (
    <FlexGrid className="b-class-collection-step">
      <ScrollToTop enabled={!isReview} />

      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.latLongSection.title}</h2>
          {isReview ? null : <Subtitle text={fieldsConfig.latLongSection.subtitle} />}
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <p className="bx--label">{fieldsConfig.latLongSection.latLabel}</p>
        </Column>
      </Row>
      <Row>
        <Column>
          <TextInput
            id={state.latDeg.id}
            labelText="Latitude degrees"
            hideLabel
            placeholder={fieldsConfig.latLongSection.degreePlaceholder}
            value={state.latDeg.value}
            readOnly={readOnly}
            invalid={state.latDeg.isInvalid}
            decorator={<span aria-hidden>°</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDmsChange('latDeg', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.latMin.id}
            labelText="Latitude minutes"
            hideLabel
            placeholder={fieldsConfig.latLongSection.minutePlaceholder}
            value={state.latMin.value}
            readOnly={readOnly}
            invalid={state.latMin.isInvalid}
            decorator={<span aria-hidden>&#39;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDmsChange('latMin', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.latSec.id}
            labelText="Latitude seconds"
            hideLabel
            placeholder={fieldsConfig.latLongSection.secondPlaceholder}
            value={state.latSec.value}
            readOnly={readOnly}
            invalid={state.latSec.isInvalid}
            decorator={<span aria-hidden>&#34;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDmsChange('latSec', e.target.value)}
          />
        </Column>
      </Row>
      {isReview ? null : (
        <Row className="b-class-collection-row">
          <Column sm={4} md={8} lg={16} xlg={16}>
            <p className="bx--form__helper-text">{fieldsConfig.latLongSection.latHelper}</p>
          </Column>
        </Row>
      )}
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <p className="bx--label">{fieldsConfig.latLongSection.longLabel}</p>
        </Column>
      </Row>
      <Row>
        <Column>
          <TextInput
            id={state.longDeg.id}
            labelText="Longitude degrees"
            hideLabel
            placeholder={fieldsConfig.latLongSection.degreePlaceholder}
            value={state.longDeg.value}
            readOnly={readOnly}
            invalid={state.longDeg.isInvalid}
            decorator={<span aria-hidden>°</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDmsChange('longDeg', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.longMin.id}
            labelText="Longitude minutes"
            hideLabel
            placeholder={fieldsConfig.latLongSection.minutePlaceholder}
            value={state.longMin.value}
            readOnly={readOnly}
            invalid={state.longMin.isInvalid}
            decorator={<span aria-hidden>&#39;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDmsChange('longMin', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.longSec.id}
            labelText="Longitude seconds"
            hideLabel
            placeholder={fieldsConfig.latLongSection.secondPlaceholder}
            value={state.longSec.value}
            readOnly={readOnly}
            invalid={state.longSec.isInvalid}
            decorator={<span aria-hidden>&#34;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDmsChange('longSec', e.target.value)}
          />
        </Column>
      </Row>
      {isReview ? null : (
        <Row className="b-class-collection-row">
          <Column sm={4} md={8} lg={16} xlg={16}>
            <p className="bx--form__helper-text">{fieldsConfig.latLongSection.longHelper}</p>
          </Column>
        </Row>
      )}

      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.becSection.title}</h2>
          {isReview ? null : <Subtitle text={fieldsConfig.becSection.subtitle} />}
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Checkbox
            id={state.useLatLongForBec.id}
            labelText={fieldsConfig.becSection.useLatLongCheckbox}
            checked={state.useLatLongForBec.value}
            readOnly={readOnly}
            onChange={(_e: React.ChangeEvent<HTMLInputElement>, { checked }: { checked: boolean }) => {
              handleBooleanField('useLatLongForBec', checked);
            }}
          />
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={5} xlg={5}>
          {becCatalogueQuery.isFetching
            ? <DropdownSkeleton />
            : (
              <ComboBox
                id={state.becZone.id}
                titleText={fieldsConfig.becSection.zoneLabel}
                placeholder="Choose BEC zone"
                items={becZoneItems}
                itemToString={(item: MultiOptionsObj | null) => (item ? item.label : '')}
                selectedItem={state.becZone.value.code ? state.becZone.value : null}
                readOnly={readOnly || state.useLatLongForBec.value}
                invalid={state.becZone.isInvalid}
                shouldFilterItem={({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })}
                onChange={(e: ComboBoxEvent) => handleComboSelection('becZone', e.selectedItem)}
              />
            )}
        </Column>
        <Column sm={4} md={4} lg={5} xlg={5}>
          {becCatalogueQuery.isFetching
            ? <DropdownSkeleton />
            : (
              <ComboBox
                id={state.becSubzone.id}
                titleText={fieldsConfig.becSection.subzoneLabel}
                placeholder={selectedZoneCode ? 'Choose subzone' : 'Choose zone first'}
                items={becSubzoneItems}
                itemToString={(item: MultiOptionsObj | null) => (item ? item.label : '')}
                selectedItem={state.becSubzone.value.code ? state.becSubzone.value : null}
                readOnly={readOnly || state.useLatLongForBec.value || !selectedZoneCode}
                invalid={state.becSubzone.isInvalid}
                shouldFilterItem={({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })}
                onChange={(e: ComboBoxEvent) => handleComboSelection('becSubzone', e.selectedItem)}
              />
            )}
        </Column>
        <Column sm={4} md={4} lg={5} xlg={5}>
          {becCatalogueQuery.isFetching
            ? <DropdownSkeleton />
            : (
              <ComboBox
                id={state.becVariant.id}
                titleText={fieldsConfig.becSection.variantLabel}
                placeholder={becVariantPlaceholder}
                items={becVariantItems}
                itemToString={(item: MultiOptionsObj | null) => (item ? item.label : '')}
                selectedItem={state.becVariant.value.code ? state.becVariant.value : null}
                readOnly={readOnly || state.useLatLongForBec.value || !selectedSubzoneCode}
                invalid={state.becVariant.isInvalid}
                shouldFilterItem={({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })}
                onChange={(e: ComboBoxEvent) => handleComboSelection('becVariant', e.selectedItem)}
              />
            )}
        </Column>
      </Row>
      {!isReview ? (
        <Row className="b-class-collection-row">
          <Column sm={4} md={8} lg={16} xlg={16}>
            <Button kind="ghost" className="bec-search-link">
              {fieldsConfig.becSection.becSearchLink}
            </Button>
          </Column>
        </Row>
      ) : null}
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Checkbox
            id={state.sameBecUnit.id}
            labelText={fieldsConfig.becSection.sameBecUnitCheckbox}
            checked={state.sameBecUnit.value}
            readOnly={readOnly}
            onChange={(_e: React.ChangeEvent<HTMLInputElement>, { checked }: { checked: boolean }) => {
              handleBooleanField('sameBecUnit', checked);
            }}
          />
        </Column>
      </Row>

      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.collectorSection.title}</h2>
          {isReview ? null : <Subtitle text={fieldsConfig.collectorSection.subtitle} />}
        </Column>
      </Row>
      <ClientAndCodeInput
        showCheckbox={!isReview}
        checkboxId="b-collection-step-default-checkbox"
        clientInput={state.collectorAgency}
        locationCodeInput={state.locationCode}
        textConfig={agencyFieldsProps}
        defaultClientNumber={defaultClientNumber}
        defaultLocCode={defaultCode}
        setClientAndCode={setClientAndCode}
        readOnly={readOnly}
        maxInputColSize={6}
      />
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.collectionInformationSection.title}</h2>
          {isReview ? null : <Subtitle text={fieldsConfig.collectionInformationSection.subtitle} />}
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={8} xlg={6}>
          {
            orgUnitQuery.isFetching
              ? <DropdownSkeleton />
              : (
                <ComboBox
                  id={state.orgUnit.id}
                  titleText={fieldsConfig.orgUnit.labelText}
                  placeholder={fieldsConfig.orgUnit.placeholder}
                  helperText={isReview ? undefined : fieldsConfig.orgUnit.helperText}
                  items={orgUnitQuery.data ?? []}
                  itemToString={(item: MultiOptionsObj | null) => (item ? item.label : '')}
                  selectedItem={state.orgUnit.value.code ? state.orgUnit.value : null}
                  readOnly={readOnly}
                  invalid={state.orgUnit.isInvalid}
                  shouldFilterItem={
                    ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                  }
                  onChange={(e: ComboBoxEvent) => handleComboSelection('orgUnit', e.selectedItem)}
                />
              )
          }
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id={state.locationArea.id}
            labelText={fieldsConfig.locationArea.labelText}
            placeholder={fieldsConfig.locationArea.placeholder}
            value={state.locationArea.value}
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const clonedState = structuredClone(state);
              clonedState.locationArea.value = e.target.value;
              updateState(clonedState);
            }}
          />
          {!isReview ? (
            <Row>
              <Column sm={4} md={8} lg={16} xlg={16}>
                <p className="bx--form__helper-text">{fieldsConfig.locationArea.helperText}</p>
              </Column>
            </Row>
          ) : null}
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <NumberInput
            id={state.collectionRadius.id}
            label={fieldsConfig.collectionRadius.labelText}
            placeholder={fieldsConfig.collectionRadius.placeholder}
            value={state.collectionRadius.value ? Number(state.collectionRadius.value) : ''}
            readOnly={readOnly}
            min={0}
            step={0.1}
            onChange={(_e: React.ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
              const clonedState = structuredClone(state);
              clonedState.collectionRadius.value = value === '' ? '' : String(value);
              updateState(clonedState);
            }}
          />
          {!isReview ? (
            <Row>
              <Column sm={4} md={8} lg={16} xlg={16}>
                <p className="bx--form__helper-text">{fieldsConfig.collectionRadius.helperText}</p>
              </Column>
            </Row>
          ) : null}
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <p className="bx--label">{fieldsConfig.elevation.labelText}</p>
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={4} lg={5} xlg={4}>
          <TextInput
            id={state.elevationMin.id}
            labelText=""
            placeholder={fieldsConfig.elevation.minPlaceholder}
            value={state.elevationMin.value}
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const clonedState = structuredClone(state);
              clonedState.elevationMin.value = e.target.value;
              updateState(clonedState);
            }}
          />
        </Column>
        <Column sm={4} md={4} lg={5} xlg={4}>
          <TextInput
            id={state.elevationMax.id}
            labelText=""
            placeholder={fieldsConfig.elevation.maxPlaceholder}
            value={state.elevationMax.value}
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const clonedState = structuredClone(state);
              clonedState.elevationMax.value = e.target.value;
              updateState(clonedState);
            }}
          />
        </Column>
        <Column sm={4} md={4} lg={5} xlg={4}>
          <TextInput
            id={state.elevationMean.id}
            labelText=""
            placeholder={fieldsConfig.elevation.meanPlaceholder}
            value={state.elevationMean.value}
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const clonedState = structuredClone(state);
              clonedState.elevationMean.value = e.target.value;
              updateState(clonedState);
            }}
          />
        </Column>
      </Row>
      {!isReview ? (
        <Row className="b-class-collection-row">
          <Column sm={4} md={8} lg={16} xlg={16}>
            <p className="bx--form__helper-text">{fieldsConfig.elevation.helperText}</p>
          </Column>
        </Row>
      ) : null}
      <Row>
        <Column sm={4} md={8} lg={8} xlg={6}>
          {
            captureMethodsQuery.isFetching
              ? <DropdownSkeleton />
              : (
                <ComboBox
                  id={state.captureMethod.id}
                  titleText={fieldsConfig.captureMethod.labelText}
                  placeholder={fieldsConfig.captureMethod.placeholder}
                  items={captureMethodItems}
                  itemToString={(item: MultiOptionsObj | null) => (item ? item.description : '')}
                  selectedItem={selectedCaptureMethod}
                  readOnly={readOnly}
                  invalid={state.captureMethod.isInvalid}
                  shouldFilterItem={
                    ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                  }
                  onChange={(e: ComboBoxEvent) => handleComboSelection('captureMethod', e.selectedItem)}
                />
              )
          }
        </Column>
      </Row>
      {!isReview ? (
        <Row className="b-class-collection-row">
          <Column sm={4} md={8} lg={16} xlg={16}>
            <p className="bx--form__helper-text">{fieldsConfig.captureMethod.helperText}</p>
          </Column>
        </Row>
      ) : null}
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            readOnly={readOnly}
            maxDate={!isReview ? now : undefined}
            value={state.startDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDateChange(true, selectedDate);
            }}
          >
            <DatePickerInput
              id={state.startDate.id}
              name={fieldsConfig.startDate.name}
              placeholder={fieldsConfig.startDate.placeholder}
              labelText={fieldsConfig.startDate.labelText}
              helperText={isReview ? undefined : fieldsConfig.startDate.helperText}
              invalid={state.startDate.isInvalid}
              invalidText={fieldsConfig.startDate.invalidText}
              aria-invalid={state.startDate.isInvalid ? 'true' : 'false'}
              size="md"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            minDate={state.startDate.value}
            maxDate={!isReview ? now : undefined}
            readOnly={readOnly}
            value={state.endDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDateChange(false, selectedDate);
            }}
          >
            <DatePickerInput
              id={state.endDate.id}
              name={fieldsConfig.endDate.name}
              placeholder={fieldsConfig.endDate.placeholder}
              labelText={fieldsConfig.endDate.labelText}
              helperText={isReview ? undefined : fieldsConfig.endDate.helperText}
              invalid={state.endDate.isInvalid}
              invalidText={fieldsConfig.endDate.invalidText}
              aria-invalid={state.endDate.isInvalid ? 'true' : 'false'}
              size="md"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id={state.numberOfContainers.id}
            type="number"
            name={fieldsConfig.numberOfContainers.name}
            value={state.numberOfContainers.value}
            labelText={fieldsConfig.numberOfContainers.labelText}
            readOnly={readOnly}
            invalid={state.numberOfContainers.isInvalid}
            invalidText={fieldsConfig.numberOfContainers.invalidText}
            aria-invalid={state.numberOfContainers.isInvalid ? 'true' : 'false'}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleContainerNumAndVol(true, e.target.value);
            }}
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id={state.volumePerContainers.id}
            type="number"
            name={fieldsConfig.volumePerContainers.name}
            value={state.volumePerContainers.value}
            labelText={fieldsConfig.volumePerContainers.labelText}
            readOnly={readOnly}
            invalid={state.volumePerContainers.isInvalid}
            invalidText={fieldsConfig.volumePerContainers.invalidText}
            aria-invalid={state.volumePerContainers.isInvalid ? 'true' : 'false'}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleContainerNumAndVol(false, e.target.value);
            }}
          />
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextInput
            id={state.volumeOfCones.id}
            type="number"
            name={fieldsConfig.volumeOfCones.name}
            value={state.volumeOfCones.value}
            labelText={fieldsConfig.volumeOfCones.labelText}
            invalid={state.volumeOfCones.isInvalid}
            invalidText={fieldsConfig.volumeOfCones.invalidText}
            helperText={isReview ? undefined : fieldsConfig.volumeOfCones.helperText}
            warn={isCalcWrong}
            readOnly={readOnly}
            warnText={fieldsConfig.volumeOfCones.warnText}
            aria-invalid={state.volumeOfCones.isInvalid ? 'true' : 'false'}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleVolOfCones(e.target.value);
            }}
          />
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          {
            coneCollectionMethodsQuery.isFetching
              ? (
                <>
                  <CheckboxSkeleton />
                  <CheckboxSkeleton />
                  <CheckboxSkeleton />
                </>
              )
              : (
                <CheckboxGroup
                  legendText={fieldsConfig.collectionMethodOptionsLabel}
                  id={state.selectedCollectionCodes.id}
                >
                  {
                    (coneCollectionMethodsQuery.data as MultiOptionsObj[])
                      ?.sort((a, b) => a.description.localeCompare(b.description))
                      .map((method) => (
                        <Checkbox
                          key={method.code}
                          id={`b-cone-collection-method-checkbox-${method.code}`}
                          name={method.label}
                          labelText={method.description}
                          readOnly={readOnly}
                          checked={state.selectedCollectionCodes.value.includes(method.code)}
                          onChange={() => handleCollectionMethods(method.code)}
                        />
                      ))
                  }
                </CheckboxGroup>
              )
          }
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          {
            numberTreesQuery.isFetching
              ? <RadioButtonSkeleton />
              : (
                <RadioButtonGroup
                  legendText={fieldsConfig.numberTreesFrom.legendText}
                  name="b-collection-number-trees-from"
                  valueSelected={state.numberTreesFrom.value.code}
                  orientation="vertical"
                  readOnly={readOnly}
                  onChange={(value: string) => {
                    const selected = numberTreesQuery.data?.find((opt) => opt.code === value);
                    handleComboSelection('numberTreesFrom', selected ?? null);
                  }}
                >
                  {
                    numberTreesQuery.data?.map((option) => (
                      <RadioButton
                        key={option.code}
                        id={`b-number-trees-${option.code}`}
                        labelText={option.description}
                        value={option.code}
                      />
                    ))
                  }
                </RadioButtonGroup>
              )
          }
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextArea
            id={state.comments.id}
            name={fieldsConfig.comments.name}
            labelText={fieldsConfig.comments.labelText}
            readOnly={readOnly}
            placeholder={fieldsConfig.comments.placeholder}
            value={state.comments.value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              handleComment(e.target.value);
            }}
            rows={5}
            maxCount={400}
            enableCounter
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default BClassCollectionStep;
