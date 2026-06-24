import tokml from '@maphubs/tokml';
import * as shpwrite from '@mapbox/shp-write';
import type { Feature, FeatureCollection } from 'geojson';
import type { AoiPolygon } from '../../../../types/SparMapTypes';

/**
 * Output formats supported by `exportAois`. Mirrors the SPAR feature
 * parity matrix EXPORT column — the legacy JSP viewer only shipped KML
 * and Shapefile, but the BC Gov reference map viewers all offer GeoJSON
 * as the modern default so we expose it alongside the legacy formats.
 */
export type ExportFormat = 'geojson' | 'kml' | 'shapefile';

/**
 * Return value from `exportAois`. Wraps a ready-to-download Blob, its
 * MIME type, and a traceable filename containing the seedlot number +
 * timestamp. The caller is responsible for triggering the browser
 * download itself (e.g. via an `<a href="blob:...">` click).
 */
export interface ExportResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

/**
 * MIME types for each supported export format. `geojson` uses the RFC
 * 7946 media type, `kml` uses the Google-registered KML media type, and
 * `shapefile` returns a plain `application/zip` because a Shapefile is
 * actually a bundle of four sibling files (.shp/.shx/.dbf/.prj).
 */
const MIME_TYPES: Record<ExportFormat, string> = {
  geojson: 'application/geo+json',
  kml: 'application/vnd.google-earth.kml+xml',
  shapefile: 'application/zip'
};

/**
 * File extensions for each supported export format.
 */
const EXTENSIONS: Record<ExportFormat, string> = {
  geojson: 'geojson',
  kml: 'kml',
  shapefile: 'zip'
};

/**
 * Produce a filesystem-safe ISO-like timestamp suitable for embedding
 * in a download filename — colons and dots are stripped so the result
 * parses cleanly as a single token on Windows, macOS, and Linux.
 */
const buildTimestamp = (): string => {
  const now = new Date();
  return now
    .toISOString()
    .replace(/:/g, '-')
    .replace(/\..+$/, 'Z');
};

/**
 * Wrap the user's drawn AOI polygons in a GeoJSON FeatureCollection.
 * Each polygon is tagged with a 1-based `polygonIndex` and a label so
 * the KML/Shapefile serializers emit a human-readable placemark/record
 * name for each output feature.
 */
const buildFeatureCollection = (
  aois: AoiPolygon[],
  seedlotNumber: string
): FeatureCollection => {
  const features: Feature[] = aois.map((aoi, idx) => ({
    type: 'Feature',
    properties: {
      ...(aoi.properties ?? {}),
      polygonIndex: idx + 1,
      name: `SPAR AOI ${seedlotNumber} - polygon ${idx + 1}`,
      seedlotNumber
    },
    geometry: aoi.geometry
  }));
  return {
    type: 'FeatureCollection',
    features
  };
};

/**
 * Serialize the user's AOIs to a file of the requested format. Returns
 * a Blob + filename suitable for triggering a browser download.
 *
 * The seedlot number is included in the filename for traceability — the
 * legacy SPAR export flow embedded it directly in the KML `<name>` tag
 * and we preserve that convention here so older processes that grep
 * filenames continue to work.
 *
 * Throws when the AOI list is empty so UI layers can surface a clear
 * error instead of silently handing the user an empty file.
 */
export async function exportAois(
  aois: AoiPolygon[],
  seedlotNumber: string,
  format: ExportFormat
): Promise<ExportResult> {
  if (!aois || aois.length === 0) {
    throw new Error(
      'No polygons to export — draw or import at least one first.'
    );
  }

  const timestamp = buildTimestamp();
  const slug = seedlotNumber && seedlotNumber.trim().length > 0
    ? seedlotNumber.trim()
    : 'unknown';
  const filename = `spar-aoi-${slug}-${timestamp}.${EXTENSIONS[format]}`;
  const mimeType = MIME_TYPES[format];
  const featureCollection = buildFeatureCollection(aois, slug);

  if (format === 'geojson') {
    const json = JSON.stringify(featureCollection, null, 2);
    return {
      blob: new Blob([json], { type: mimeType }),
      filename,
      mimeType
    };
  }

  if (format === 'kml') {
    const kmlString = tokml(featureCollection, {
      name: 'name',
      documentName: `SPAR AOI ${slug}`,
      documentDescription: `SPAR AOI export for seedlot ${slug}`,
      simplestyle: true
    });
    return {
      blob: new Blob([kmlString], { type: mimeType }),
      filename,
      mimeType
    };
  }

  // format === 'shapefile'
  // `shp-write`'s `zip()` returns a Promise resolving to a Blob when the
  // `outputType: 'blob'` option is passed. We widen the typed call so TS
  // lines up with the runtime value.
  const zipped = await shpwrite.zip<'blob'>(featureCollection, {
    outputType: 'blob',
    compression: 'DEFLATE',
    types: {
      polygon: 'spar-aoi',
      multipolygon: 'spar-aoi'
    }
  });
  const blob = zipped instanceof Blob
    ? zipped
    : new Blob([zipped as unknown as ArrayBuffer], { type: mimeType });
  return {
    blob,
    filename,
    mimeType
  };
}
