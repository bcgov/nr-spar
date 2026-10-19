import React from 'react';
import {
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
  Tag,
  DropdownSkeleton,
  RadioButtonSkeleton
} from '@carbon/react';
import { Location } from '@carbon/icons-react';

import { now } from '../../../utils/DateUtils';
import { FilterObj, filterInput } from '../../../utils/FilterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { StringInputType } from '../../../types/FormInputType';

import Subtitle from '../../Subtitle';
import ClientAndCodeInput from '../../ClientAndCodeInput';
import {
  DATE_FORMAT, agencyFieldsProps, fieldsConfig
} from './constants';
import { BClassCollectionForm } from './definitions';

const itemLabel = (item: MultiOptionsObj | null) => (item ? item.label : '');
const itemDescription = (item: MultiOptionsObj | null) => (item ? item.description : '');
const ariaInvalid = (invalid: boolean): 'true' | 'false' => (invalid ? 'true' : 'false');
const reviewHelper = (isReview: boolean | undefined, text: string) => (
  isReview ? undefined : text
);
const selectedOrNull = (item: MultiOptionsObj) => (item.code ? item : null);

const ReviewSubtitle = ({ isReview, text }: { isReview?: boolean; text: string }) => (
  isReview ? null : <Subtitle text={text} />
);

const ReviewHelperText = ({ isReview, text }: { isReview?: boolean; text: string }) => {
  if (isReview) return null;
  return (
    <Row className="b-class-collection-row">
      <Column sm={4} md={8} lg={16} xlg={16}>
        <p className="bx--form__helper-text">{text}</p>
      </Column>
    </Row>
  );
};

type ComboField = 'orgUnit' | 'captureMethod' | 'numberTreesFrom' | 'becZone' | 'becSubzone' | 'becVariant';
type ComboHandler = (
  field: ComboField,
  selected: MultiOptionsObj | null | undefined
) => void;

const comboFilter = ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue });

interface SharedSectionProps {
  state: BClassCollectionForm;
  isReview?: boolean;
  readOnly: boolean;
}

interface LatLongSectionProps extends SharedSectionProps {
  seedlotNumber?: string;
  onLaunchMap: () => void;
  onDmsChange: (
    field: 'latDeg' | 'latMin' | 'latSec' | 'longDeg' | 'longMin' | 'longSec',
    value: string
  ) => void;
}

