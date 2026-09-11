declare module '@maphubs/tokml' {
  import type { FeatureCollection, Feature, GeoJsonObject } from 'geojson';

  /**
   * Options accepted by the `@maphubs/tokml` serializer. The upstream JS
   * module is a CommonJS default export with no TypeScript declarations,
   * so we ship a minimal local shim matching the knobs we actually use
   * from `exportShape.ts`.
   */
  export interface ToKmlOptions {
    /** Human-readable document name written under `<Document><name>`. */
    documentName?: string;
    /** Optional `<description>` tag under `<Document>`. */
    documentDescription?: string;
    /** Property key on each feature used for the placemark name. */
    name?: string;
    /** Property key on each feature used for the placemark description. */
    description?: string;
    /** Emit `simplestyle-spec` styling tags for each feature. */
    simplestyle?: boolean;
    /** Property key on each feature used for the placemark timestamp. */
    timestamp?: string;
  }

  /**
   * Serialize a GeoJSON `FeatureCollection` (or any other GeoJSON object
   * the upstream module accepts) to a KML 2.2 XML string.
   */
  const tokml: (
    geojson: FeatureCollection | Feature | GeoJsonObject,
    options?: ToKmlOptions
  ) => string;

  export default tokml;
}
