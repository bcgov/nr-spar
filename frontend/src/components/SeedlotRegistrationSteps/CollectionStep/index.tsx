import React, { useState, useContext, useEffect } from 'react';
import area from '@turf/area';
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
  Button,
  Tile,
  Tag
} from '@carbon/react';
import { Location } from '@carbon/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import validator from 'validator';

import { fetchSavedAoi } from '../../../api-service/sparMapApi';
import { fetchBecZonesIntersecting, fetchBecVariantAt } from '../../../api-service/becZonesApi';
import { fetchPolygonElevationRange } from '../../../api-service/elevationApi';
import { fetchForestDistrict } from '../../../api-service/forestDistrictApi';
import {
  meanLatLng, formatLatLng, formatElevationRange
} from './collectionAreaDerivations';

import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import { now } from '../../../utils/DateUtils';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';

import Subtitle from '../../Subtitle';
import ClientAndCodeInput from '../../ClientAndCodeInput';
import ScrollToTop from '../../ScrollToTop';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { StringInputType } from '../../../types/FormInputType';

import {
  DATE_FORMAT, agencyFieldsProps, fieldsConfig
} from './constants';
import {
  CollectionForm
} from './definitions';
import { calcVolume, isNumNotInRange } from './utils';

import './styles.scss';

type CollectionStepProps = {
  isReview?: boolean
}

