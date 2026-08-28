import { CollectionForm } from '../CollectionStep/definitions';
import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';

export type BClassCollectionForm = CollectionForm & {
  orgUnit: OptionsInputType,
  locationArea: StringInputType,
  collectionRadius: StringInputType,
  elevationMin: StringInputType,
  elevationMax: StringInputType,
  elevationMean: StringInputType,
  captureMethod: OptionsInputType,
  numberTreesFrom: OptionsInputType,
  latDeg: StringInputType,
  latMin: StringInputType,
  latSec: StringInputType,
  longDeg: StringInputType,
  longMin: StringInputType,
  longSec: StringInputType,
  useLatLongForBec: BooleanInputType,
  becZone: OptionsInputType,
  becSubzone: OptionsInputType,
  becVariant: OptionsInputType
};
