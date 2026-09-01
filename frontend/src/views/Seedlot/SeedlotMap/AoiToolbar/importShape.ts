import { kml } from '@tmcw/togeojson';
import JSZip from 'jszip';
import shp, { parseZip } from 'shpjs';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  GeometryCollection,
  MultiPolygon,
  Polygon
} from 'geojson';

import type { AoiPolygon } from '../../../../types/SparMapTypes';

/**
 * Hard caps for imported shape files. Browser parsing of zip/KML/GeoJSON is
 * synchronous enough that unbounded uploads can freeze the tab (or worse,
 * inflate a zip bomb into memory). Keep these conservative — collection
 * polygons are small.
 */
export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024; // 10 MiB on disk
export const MAX_ZIP_UNCOMPRESSED_BYTES = 40 * 1024 * 1024; // 40 MiB inflated
export const MAX_ZIP_ENTRY_COUNT = 200;

/** Extensions the import picker and detector accept. */
export const ACCEPTED_IMPORT_FILE_EXTENSIONS = [
  '.kml',
  '.kmz',
  '.geojson',
  '.json',
  '.zip',
  '.shp'
] as const;

/**
 * Shape of the normalized import result surfaced to the toolbar UI.
 *
 * `polygons` contains only single-ring-capable `Feature<Polygon>` values
 * (what the rest of the SPAR AOI flow consumes). `warnings` is a flat
 * list of user-facing strings describing non-polygon features that were
 * skipped, multi-polygon splits that were performed, or any other soft
 * parsing concerns. An empty `warnings` array means the import was
 * completely clean.
 */
export interface ImportResult {
  polygons: AoiPolygon[];
  warnings: string[];
}

/**
 * Minimum size of a DataView we can inspect for a leading UTF-8 BOM.
 * Kept as a constant so the intent is obvious at the call site.
 */
const UTF8_BOM_STRIP = /^\uFEFF/;

/**
 * Lowercase-extension lookup to dispatch on file type. MIME types are
 * not reliable across browsers and OSes — some versions of Windows will
 * hand us `application/octet-stream` even for KML files — so we fall
 * back to the file extension whenever the MIME is ambiguous.
 */
export type ImportKind = 'kml' | 'kmz' | 'shp-zip' | 'shp' | 'geojson' | 'unknown';

export const detectImportKind = (file: File): ImportKind => {
  const name = file.name.toLowerCase();
  const mime = (file.type || '').toLowerCase();

  if (name.endsWith('.kml') || mime === 'application/vnd.google-earth.kml+xml') {
    return 'kml';
  }
  if (name.endsWith('.kmz') || mime === 'application/vnd.google-earth.kmz') {
    return 'kmz';
  }
  if (
    name.endsWith('.geojson')
    || name.endsWith('.json')
    || mime === 'application/geo+json'
    || mime === 'application/json'
  ) {
    return 'geojson';
  }
  if (name.endsWith('.shp')) {
    return 'shp';
  }
  if (name.endsWith('.zip') || mime === 'application/zip' || mime === 'application/x-zip-compressed') {
    return 'shp-zip';
  }
  return 'unknown';
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Reject oversized or unsupported files before we spend memory parsing them.
 */
export const assertImportFileAllowed = (file: File): void => {
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error(
      `File is too large (${formatBytes(file.size)}). `
      + `Maximum allowed size is ${formatBytes(MAX_IMPORT_FILE_BYTES)}.`
    );
  }
  if (detectImportKind(file) === 'unknown') {
    throw new Error(
      `Unsupported file type: ${file.name}. `
      + `Accepted: ${ACCEPTED_IMPORT_FILE_EXTENSIONS.join(', ')}`
    );
  }
};

/**
 * Guard against zip bombs: too many entries or too much inflated size.
 * Relies on the central-directory uncompressed sizes JSZip exposes after
 * `loadAsync` — we never inflate the whole archive first.
 */
const assertZipArchiveSafe = (zip: JSZip): void => {
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  if (entries.length > MAX_ZIP_ENTRY_COUNT) {
    throw new Error(
      `Archive has too many files (${entries.length}). `
      + `Maximum is ${MAX_ZIP_ENTRY_COUNT}.`
    );
  }

  let uncompressedTotal = 0;
  entries.forEach((entry) => {
    // JSZip stores uncompressed size on a private field, not the public type.
    /* eslint-disable no-underscore-dangle */
    const size = (entry as JSZip.JSZipObject & {
      _data?: { uncompressedSize?: number }
    })._data?.uncompressedSize ?? 0;
    /* eslint-enable no-underscore-dangle */
    uncompressedTotal += size;
    if (uncompressedTotal > MAX_ZIP_UNCOMPRESSED_BYTES) {
      throw new Error(
        `Archive expands to more than ${formatBytes(MAX_ZIP_UNCOMPRESSED_BYTES)}. `
        + 'Compress or simplify the shapefile/KMZ and try again.'
      );
    }
  });
};

