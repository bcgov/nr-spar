import {
  createElementObject,
  createLayerComponent,
  type LeafletContextInterface
} from '@react-leaflet/core';

import {
  SeedlotPointsLeafletLayer,
  type SeedlotPointsLayerOptions
} from './seedlotPointsLayer';

/**
 * React-Leaflet wrapper around `SeedlotPointsLeafletLayer`. Use this
 * inside `<LayersControl.Overlay>` so the user can toggle the layer
 * from the standard layers panel; the underlying Leaflet layer takes
 * care of fetching from DataBC WFS and rendering per-species circles.
 */
export interface SeedlotPointsLayerProps extends SeedlotPointsLayerOptions {
  pane?: string;
  attribution?: string;
}

const createSeedlotPointsLayer = (
  props: SeedlotPointsLayerProps,
  context: LeafletContextInterface
) => {
  const layer = new SeedlotPointsLeafletLayer(props);
  return createElementObject(layer, context);
};

const updateSeedlotPointsLayer = (
  layer: SeedlotPointsLeafletLayer,
  props: SeedlotPointsLayerProps,
  prev: SeedlotPointsLayerProps
) => {
  if (
    props.typeName !== prev.typeName
    || props.activeOnly !== prev.activeOnly
    || props.labelText !== prev.labelText
    || props.maxScale !== prev.maxScale
    || props.speciesCode !== prev.speciesCode
  ) {
    layer.setLayerOptions(props);
  }
};

const SeedlotPointsLayer = createLayerComponent<
  SeedlotPointsLeafletLayer,
  SeedlotPointsLayerProps
>(createSeedlotPointsLayer, updateSeedlotPointsLayer);

export default SeedlotPointsLayer;