export const CollectionLatLongSection = ({
  state,
  isReview,
  readOnly,
  seedlotNumber,
  onLaunchMap,
  onDmsChange
}: LatLongSectionProps) => {
  const mapButtonLabel = state.collectionGeometry.value
    ? 'Edit collection area on SeedMap'
    : 'Define collection area on SeedMap';

  return (
    <>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.latLongSection.title}</h2>
          <ReviewSubtitle isReview={isReview} text={fieldsConfig.latLongSection.subtitle} />
        </Column>
      </Row>
      {isReview ? null : (
        <Row className="b-class-collection-row b-class-collection-map-row">
          <Column sm={4} md={8} lg={16} xlg={16}>
            <Button
              kind="tertiary"
              size="md"
              renderIcon={Location}
              onClick={onLaunchMap}
              disabled={readOnly || !seedlotNumber}
            >
              {mapButtonLabel}
            </Button>
            {state.collectionGeometry.value ? (
              <Tag type="green" className="collection-area-defined-tag">
                Collection area defined
              </Tag>
            ) : null}
          </Column>
        </Row>
      )}
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <p className="bx--label">{fieldsConfig.latLongSection.latLabel}</p>
        </Column>
      </Row>
      <Row>
        <Column>
          <TextInput
            id={state.latDeg.id}
            placeholder={fieldsConfig.latLongSection.degreePlaceholder}
            value={state.latDeg.value}
            readOnly={readOnly}
            invalid={state.latDeg.isInvalid}
            decorator={<span aria-hidden>°</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDmsChange('latDeg', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.latMin.id}
            placeholder={fieldsConfig.latLongSection.minutePlaceholder}
            value={state.latMin.value}
            readOnly={readOnly}
            invalid={state.latMin.isInvalid}
            decorator={<span aria-hidden>&#39;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDmsChange('latMin', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.latSec.id}
            placeholder={fieldsConfig.latLongSection.secondPlaceholder}
            value={state.latSec.value}
            readOnly={readOnly}
            invalid={state.latSec.isInvalid}
            decorator={<span aria-hidden>&#34;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDmsChange('latSec', e.target.value)}
          />
        </Column>
      </Row>
      <ReviewHelperText isReview={isReview} text={fieldsConfig.latLongSection.latHelper} />
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <p className="bx--label">{fieldsConfig.latLongSection.longLabel}</p>
        </Column>
      </Row>
      <Row>
        <Column>
          <TextInput
            id={state.longDeg.id}
            placeholder={fieldsConfig.latLongSection.degreePlaceholder}
            value={state.longDeg.value}
            readOnly={readOnly}
            invalid={state.longDeg.isInvalid}
            decorator={<span aria-hidden>°</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDmsChange('longDeg', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.longMin.id}
            placeholder={fieldsConfig.latLongSection.minutePlaceholder}
            value={state.longMin.value}
            readOnly={readOnly}
            invalid={state.longMin.isInvalid}
            decorator={<span aria-hidden>&#39;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDmsChange('longMin', e.target.value)}
          />
        </Column>
        <Column>
          <TextInput
            id={state.longSec.id}
            placeholder={fieldsConfig.latLongSection.secondPlaceholder}
            value={state.longSec.value}
            readOnly={readOnly}
            invalid={state.longSec.isInvalid}
            decorator={<span aria-hidden>&#34;</span>}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDmsChange('longSec', e.target.value)}
          />
        </Column>
      </Row>
      <ReviewHelperText isReview={isReview} text={fieldsConfig.latLongSection.longHelper} />
    </>
  );
};

interface BecSectionProps extends SharedSectionProps {
  selectedZoneCode: string;
  selectedSubzoneCode: string;
  becZoneItems: MultiOptionsObj[];
  becSubzoneItems: MultiOptionsObj[];
  becVariantItems: MultiOptionsObj[];
  becVariantPlaceholderText: string;
  catalogueFetching: boolean;
  onUseLatLongForBec: (checked: boolean) => void;
  onComboSelection: ComboHandler;
}

export const CollectionBecSection = ({
  state,
  isReview,
  readOnly,
  selectedZoneCode,
  selectedSubzoneCode,
  becZoneItems,
  becSubzoneItems,
  becVariantItems,
  becVariantPlaceholderText,
  catalogueFetching,
  onUseLatLongForBec,
  onComboSelection
}: BecSectionProps) => {
  const becReadOnly = readOnly || state.useLatLongForBec.value;
  const subzonePlaceholder = selectedZoneCode ? 'Choose subzone' : 'Choose zone first';

  return (
    <>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.becSection.title}</h2>
          <ReviewSubtitle isReview={isReview} text={fieldsConfig.becSection.subtitle} />
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
              onUseLatLongForBec(checked);
            }}
          />
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={5} xlg={5}>
          {catalogueFetching ? <DropdownSkeleton /> : (
            <ComboBox
              id={state.becZone.id}
              titleText={fieldsConfig.becSection.zoneLabel}
              placeholder="Choose BEC zone"
              items={becZoneItems}
              itemToString={itemLabel}
              selectedItem={selectedOrNull(state.becZone.value)}
              readOnly={becReadOnly}
              invalid={state.becZone.isInvalid}
              shouldFilterItem={comboFilter}
              onChange={(e: ComboBoxEvent) => onComboSelection('becZone', e.selectedItem)}
            />
          )}
        </Column>
        <Column sm={4} md={4} lg={5} xlg={5}>
          {catalogueFetching ? <DropdownSkeleton /> : (
            <ComboBox
              id={state.becSubzone.id}
              titleText={fieldsConfig.becSection.subzoneLabel}
              placeholder={subzonePlaceholder}
              items={becSubzoneItems}
              itemToString={itemLabel}
              selectedItem={selectedOrNull(state.becSubzone.value)}
              readOnly={becReadOnly || !selectedZoneCode}
              invalid={state.becSubzone.isInvalid}
              shouldFilterItem={comboFilter}
              onChange={(e: ComboBoxEvent) => onComboSelection('becSubzone', e.selectedItem)}
            />
          )}
        </Column>
        <Column sm={4} md={4} lg={5} xlg={5}>
          {catalogueFetching ? <DropdownSkeleton /> : (
            <ComboBox
              id={state.becVariant.id}
              titleText={fieldsConfig.becSection.variantLabel}
              placeholder={becVariantPlaceholderText}
              items={becVariantItems}
              itemToString={itemLabel}
              selectedItem={selectedOrNull(state.becVariant.value)}
              readOnly={becReadOnly || !selectedSubzoneCode}
              invalid={state.becVariant.isInvalid}
              shouldFilterItem={comboFilter}
              onChange={(e: ComboBoxEvent) => onComboSelection('becVariant', e.selectedItem)}
            />
          )}
        </Column>
      </Row>
      {isReview ? null : (
        <Row className="b-class-collection-row">
          <Column sm={4} md={8} lg={16} xlg={16}>
            <Button kind="ghost" className="bec-search-link">
              {fieldsConfig.becSection.becSearchLink}
            </Button>
          </Column>
        </Row>
      )}
    </>
  );
};

interface LocationSectionProps extends SharedSectionProps {
  defaultClientNumber: string;
  defaultCode: string;
  orgUnitItems: MultiOptionsObj[];
  orgUnitFetching: boolean;
  onSetClientAndCode: (agency: StringInputType, locationCode: StringInputType) => void;
  onComboSelection: ComboHandler;
  onLocationAreaChange: (value: string) => void;
  onRadiusChange: (value: number | string) => void;
  onElevationChange: (field: 'elevationMin' | 'elevationMax' | 'elevationMean', value: string) => void;
}

export const CollectionLocationSection = ({
  state,
  isReview,
  readOnly,
  defaultClientNumber,
  defaultCode,
  orgUnitItems,
  orgUnitFetching,
  onSetClientAndCode,
  onComboSelection,
  onLocationAreaChange,
  onRadiusChange,
  onElevationChange
}: LocationSectionProps) => (
  <>
    <Row className="b-class-collection-row">
      <Column sm={4} md={8} lg={16} xlg={16}>
        <h2>{fieldsConfig.collectorSection.title}</h2>
        <ReviewSubtitle isReview={isReview} text={fieldsConfig.collectorSection.subtitle} />
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
      setClientAndCode={onSetClientAndCode}
      readOnly={readOnly}
      maxInputColSize={6}
    />
    <Row className="b-class-collection-row">
      <Column sm={4} md={8} lg={16} xlg={16}>
        <h2>{fieldsConfig.collectionInformationSection.title}</h2>
        <ReviewSubtitle isReview={isReview} text={fieldsConfig.collectionInformationSection.subtitle} />
      </Column>
    </Row>
    <Row className="b-class-collection-row">
      <Column sm={4} md={8} lg={8} xlg={6}>
        {orgUnitFetching ? <DropdownSkeleton /> : (
          <ComboBox
            id={state.orgUnit.id}
            titleText={fieldsConfig.orgUnit.labelText}
            placeholder={fieldsConfig.orgUnit.placeholder}
            helperText={reviewHelper(isReview, fieldsConfig.orgUnit.helperText)}
            items={orgUnitItems}
            itemToString={itemLabel}
            selectedItem={selectedOrNull(state.orgUnit.value)}
            readOnly={readOnly}
            invalid={state.orgUnit.isInvalid}
            shouldFilterItem={comboFilter}
            onChange={(e: ComboBoxEvent) => onComboSelection('orgUnit', e.selectedItem)}
          />
        )}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationAreaChange(e.target.value)}
        />
        <ReviewHelperText isReview={isReview} text={fieldsConfig.locationArea.helperText} />
      </Column>
      <Column sm={4} md={4} lg={8} xlg={6}>
        <NumberInput
          id={state.collectionRadius.id}
          label={fieldsConfig.collectionRadius.labelText}
          placeholder={fieldsConfig.collectionRadius.placeholder}
          value={state.collectionRadius.value ? Number(state.collectionRadius.value) : ''}
          readOnly={readOnly}
          min={0}
          max={8}
          step={0.1}
          onChange={(_e: React.ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
            onRadiusChange(value);
          }}
        />
        <ReviewHelperText isReview={isReview} text={fieldsConfig.collectionRadius.helperText} />
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
            onElevationChange('elevationMin', e.target.value);
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
            onElevationChange('elevationMax', e.target.value);
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
            onElevationChange('elevationMean', e.target.value);
          }}
        />
      </Column>
    </Row>
    <ReviewHelperText isReview={isReview} text={fieldsConfig.elevation.helperText} />
  </>
);