/**
 * Wrap a bare Polygon/MultiPolygon geometry in a minimal GeoJSON Feature
 * so downstream normalization can treat everything as a feature list.
 */
const wrapGeometryAsFeature = (geometry: Geometry): Feature<Geometry> => ({
  type: 'Feature',
  geometry,
  properties: {}
});

/**
 * Pull all polygon-family geometries out of a GeoJSON structure, handling
 * the full range of inputs the parsers can emit:
 *
 *  - `FeatureCollection` → iterate `features[]`
 *  - single `Feature` → wrap in a 1-element list
 *  - bare `Polygon` / `MultiPolygon` geometry → wrap as feature
 *  - `GeometryCollection` → recurse on each member
 *
 * Any `MultiPolygon` encountered is expanded into N individual `Polygon`
 * features so each becomes an independent layer on the Geoman map (so
 * users can edit them separately). Non-polygon geometries are collected
 * in `skipped` for user-facing warnings.
 */
interface NormalizeResult {
  polygons: AoiPolygon[];
  skipped: string[];
}

const isPolygon = (g: Geometry | null): g is Polygon => g !== null && g.type === 'Polygon';

const isMultiPolygon = (g: Geometry | null): g is MultiPolygon => g !== null && g.type === 'MultiPolygon';

const isGeometryCollection = (g: Geometry | null): g is GeometryCollection => g !== null && g.type === 'GeometryCollection';

const polygonFromFeature = (
  source: Feature<Geometry>,
  geometry: Polygon
): AoiPolygon => ({
  type: 'Feature',
  geometry,
  // Preserve any user-authored metadata (name, description) so future
  // work can surface it in the polygon list — but strip undefined.
  properties: source.properties ?? {}
});

const splitMultiPolygon = (
  source: Feature<Geometry>,
  mp: MultiPolygon
): AoiPolygon[] => mp.coordinates.map((coords) => polygonFromFeature(source, {
  type: 'Polygon',
  coordinates: coords
}));

const collectFromGeometry = (
  source: Feature<Geometry>,
  geometry: Geometry | null,
  out: NormalizeResult
): void => {
  if (geometry === null) {
    out.skipped.push('feature with null geometry');
    return;
  }
  if (isPolygon(geometry)) {
    out.polygons.push(polygonFromFeature(source, geometry));
    return;
  }
  if (isMultiPolygon(geometry)) {
    const parts = splitMultiPolygon(source, geometry);
    out.polygons.push(...parts);
    if (parts.length > 1) {
      out.skipped.push(
        `MultiPolygon with ${parts.length} parts split into individual polygons`
      );
    }
    return;
  }
  if (isGeometryCollection(geometry)) {
    geometry.geometries.forEach((inner) => collectFromGeometry(source, inner, out));
    return;
  }
  // Points, LineStrings, MultiPoints, MultiLineStrings — anything that
  // can't become an AOI polygon.
  out.skipped.push(geometry.type);
};

const normalizeFeatureCollection = (
  fc: FeatureCollection<Geometry | null>
): NormalizeResult => {
  const out: NormalizeResult = { polygons: [], skipped: [] };
  fc.features.forEach((feature) => {
    collectFromGeometry(feature as Feature<Geometry>, feature.geometry, out);
  });
  return out;
};

const normalizeAny = (
  input: unknown,
  label: string
): NormalizeResult => {
  if (input === null || input === undefined) {
    return { polygons: [], skipped: [`${label}: empty result`] };
  }

  // Array of FeatureCollections (shpjs returns this when a zip contains
  // multiple shapefiles). Flatten into one aggregated result.
  if (Array.isArray(input)) {
    const merged: NormalizeResult = { polygons: [], skipped: [] };
    input.forEach((item) => {
      const partial = normalizeAny(item, label);
      merged.polygons.push(...partial.polygons);
      merged.skipped.push(...partial.skipped);
    });
    return merged;
  }

  const obj = input as { type?: string };
  if (obj.type === 'FeatureCollection') {
    return normalizeFeatureCollection(input as FeatureCollection<Geometry | null>);
  }
  if (obj.type === 'Feature') {
    const feature = input as Feature<Geometry | null>;
    const out: NormalizeResult = { polygons: [], skipped: [] };
    collectFromGeometry(feature as Feature<Geometry>, feature.geometry, out);
    return out;
  }
  if (
    obj.type === 'Polygon'
    || obj.type === 'MultiPolygon'
    || obj.type === 'GeometryCollection'
  ) {
    const wrapped = wrapGeometryAsFeature(input as Geometry);
    const out: NormalizeResult = { polygons: [], skipped: [] };
    collectFromGeometry(wrapped, input as Geometry, out);
    return out;
  }

  return { polygons: [], skipped: [`${label}: unrecognized GeoJSON shape`] };
};

