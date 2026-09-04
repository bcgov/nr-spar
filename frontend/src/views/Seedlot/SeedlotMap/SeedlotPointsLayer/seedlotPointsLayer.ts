import L from 'leaflet';

import {
  fetchSeedlotPoints,
  type SeedlotPoint
} from '../../../../api-service/seedlotPointsApi';
import { colorForSpecies } from './colors';

/**
 * Constructor options for `SeedlotPointsLeafletLayer`.
 */
export interface SeedlotPointsLayerOptions {
  /** WFS typeName, e.g. `pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW`. */
  typeName: string;
  /** Filter on `ACTIVE_IND` — `'YES'` for active, `'NO'` for expired, `null` for both. */
  activeOnly: 'YES' | 'NO' | null;
  /** Human-readable label used in the popup ("Seedlot" or "Veg Lot"). */
  labelText: string;
  /**
   * Optional maxScale — when the map's scale denominator exceeds this
   * (i.e. we're more zoomed-out than the layer is useful), the layer
   * hides itself and skips the WFS request. Matches the legacy SPAR
   * scale bounds for the per-species WMS layers (198000 for seedlots,
   * 198000 for veglots).
   */
  maxScale?: number;
  /**
   * Optional `VEGETATION_CODE` filter — only fetch features for this
   * species. Wired up to the legacy `?species=` URL param so deep
   * links can pre-narrow the visible seedlot/veglot set.
   */
  speciesCode?: string | null;
}

const WEB_MERCATOR_SCALE_ZOOM_0 = 559082264.0287178;
const FETCH_DEBOUNCE_MS = 300;

/**
 * Build the marker popup as a DOM node rather than an HTML string.
 *
 * `L.Popup.setContent` assigns a string argument via `innerHTML`, so any
 * feature attribute interpolated into a template literal would be parsed
 * as markup. These values come from the DataBC WFS response, which we do
 * not control end-to-end. Using `textContent` makes injection structurally
 * impossible instead of relying on an escape helper being remembered at
 * every call site — and matches how `<BecIdentifyLayer>` renders the same
 * attributes through JSX.
 */
const buildPointPopup = (p: SeedlotPoint, labelText: string): HTMLElement => {
  const root = document.createElement('div');
  root.className = 'seedlot-point-popup';

  const addRow = (child: Node): void => {
    const row = document.createElement('div');
    row.appendChild(child);
    root.appendChild(row);
  };

  const title = document.createElement('strong');
  title.textContent = `${labelText} ${p.lotNumber}`;
  addRow(title);

  const addText = (text: string): void => addRow(document.createTextNode(text));

  if (p.vegetationCode) addText(`Species: ${p.vegetationCode}`);
  if (p.bcgZone) addText(`BEC: ${p.bcgZone}`);
  if (p.activeIndicator) {
    addText(`Status: ${p.activeIndicator === 'YES' ? 'Active' : 'Expired'}`);
  }
  return root;
};

/**
 * Custom Leaflet layer that fetches seedlot/veglot point features from
 * the DataBC WFS for the current viewport and renders them as
 * per-species coloured circle markers. Replaces the legacy SPAR
 * approach of stacking 24+ per-species WMS layers — one fetch instead
 * of 24, no socket pressure, and styling stays under our control.
 *
 * Mounted via `<SeedlotPointsLayer>` (the React-Leaflet wrapper) inside
 * a `<LayersControl.Overlay>` so the user can toggle visibility from
 * the layers panel. Hides + skips the fetch when zoomed out beyond
 * `maxScale` — matches legacy scale gating.
 */
export class SeedlotPointsLeafletLayer extends L.LayerGroup {
  private mapInstance: L.Map | null = null;

  private fetchTimer: ReturnType<typeof setTimeout> | null = null;

  private inFlight = false;

  private wfsOptions: SeedlotPointsLayerOptions;

  // Distinct VEGETATION_CODEs currently rendered, surfaced to the dynamic
  // legend's "Species" key (the markers are coloured by species).
  private renderedSpecies: string[] = [];

  constructor(options: SeedlotPointsLayerOptions) {
    super([]);
    this.wfsOptions = options;
  }

  /** Distinct VEGETATION_CODEs currently rendered — read by the legend. */
  getRenderedSpecies(): string[] {
    return this.renderedSpecies;
  }

  private setRenderedSpecies(codes: string[]): void {
    this.renderedSpecies = codes;
    // Tell the dynamic legend the in-view species changed so it can refresh
    // its "Species" key. Fires on the map so <LegendDataLayer> can listen
    // without holding a reference to every point layer.
    this.mapInstance?.fire('spar:pointsrendered');
  }

  onAdd(map: L.Map): this {
    super.onAdd(map);
    this.mapInstance = map;
    map.on('moveend zoomend', this.scheduleRefresh, this);
    this.scheduleRefresh();
    return this;
  }

  onRemove(map: L.Map): this {
    map.off('moveend zoomend', this.scheduleRefresh, this);
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
      this.fetchTimer = null;
    }
    this.clearLayers();
    // Drop the species directly (no event) — the map's `layerremove` is
    // what prompts <LegendDataLayer> to refresh once removal completes.
    this.renderedSpecies = [];
    this.mapInstance = null;
    super.onRemove(map);
    return this;
  }

  setLayerOptions(options: SeedlotPointsLayerOptions): void {
    this.wfsOptions = options;
    this.scheduleRefresh();
  }

  private currentScaleDenominator(): number {
    if (!this.mapInstance) return Number.POSITIVE_INFINITY;
    return WEB_MERCATOR_SCALE_ZOOM_0 / (2 ** this.mapInstance.getZoom());
  }

  private isInScaleRange(): boolean {
    const { maxScale } = this.wfsOptions;
    if (!maxScale) return true;
    return this.currentScaleDenominator() <= maxScale;
  }

  private scheduleRefresh = (): void => {
    if (this.fetchTimer) clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(() => {
      this.fetchTimer = null;
      this.refresh();
    }, FETCH_DEBOUNCE_MS);
  };

  private async refresh(): Promise<void> {
    const map = this.mapInstance;
    if (!map) return;

    if (!this.isInScaleRange()) {
      this.clearLayers();
      this.setRenderedSpecies([]);
      return;
    }

    // De-dupe concurrent fetches — if a previous request is still in
    // flight, the next `moveend` will trigger another anyway via the
    // debounce timer.
    if (this.inFlight) return;
    this.inFlight = true;

    const bounds = map.getBounds();
    try {
      const points = await fetchSeedlotPoints(
        this.wfsOptions.typeName,
        {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast()
        },
        this.wfsOptions.activeOnly,
        this.wfsOptions.speciesCode ?? null
      );
      this.renderPoints(points);
    } catch {
      // Fail silent — a transient WFS hiccup shouldn't blank the map
      // permanently. Next moveend will retry.
    } finally {
      this.inFlight = false;
    }
  }

  private renderPoints(points: SeedlotPoint[]): void {
    this.clearLayers();
    const { labelText } = this.wfsOptions;
    const species = new Set<string>();
    points.forEach((p) => {
      const code = (p.vegetationCode ?? '').toUpperCase();
      if (code) species.add(code);
      const color = colorForSpecies(p.vegetationCode);
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 5,
        color: '#212121',
        weight: 1,
        fillColor: color,
        fillOpacity: 0.85,
        interactive: true
      });
      marker.bindPopup(buildPointPopup(p, labelText));
      this.addLayer(marker);
    });
    this.setRenderedSpecies([...species]);
  }
}