interface MethodsSectionProps extends SharedSectionProps {
  isCalcWrong: boolean;
  captureMethodItems: MultiOptionsObj[];
  selectedCaptureMethod: MultiOptionsObj | null;
  captureFetching: boolean;
  coneMethodsFetching: boolean;
  coneMethods: MultiOptionsObj[] | undefined;
  numberTreesFetching: boolean;
  numberTreesItems: MultiOptionsObj[] | undefined;
  onComboSelection: ComboHandler;
  onDateChange: (isStartDate: boolean, value: string) => void;
  onContainerNumAndVol: (isNum: boolean, value: string) => void;
  onVolOfCones: (value: string) => void;
  onCollectionMethods: (selectedMethod: string) => void;
  onComment: (value: string) => void;
}

export const CollectionMethodsSection = ({
  state,
  isReview,
  readOnly,
  isCalcWrong,
  captureMethodItems,
  selectedCaptureMethod,
  captureFetching,
  coneMethodsFetching,
  coneMethods,
  numberTreesFetching,
  numberTreesItems,
  onComboSelection,
  onDateChange,
  onContainerNumAndVol,
  onVolOfCones,
  onCollectionMethods,
  onComment
}: MethodsSectionProps) => {
  const maxDate = reviewHelper(isReview, now);

  return (
    <>
      <Row>
        <Column sm={4} md={8} lg={8} xlg={6}>
          {captureFetching ? <DropdownSkeleton /> : (
            <ComboBox
              id={state.captureMethod.id}
              titleText={fieldsConfig.captureMethod.labelText}
              placeholder={fieldsConfig.captureMethod.placeholder}
              items={captureMethodItems}
              itemToString={itemDescription}
              selectedItem={selectedCaptureMethod}
              readOnly={readOnly}
              invalid={state.captureMethod.isInvalid}
              shouldFilterItem={comboFilter}
              onChange={(e: ComboBoxEvent) => onComboSelection('captureMethod', e.selectedItem)}
            />
          )}
        </Column>
      </Row>
      <ReviewHelperText isReview={isReview} text={fieldsConfig.captureMethod.helperText} />
      <Row className="b-class-collection-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            readOnly={readOnly}
            maxDate={maxDate}
            value={state.startDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              onDateChange(true, selectedDate);
            }}
          >
            <DatePickerInput
              id={state.startDate.id}
              name={fieldsConfig.startDate.name}
              placeholder={fieldsConfig.startDate.placeholder}
              labelText={fieldsConfig.startDate.labelText}
              helperText={reviewHelper(isReview, fieldsConfig.startDate.helperText)}
              invalid={state.startDate.isInvalid}
              invalidText={fieldsConfig.startDate.invalidText}
              aria-invalid={ariaInvalid(state.startDate.isInvalid)}
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
            maxDate={maxDate}
            readOnly={readOnly}
            value={state.endDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              onDateChange(false, selectedDate);
            }}
          >
            <DatePickerInput
              id={state.endDate.id}
              name={fieldsConfig.endDate.name}
              placeholder={fieldsConfig.endDate.placeholder}
              labelText={fieldsConfig.endDate.labelText}
              helperText={reviewHelper(isReview, fieldsConfig.endDate.helperText)}
              invalid={state.endDate.isInvalid}
              invalidText={fieldsConfig.endDate.invalidText}
              aria-invalid={ariaInvalid(state.endDate.isInvalid)}
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
            aria-invalid={ariaInvalid(state.numberOfContainers.isInvalid)}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onContainerNumAndVol(true, e.target.value);
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
            aria-invalid={ariaInvalid(state.volumePerContainers.isInvalid)}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onContainerNumAndVol(false, e.target.value);
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
            helperText={reviewHelper(isReview, fieldsConfig.volumeOfCones.helperText)}
            warn={isCalcWrong}
            readOnly={readOnly}
            warnText={fieldsConfig.volumeOfCones.warnText}
            aria-invalid={ariaInvalid(state.volumeOfCones.isInvalid)}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onVolOfCones(e.target.value);
            }}
          />
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          {coneMethodsFetching ? (
            <>
              <CheckboxSkeleton />
              <CheckboxSkeleton />
              <CheckboxSkeleton />
            </>
          ) : (
            <CheckboxGroup
              legendText={fieldsConfig.collectionMethodOptionsLabel}
              id={state.selectedCollectionCodes.id}
            >
              {[...(coneMethods ?? [])]
                .sort((a, b) => a.description.localeCompare(b.description))
                .map((method) => (
                  <Checkbox
                    key={method.code}
                    id={`b-cone-collection-method-checkbox-${method.code}`}
                    name={method.label}
                    labelText={method.description}
                    readOnly={readOnly}
                    checked={state.selectedCollectionCodes.value.includes(method.code)}
                    onChange={() => onCollectionMethods(method.code)}
                  />
                ))}
            </CheckboxGroup>
          )}
        </Column>
      </Row>
      <Row className="b-class-collection-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          {numberTreesFetching ? <RadioButtonSkeleton /> : (
            <RadioButtonGroup
              legendText={fieldsConfig.numberTreesFrom.legendText}
              name="b-collection-number-trees-from"
              valueSelected={state.numberTreesFrom.value.code}
              orientation="vertical"
              readOnly={readOnly}
              onChange={(value: string) => {
                const selected = numberTreesItems?.find((opt) => opt.code === value);
                onComboSelection('numberTreesFrom', selected ?? null);
              }}
            >
              {(numberTreesItems ?? []).map((option) => (
                <RadioButton
                  key={option.code}
                  id={`b-number-trees-${option.code}`}
                  labelText={option.description}
                  value={option.code}
                />
              ))}
            </RadioButtonGroup>
          )}
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
              onComment(e.target.value);
            }}
            rows={5}
            maxCount={400}
            enableCounter
          />
        </Column>
      </Row>
    </>
  );
};