/**
 * Parse a raw XML string (from a .kml file or a KML extracted from a
 * KMZ archive) into a FeatureCollection via togeojson. togeojson handles
 * KML 2.0 / 2.1 / 2.2 namespaces and Google Earth `gx:*` extensions
 * internally, so this wrapper only needs to feed it a DOM document.
 *
 * Throws a descriptive Error if the XML can't be parsed — DOMParser
 * doesn't throw on malformed input, instead returning a document whose
 * root is a `<parsererror>` element, so we detect that and re-throw.
 */
const parseKmlString = (xmlText: string): FeatureCollection<Geometry | null> => {
  // Strip any leading UTF-8 BOM — DOMParser is usually tolerant, but
  // XMLDocument.documentElement ends up offset by a text node on some
  // runtimes, so normalize defensively.
  const cleaned = xmlText.replace(UTF8_BOM_STRIP, '');
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'application/xml');
  const parserError = doc.getElementsByTagName('parsererror')[0];
  if (parserError) {
    const msg = parserError.textContent?.trim() ?? 'Unknown XML parse error';
    throw new Error(`KML XML parse error: ${msg.split('\n')[0]}`);
  }
  return kml(doc as unknown as Document);
};

/**
 * Read the first .kml entry out of a KMZ archive (zipped KML).
 * Google Earth conventionally names this `doc.kml` but we match any
 * .kml entry case-insensitively so third-party exporters work too.
 */
const extractKmlFromKmz = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  assertZipArchiveSafe(zip);
  const kmlEntry = Object.values(zip.files).find(
    (entry) => !entry.dir && entry.name.toLowerCase().endsWith('.kml')
  );
  if (!kmlEntry) {
    throw new Error('KMZ archive contained no .kml file');
  }
  return kmlEntry.async('string');
};

/**
 * Parse an ESRI shapefile. shpjs can consume either a zipped collection
 * (with sidecar .shp/.shx/.dbf files) via `parseZip` or a single .shp
 * buffer via the default export. Both return a FeatureCollection or an
 * array of them — `normalizeAny` flattens that.
 */
const parseShapefileZip = async (
  file: File
): Promise<ReturnType<typeof shp>> => {
  const buffer = await file.arrayBuffer();
  // Validate archive bounds before handing the buffer to shpjs.
  const zip = await JSZip.loadAsync(buffer);
  assertZipArchiveSafe(zip);
  return parseZip(buffer);
};

const parseShapefileBare = async (
  file: File
): Promise<ReturnType<typeof shp>> => {
  const buffer = await file.arrayBuffer();
  return shp(buffer);
};

/**
 * Top-level import dispatcher. Accepts a `File` from a Carbon FileUploader,
 * infers the format from extension + MIME, routes to the appropriate
 * parser, and returns a normalized `ImportResult`.
 *
 * Design: this function never throws for *valid but empty* imports — it
 * returns an `ImportResult` with an empty `polygons` array and a warning.
 * It DOES throw for truly unparseable input (malformed XML, corrupt zip,
 * unsupported file format) so the caller can surface an error banner.
 */
export const importShapeFile = async (file: File): Promise<ImportResult> => {
  assertImportFileAllowed(file);

  const kind = detectImportKind(file);
  const warnings: string[] = [];
  let normalized: NormalizeResult;

  switch (kind) {
    case 'kml': {
      const text = await file.text();
      const fc = parseKmlString(text);
      normalized = normalizeFeatureCollection(fc);
      break;
    }
    case 'kmz': {
      const kmlText = await extractKmlFromKmz(file);
      const fc = parseKmlString(kmlText);
      normalized = normalizeFeatureCollection(fc);
      break;
    }
    case 'geojson': {
      const text = await file.text();
      const parsed = JSON.parse(text);
      normalized = normalizeAny(parsed, 'geojson');
      break;
    }
    case 'shp-zip': {
      const parsed = await parseShapefileZip(file);
      normalized = normalizeAny(parsed, 'shapefile');
      break;
    }
    case 'shp': {
      const parsed = await parseShapefileBare(file);
      normalized = normalizeAny(parsed, 'shapefile');
      break;
    }
    case 'unknown':
    default:
      // assertImportFileAllowed already rejects unknown kinds; keep a
      // defensive throw for exhaustiveness.
      throw new Error(
        `Unsupported file type: ${file.name}. `
        + `Accepted: ${ACCEPTED_IMPORT_FILE_EXTENSIONS.join(', ')}`
      );
  }

  // Translate skipped-geometry descriptors into user-facing warnings.
  if (normalized.skipped.length > 0) {
    warnings.push(
      `Skipped or split ${normalized.skipped.length} feature(s): ${normalized.skipped.join(', ')}`
    );
  }
  if (normalized.polygons.length === 0) {
    warnings.push(
      'No polygons found in the imported file. Only polygon geometries can be used as AOIs.'
    );
  }

  return {
    polygons: normalized.polygons,
    warnings
  };
};