const CollectionStep = ({ isReview }: CollectionStepProps) => {
  const {
    allStepData: { collectionStep: state },
    setStepData,
    defaultClientNumber,
    defaultCode,
    isFormSubmitted,
    seedlotNumber
  } = useContext(ClassAContext);

  const [isCalcWrong, setIsCalcWrong] = useState<boolean>(false);

  // POC: launch the SPAR collection-area map and read back the summary it
  // hands to the form via router state (see AoiToolbar.onSubmit). Production
  // (Approach A) would instead re-fetch `collectionGeom` from the full-form GET.
  const navigate = useNavigate();
  const location = useLocation();
  type CollectionAreaSummary = {
    polygonCount: number;
    areaHectares: number;
    becZones: string[];
    savedAt: string;
  };
  // Fresh hand-off from the map (router state) takes precedence; on a plain
  // page refresh that state is gone, so we re-load the saved geometry from the
  // backend (production read-back) and re-derive the same summary.
  const freshSummary = (location.state as {
    collectionAreaSummary?: CollectionAreaSummary;
  } | null)?.collectionAreaSummary;
  const [savedSummary, setSavedSummary] = useState<CollectionAreaSummary | null>(null);

  useEffect(() => {
    if (!seedlotNumber || freshSummary) {
      return undefined;
    }
    let cancelled = false;
    fetchSavedAoi(seedlotNumber)
      .then(async (geom) => {
        if (cancelled || !geom) {
          return;
        }
        let becZones: string[] = [];
        try {
          becZones = await fetchBecZonesIntersecting(geom);
        } catch {
          becZones = [];
        }
        if (!cancelled) {
          setSavedSummary({
            polygonCount: geom.geometry.coordinates.length,
            areaHectares: Math.round((area(geom) / 10000) * 100) / 100,
            becZones,
            savedAt: ''
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [seedlotNumber, freshSummary]);

  const collectionAreaSummary = freshSummary ?? savedSummary;

  type DerivedAttrs = {
    latLng: string | null;
    elevation: string | null;
    becVariant: string | null;
    forestDistrict: string | null;
  };
  const [derived, setDerived] = useState<DerivedAttrs | null>(null);

  useEffect(() => {
    if (!seedlotNumber) {
      return undefined;
    }
    let cancelled = false;
    fetchSavedAoi(seedlotNumber)
      .then(async (geom) => {
        if (cancelled || !geom) {
          return;
        }
        const mean = meanLatLng(geom);
        const centroid = mean ? [mean.lng, mean.lat] : null;
        const [elevation, becVariant, forestDistrict] = await Promise.all([
          fetchPolygonElevationRange(geom)
            .then((e) => (e ? formatElevationRange(e.minM, e.maxM) : null))
            .catch(() => null),
          centroid
            ? fetchBecVariantAt(centroid).then((v) => v?.mapLabel ?? null).catch(() => null)
            : Promise.resolve(null),
          centroid ? fetchForestDistrict(centroid).catch(() => null) : Promise.resolve(null)
        ]);
        if (!cancelled) {
          setDerived({
            latLng: mean ? formatLatLng(mean) : null,
            elevation,
            becVariant,
            forestDistrict
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [seedlotNumber]);

  const launchCollectionAreaMap = () => {
    const formPath = `/seedlots/a-class-registration/${seedlotNumber}`;
    navigate(
      `/seedlots/map/${seedlotNumber}?theme=COLAREA&returnTo=${encodeURIComponent(formPath)}`
    );
  };

  const setClientAndCode = (
    agency: StringInputType,
    locationCode: StringInputType
  ) => {
    const clonedState = structuredClone(state);
    clonedState.collectorAgency = agency;
    clonedState.locationCode = locationCode;
    setStepData('collectionStep', clonedState);
  };

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const handleDateChange = (isStartDate: boolean, value: string) => {
    const clonedState = structuredClone(state);
    const dateType: keyof CollectionForm = isStartDate ? 'startDate' : 'endDate';

    clonedState[dateType].value = value;

    const isInvalid = clonedState.endDate.value < clonedState.startDate.value;

    clonedState.startDate.isInvalid = isInvalid;
    clonedState.endDate.isInvalid = isInvalid;

    setStepData('collectionStep', clonedState);
  };

  const handleContainerNumAndVol = (isNum: boolean, value: string) => {
    const clonedState = structuredClone(state);
    const isOverDecimal = !validator.isDecimal(value, { decimal_digits: '0,3' });

    const isNotInRange = isNumNotInRange(value);
    const valType: keyof CollectionForm = isNum ? 'numberOfContainers' : 'volumePerContainers';
    clonedState[valType].value = value;
    clonedState[valType].isInvalid = isNotInRange || isOverDecimal;

    const multipliedVol = calcVolume(
      clonedState.numberOfContainers.value,
      clonedState.volumePerContainers.value
    );
    clonedState.volumeOfCones.value = multipliedVol;

    setStepData('collectionStep', clonedState);
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
    setStepData('collectionStep', clonedState);
  };

  const handleCollectionMethods = (selectedMethod: string) => {
    const clonedState = structuredClone(state);
    const index = clonedState.selectedCollectionCodes.value.indexOf(selectedMethod);
    if (index > -1) {
      clonedState.selectedCollectionCodes.value.splice(index, 1);
    } else {
      clonedState.selectedCollectionCodes.value.push(selectedMethod);
    }
    setStepData('collectionStep', clonedState);
  };

  const handleComment = (value: string) => {
    const clonedState = structuredClone(state);
    clonedState.comments.value = value;
    setStepData('collectionStep', clonedState);
  };

  return (
    <FlexGrid className="collection-step-container">
      <ScrollToTop enabled={!isReview} />
      <Row className="collection-step-row">
        <Column className="section-title" sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.titleSection.title}</h2>
          {
            isReview
              ? null
              : <Subtitle text={fieldsConfig.titleSection.subtitle} />
          }
        </Column>
      </Row>
      <ClientAndCodeInput
        showCheckbox={!isReview}
        checkboxId="collection-step-default-checkbox"
        clientInput={state.collectorAgency}
        locationCodeInput={state.locationCode}
        textConfig={agencyFieldsProps}
        defaultClientNumber={defaultClientNumber}
        defaultLocCode={defaultCode}
        setClientAndCode={
          (
            agency: StringInputType,
            locationCode: StringInputType
          ) => setClientAndCode(agency, locationCode)
        }
        readOnly={isFormSubmitted && !isReview}
        maxInputColSize={6}
      />
      <Row className="collection-step-row">
        <Column className="section-title" sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.collectionTitle.title}</h2>
          {
            isReview
              ? null
              : <Subtitle text={fieldsConfig.collectionTitle.subtitle} />
          }
        </Column>
      </Row>
      {
        isReview
          ? null
          : (
            <Row className="collection-step-row collection-area-map-section">
              <Column sm={4} md={8} lg={16} xlg={16}>
                <Button
                  kind="tertiary"
                  size="md"
                  renderIcon={Location}
                  onClick={launchCollectionAreaMap}
                  disabled={isFormSubmitted || !seedlotNumber}
                >
                  {
                    collectionAreaSummary
                      ? 'Edit collection area on map'
                      : 'Define collection area on map'
                  }
                </Button>
                {
                  collectionAreaSummary
                    ? (
                      <Tile className="collection-area-summary">
                        <p><strong>Collection area saved</strong></p>
                        <p>
                          {`${collectionAreaSummary.polygonCount} polygon(s) · `}
                          {`${collectionAreaSummary.areaHectares} ha`}
                        </p>
                        {
                          collectionAreaSummary.becZones.length > 0
                            ? (
                              <p>
                                {'BEC zone(s): '}
                                {collectionAreaSummary.becZones.map((zone) => (
                                  <Tag key={zone} type="green">{zone}</Tag>
                                ))}
                              </p>
                            )
                            : null
                        }
                        {derived ? (
                          <>
                            <p>{`Mean lat/long: ${derived.latLng ?? '—'}`}</p>
                            <p>{`Elevation: ${derived.elevation ?? '—'}`}</p>
                            <p>{`BEC variant: ${derived.becVariant ?? '—'}`}</p>
                            <p>{`Forest district: ${derived.forestDistrict ?? '—'}`}</p>
                          </>
                        ) : null}
                      </Tile>
                    )
                    : null
                }
              </Column>
            </Row>
          )
      }
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            readOnly={isFormSubmitted && !isReview}
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
              helperText={isReview ? null : fieldsConfig.startDate.helperText}
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
            readOnly={isFormSubmitted && !isReview}
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
              helperText={isReview ? null : fieldsConfig.endDate.helperText}
              invalid={state.endDate.isInvalid}
              invalidText={fieldsConfig.endDate.invalidText}
              aria-invalid={state.endDate.isInvalid ? 'true' : 'false'}
              size="md"
              autoComplete="off"
            />
          </DatePicker>
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id={state.numberOfContainers.id}
            type="number"
            name={fieldsConfig.numberOfContainers.name}
            value={state.numberOfContainers.value}
            labelText={fieldsConfig.numberOfContainers.labelText}
            readOnly={isFormSubmitted && !isReview}
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
            readOnly={isFormSubmitted && !isReview}
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
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextInput
            id={state.volumeOfCones.id}
            type="number"
            name={fieldsConfig.volumeOfCones.name}
            value={state.volumeOfCones.value}
            labelText={fieldsConfig.volumeOfCones.labelText}
            invalid={state.volumeOfCones.isInvalid}
            invalidText={fieldsConfig.volumeOfCones.invalidText}
            helperText={isReview ? null : fieldsConfig.volumeOfCones.helperText}
            warn={isCalcWrong}
            readOnly={isFormSubmitted && !isReview}
            warnText={fieldsConfig.volumeOfCones.warnText}
            aria-invalid={state.volumeOfCones.isInvalid ? 'true' : 'false'}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleVolOfCones(e.target.value);
            }}
          />
        </Column>
      </Row>
      <Row className="collection-step-row">
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
                    /* POC-demo guard: render even if the reference query 401s in local dev */
                    ((coneCollectionMethodsQuery.data as MultiOptionsObj[]) ?? [])
                      .sort((a, b) => a.description.localeCompare(b.description))
                      .map((method) => (
                        <Checkbox
                          key={method.code}
                          id={`cone-collection-method-checkbox-${method.code}`}
                          name={method.label}
                          labelText={method.description}
                          readOnly={isFormSubmitted && !isReview}
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
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextArea
            id={state.comments.id}
            name={fieldsConfig.comments.name}
            labelText={fieldsConfig.comments.labelText}
            readOnly={isFormSubmitted && !isReview}
            placeholder={fieldsConfig.comments.placeholder}
            defaultValue={state.comments.value}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
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

export default CollectionStep;
