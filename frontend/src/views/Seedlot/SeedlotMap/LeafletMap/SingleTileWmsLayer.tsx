import { createElementObject, createLayerComponent, type LeafletContextInterface } from '@react-leaflet/core';
import L, { type LatLngBounds, type LatLngBoundsExpression } from 'leaflet';

interface SingleTileWmsLayerOptions {
  url: string;
  layers: string;
  styles?: string;
  format?: string;
  transparent?: boolean;
  opacity?: number;
  minScale?: number;
  maxScale?: number;
}

export interface SingleTileWmsLayerProps extends SingleTileWmsLayerOptions {
  pane?: string;
  attribution?: string;
}

const WEB_MERCATOR_SCALE_ZOOM_0 = 559082264.0287178;
// Single-tile WMS images go to `overlayPane` (z-index 400) rather than
// `tilePane` (z-index 200). Leaflet's `L.imageOverlay` defaults to its own
// option-level `zIndex: 1` and does NOT auto-increment like `L.TileLayer`
// does — so an imageOverlay inside `tilePane` ends up BELOW every tile
// layer (basemap at z=109, other TileLayers at 142+), silently
// invisible. Routing through `overlayPane` sidesteps the issue and stacks
// the WMS overlays above the basemap by virtue of pane ordering.
const WMS_IMAGE_PANE = 'overlayPane';

const scaleDenominatorForZoom = (zoom: number) => WEB_MERCATOR_SCALE_ZOOM_0 / (2 ** zoom);

export class SingleTileWmsLeafletLayer extends L.Layer {
  private imageOverlay: L.ImageOverlay | null = null;

  private mapInstance: L.Map | null = null;

  private wmsOptions: SingleTileWmsLayerOptions;

  constructor(options: SingleTileWmsLayerOptions) {
    super();
    this.wmsOptions = options;
  }

  onAdd(map: L.Map) {
    this.mapInstance = map;
    map.on('moveend zoomend resize', this.refresh, this);
    this.refresh();
    return this;
  }

  onRemove(map: L.Map) {
    map.off('moveend zoomend resize', this.refresh, this);
    this.removeImageOverlay();
    this.mapInstance = null;
    return this;
  }

  setWmsOptions(options: SingleTileWmsLayerOptions) {
    this.wmsOptions = options;
    this.refresh();
  }

  private isInScaleRange() {
    const map = this.mapInstance;
    if (!map) return false;

    const scale = scaleDenominatorForZoom(map.getZoom());
    const { minScale, maxScale } = this.wmsOptions;

    if (minScale && scale < minScale) return false;
    if (maxScale && scale > maxScale) return false;
    return true;
  }

  private refresh() {
    const map = this.mapInstance;
    if (!map) return;

    if (!this.isInScaleRange()) {
      this.removeImageOverlay();
      return;
    }

    const bounds = map.getBounds();
    const size = map.getSize();
    const url = this.buildWmsUrl(bounds, size.x, size.y);

    this.removeImageOverlay();
    this.imageOverlay = L.imageOverlay(url, bounds as LatLngBoundsExpression, {
      opacity: this.wmsOptions.opacity,
      pane: this.options.pane,
      attribution: this.options.attribution
    });
    this.imageOverlay.addTo(map);
  }

  private removeImageOverlay() {
    if (!this.imageOverlay) return;

    this.imageOverlay.remove();
    this.imageOverlay = null;
  }

  private buildWmsUrl(bounds: LatLngBounds, width: number, height: number) {
    const crs = L.CRS.EPSG3857;
    const sw = crs.project(bounds.getSouthWest());
    const ne = crs.project(bounds.getNorthEast());
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.1.1',
      request: 'GetMap',
      layers: this.wmsOptions.layers,
      styles: this.wmsOptions.styles ?? '',
      format: this.wmsOptions.format ?? 'image/png',
      transparent: String(this.wmsOptions.transparent ?? true),
      srs: 'EPSG:3857',
      width: String(Math.max(1, Math.round(width))),
      height: String(Math.max(1, Math.round(height))),
      bbox: [sw.x, sw.y, ne.x, ne.y].join(',')
    });

    return `${this.wmsOptions.url}?${params.toString()}`;
  }
}

const createSingleTileWmsLayer = (
  props: SingleTileWmsLayerProps,
  context: LeafletContextInterface
) => {
  const { pane, attribution, ...wmsOptions } = props;
  const layer = new SingleTileWmsLeafletLayer(wmsOptions);
  layer.options.pane = pane ?? context.pane ?? WMS_IMAGE_PANE;
  layer.options.attribution = attribution;
  return createElementObject(layer, context);
};

const updateSingleTileWmsLayer = (
  layer: SingleTileWmsLeafletLayer,
  props: SingleTileWmsLayerProps,
  previousProps: SingleTileWmsLayerProps
) => {
  if (
    props.url !== previousProps.url
    || props.layers !== previousProps.layers
    || props.styles !== previousProps.styles
    || props.format !== previousProps.format
    || props.transparent !== previousProps.transparent
    || props.opacity !== previousProps.opacity
    || props.minScale !== previousProps.minScale
    || props.maxScale !== previousProps.maxScale
  ) {
    layer.setWmsOptions(props);
  }
};

const SingleTileWmsLayer = createLayerComponent<SingleTileWmsLeafletLayer, SingleTileWmsLayerProps>(
  createSingleTileWmsLayer,
  updateSingleTileWmsLayer
);

export default SingleTileWmsLayer;
