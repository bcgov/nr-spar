import { kml } from '@tmcw/togeojson';
import { DOMParser as XmlDomParser } from '@xmldom/xmldom';
import JSZip from 'jszip';
import { parseZip } from 'shpjs';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  GeometryCollection,
  MultiPolygon,
  Polygon
} from 'geojson';

import type { AoiPolygon } from '../../../../types/SparMapTypes';
import {
  MAX_COLLECTION_RADIUS_KM,
  MAX_COLLECTION_VERTICES
} from '../collectionAreaLimits';
import { collectionRadiusKm } from './aoiValidation';

/**
 * Hard caps for imported shape files. Browser parsing of zip/KML/GeoJSON is
 * synchronous enough that unbounded uploads can freeze the tab (or worse,
 * inflate a zip bomb into memory). Keep these conservative — collection
 * polygons are small.
 */
export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024; // 10 MiB on disk
export const MAX_ZIP_UNCOMPRESSED_BYTES = 40 * 1024 * 1024; // 40 MiB inflated
export const MAX_ZIP_ENTRY_COUNT = 200;
/** Collection areas are a handful of polygons; more than this is a bad file. */
export const MAX_IMPORT_FEATURES = 50;
/** Same complexity bound the drawing tools and the backend enforce. */
export const MAX_IMPORT_VERTICES = MAX_COLLECTION_VERTICES;

/** Extensions the import picker and detector accept. */
export const ACCEPTED_IMPORT_FILE_EXTENSIONS = [
  '.kml',
  '.kmz',
  '.geojson',
  '.json',
  '.zip'
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
export type ImportKind = 'kml' | 'kmz' | 'shp-zip' | 'geojson' | 'unknown';

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

const archiveTooLargeError = (): Error => new Error(
  `Archive expands to more than ${formatBytes(MAX_ZIP_UNCOMPRESSED_BYTES)}. `
  + 'Compress or simplify the shapefile/KMZ and try again.'
);

/**
 * Quick first check against zip bombs: too many entries, or too much inflated
 * size according to the central directory JSZip exposes after `loadAsync`.
 * Those sizes come from the archive itself and a crafted zip can fake them,
 * so the real limit is enforced while inflating (`inflateWithinBudget`).
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
    })._data?.uncompressedSize;
    /* eslint-enable no-underscore-dangle */
    if (typeof size !== 'number' || size < 0) {
      throw new Error(
        'Archive listing is missing file sizes; refusing to unpack. '
        + 'Re-export the shapefile/KMZ and try again.'
      );
    }
    uncompressedTotal += size;
    if (uncompressedTotal > MAX_ZIP_UNCOMPRESSED_BYTES) {
      throw archiveTooLargeError();
    }
  });
};

/**
 * JSZip's streaming reader. It exists at runtime but is missing from the
 * published typings, so it is described here.
 */
type JSZipEntryStream = {
  on(event: 'data', callback: (chunk: Uint8Array) => void): JSZipEntryStream;
  on(event: 'error', callback: (err: Error) => void): JSZipEntryStream;
  on(event: 'end', callback: () => void): JSZipEntryStream;
  pause(): JSZipEntryStream;
  resume(): JSZipEntryStream;
};

type StreamableJSZipObject = JSZip.JSZipObject & {
  internalStream: (type: 'uint8array') => JSZipEntryStream
};

/**
 * Inflate one archive entry, counting the bytes it actually produces instead
 * of trusting the size the archive declares. Stops as soon as the count passes
 * `budget`, so a lying zip bomb only inflates up to the limit. Returns the
 * entry's bytes when `keep` is set.
 */
const inflateWithinBudget = (
  entry: JSZip.JSZipObject,
  budget: number,
  keep: boolean
): Promise<{ size: number, data: Uint8Array | null }> => new Promise((resolve, reject) => {
  const chunks: Uint8Array[] = [];
  let size = 0;
  let settled = false;
  const stream = (entry as StreamableJSZipObject).internalStream('uint8array');
  stream
    .on('data', (chunk: Uint8Array) => {
      if (settled) {
        return;
      }
      size += chunk.length;
      if (size > budget) {
        settled = true;
        stream.pause();
        reject(archiveTooLargeError());
        return;
      }
      if (keep) {
        chunks.push(chunk);
      }
    })
    .on('error', (err: Error) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    })
    .on('end', () => {
      if (settled) {
        return;
      }
      settled = true;
      if (!keep) {
        resolve({ size, data: null });
        return;
      }
      const data = new Uint8Array(size);
      let offset = 0;
      chunks.forEach((chunk) => {
        data.set(chunk, offset);
        offset += chunk.length;
      });
      resolve({ size, data });
    })
    .resume();
});

/**
 * Inflate every entry once, discarding the output, to measure the archive's
 * real size before a parser that offers no limit (shpjs) unpacks it.
 */
const assertZipInflatesWithinLimit = async (zip: JSZip): Promise<void> => {
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  await entries.reduce<Promise<number>>(
    async (remainingPromise, entry) => {
      const remaining = await remainingPromise;
      const { size } = await inflateWithinBudget(entry, remaining, false);
      return remaining - size;
    },
    Promise.resolve(MAX_ZIP_UNCOMPRESSED_BYTES)
  );
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

/** Longest imported feature name we keep; longer names are truncated. */
const MAX_IMPORTED_NAME_LENGTH = 200;

/**
 * Keep only a plain-text `name` from the source feature. Everything else is
 * dropped — notably KML `description`, which routinely carries HTML — so no
 * file-supplied markup is around to reach an HTML sink if a later change
 * surfaces imported metadata in the polygon list or a popup.
 */
const importedProperties = (source: Feature<Geometry>): AoiPolygon['properties'] => {
  const name = source.properties?.name;
  return typeof name === 'string' && name.trim() !== ''
    ? { name: name.trim().slice(0, MAX_IMPORTED_NAME_LENGTH) }
    : {};
};

const polygonFromFeature = (
  source: Feature<Geometry>,
  geometry: Polygon
): AoiPolygon => ({
  type: 'Feature',
  geometry,
  properties: importedProperties(source)
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
 * Parsed with `@xmldom/xmldom` rather than the browser's DOMParser: it builds
 * a plain in-memory XML tree with no HTML handling, so file contents can
 * never be interpreted as markup in the page.
 *
 * Throws a descriptive Error if the XML can't be parsed — any `error` or
 * `fatalError` from the parser stops parsing; warnings are tolerated.
 */
const parseKmlString = (xmlText: string): FeatureCollection<Geometry | null> => {
  // Strip any leading UTF-8 BOM so documentElement isn't offset by a text
  // node; normalize defensively.
  const cleaned = xmlText.replace(UTF8_BOM_STRIP, '');
  const parser = new XmlDomParser({
    onError: (level, msg) => {
      if (level !== 'warning') {
        throw new Error(msg);
      }
    }
  });
  let doc;
  try {
    doc = parser.parseFromString(cleaned, 'application/xml');
  } catch (err) {
    const msg = (err instanceof Error && err.message.trim()) || 'Unknown XML parse error';
    throw new Error(`KML XML parse error: ${msg.split('\n')[0]}`);
  }
  if (!doc.documentElement) {
    throw new Error('KML XML parse error: document has no root element');
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
  const { data } = await inflateWithinBudget(kmlEntry, MAX_ZIP_UNCOMPRESSED_BYTES, true);
  return new TextDecoder('utf-8').decode(data ?? new Uint8Array());
};

/**
 * Parse a zipped ESRI shapefile (sidecar .shp/.shx/.dbf files). shpjs
 * `parseZip` needs the full archive — a bare `.shp` is not accepted
 * because it is useless without the sidecars.
 */
const parseShapefileZip = async (file: File) => {
  const buffer = await file.arrayBuffer();
  // Validate archive bounds before handing the buffer to shpjs.
  const zip = await JSZip.loadAsync(buffer);
  assertZipArchiveSafe(zip);
  await assertZipInflatesWithinLimit(zip);
  return parseZip(buffer);
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
    case 'unknown':
    default:
      // assertImportFileAllowed already rejects unknown kinds; keep a
      // defensive throw for exhaustiveness.
      throw new Error(
        `Unsupported file type: ${file.name}. `
        + `Accepted: ${ACCEPTED_IMPORT_FILE_EXTENSIONS.join(', ')}`
      );
  }

  if (normalized.polygons.length > MAX_IMPORT_FEATURES) {
    throw new Error(
      `File has too many polygons (${normalized.polygons.length}). `
      + `Maximum is ${MAX_IMPORT_FEATURES}.`
    );
  }
  const vertexCount = normalized.polygons.reduce(
    (sum, poly) => sum + poly.geometry.coordinates.reduce(
      (ringSum, ring) => ringSum + ring.length,
      0
    ),
    0
  );
  if (vertexCount > MAX_IMPORT_VERTICES) {
    throw new Error(
      `Polygons have too many vertices (${vertexCount}). `
      + `Maximum is ${MAX_IMPORT_VERTICES}. Simplify the file and try again.`
    );
  }
  const radiusKm = collectionRadiusKm(normalized.polygons);
  if (radiusKm > MAX_COLLECTION_RADIUS_KM) {
    throw new Error(
      `Collection area cannot span more than ${MAX_COLLECTION_RADIUS_KM} km radius `
      + `(this one is ${radiusKm.toFixed(1)} km). Shrink the polygon and try again.`
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
