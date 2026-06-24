import { describe, it, expect } from 'vitest';

import { importShapeFile } from '../../../views/Seedlot/SeedlotMap/AoiToolbar/importShape';

/**
 * Unit tests for the shape-file import dispatcher. We lean on inline KML
 * strings (easy to author inside a test file) rather than binary KMZ or
 * Shapefile fixtures — those will be exercised via manual upload in the
 * Phase 3 demo and can be promoted to fixture-backed tests in a future
 * phase if needed.
 *
 * Vitest runs under jsdom, which provides the `DOMParser` and `File`
 * constructors used by `importShapeFile`.
 */

const makeKmlFile = (xml: string, name = 'sample.kml'): File =>
  new File([xml], name, { type: 'application/vnd.google-earth.kml+xml' });

describe('importShapeFile', () => {
  it('parses a two-placemark KML 2.2 document into two polygons', async () => {
    const sampleKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Polygon A</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -123.5,48.5,0 -123.4,48.5,0 -123.4,48.6,0 -123.5,48.6,0 -123.5,48.5,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    <Placemark>
      <name>Polygon B</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -123.7,48.7,0 -123.6,48.7,0 -123.6,48.8,0 -123.7,48.8,0 -123.7,48.7,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;

    const result = await importShapeFile(makeKmlFile(sampleKml));
    expect(result.polygons).toHaveLength(2);
    expect(result.warnings).toHaveLength(0);
    expect(result.polygons[0].geometry.type).toBe('Polygon');
    expect(result.polygons[0].geometry.coordinates[0]).toHaveLength(5);
  });

  it('skips non-polygon features (Point placemark) and emits a warning', async () => {
    const pointKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Single point</name>
      <Point>
        <coordinates>-123.5,48.5,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

    const result = await importShapeFile(makeKmlFile(pointKml));
    expect(result.polygons).toHaveLength(0);
    // Expect a warning that mentions the skipped Point geometry AND the
    // "no polygons found" follow-up message.
    expect(result.warnings.length).toBeGreaterThan(0);
    const joined = result.warnings.join(' | ');
    expect(joined).toMatch(/Point/);
    expect(joined).toMatch(/No polygons found/);
  });

  it('flattens a MultiGeometry placemark into individual polygon features', async () => {
    // KML's polygon-equivalent MultiPolygon is represented as a
    // MultiGeometry element containing multiple <Polygon> children.
    // togeojson emits this as a GeoJSON GeometryCollection containing
    // three inner Polygons — our dispatcher recurses through the
    // collection and returns three independent Polygon features.
    const multiKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Multi</name>
      <MultiGeometry>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
                -123.5,48.5,0 -123.4,48.5,0 -123.4,48.6,0 -123.5,48.6,0 -123.5,48.5,0
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
                -123.7,48.7,0 -123.6,48.7,0 -123.6,48.8,0 -123.7,48.8,0 -123.7,48.7,0
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
                -124.0,49.0,0 -123.9,49.0,0 -123.9,49.1,0 -124.0,49.1,0 -124.0,49.0,0
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </MultiGeometry>
    </Placemark>
  </Document>
</kml>`;

    const result = await importShapeFile(makeKmlFile(multiKml));
    expect(result.polygons).toHaveLength(3);
    result.polygons.forEach((poly) => {
      expect(poly.geometry.type).toBe('Polygon');
    });
    // Each polygon in the collection maps 1:1 to an AOI, so no warnings
    // should be emitted for this input.
    expect(result.warnings).toHaveLength(0);
  });

  it('handles KML 2.1 namespace (older Google Earth exports)', async () => {
    // togeojson should handle all three major KML namespace variants
    // (2.0 earth.google.com, 2.1 earth.google.com, 2.2 opengis.net)
    // identically. Phase 3 spec calls this out as a primary user-pain
    // point so we spot-check with a 2.1-namespaced document.
    const kml21 = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://earth.google.com/kml/2.1">
  <Document>
    <Placemark>
      <name>Old Earth Polygon</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -123.5,48.5,0 -123.4,48.5,0 -123.4,48.6,0 -123.5,48.6,0 -123.5,48.5,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
    const result = await importShapeFile(makeKmlFile(kml21));
    expect(result.polygons).toHaveLength(1);
  });

  it('throws a clear error for malformed XML', async () => {
    // `<<<` is unambiguously invalid XML — DOMParser will emit a
    // parsererror node that our dispatcher detects and re-throws.
    const brokenXml = '<<<not really xml at all>>>';
    await expect(importShapeFile(makeKmlFile(brokenXml, 'broken.kml'))).rejects.toThrow(
      /KML XML parse error/
    );
  });

  it('parses a GeoJSON FeatureCollection with mixed geometries', async () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-123.5, 48.5], [-123.4, 48.5], [-123.4, 48.6], [-123.5, 48.6], [-123.5, 48.5]]]
          },
          properties: { name: 'AOI A' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-123.45, 48.55] },
          properties: { name: 'Some point' }
        }
      ]
    });
    const file = new File([geojson], 'aoi.geojson', { type: 'application/geo+json' });
    const result = await importShapeFile(file);
    expect(result.polygons).toHaveLength(1);
    expect(result.polygons[0].properties).toEqual({ name: 'AOI A' });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Point');
  });

  it('parses a bare GeoJSON Polygon (no FeatureCollection wrapper)', async () => {
    const geojson = JSON.stringify({
      type: 'Polygon',
      coordinates: [[[-123.5, 48.5], [-123.4, 48.5], [-123.4, 48.6], [-123.5, 48.6], [-123.5, 48.5]]]
    });
    const file = new File([geojson], 'bare.json', { type: 'application/json' });
    const result = await importShapeFile(file);
    expect(result.polygons).toHaveLength(1);
    expect(result.warnings).toHaveLength(0);
  });

  it('throws on invalid JSON in a .geojson file', async () => {
    const file = new File(['{ not valid json !!!'], 'bad.geojson', { type: 'application/geo+json' });
    await expect(importShapeFile(file)).rejects.toThrow();
  });

  it('rejects unsupported file extensions with a descriptive error', async () => {
    const bogus = new File(['not a shape'], 'notes.txt', { type: 'text/plain' });
    await expect(importShapeFile(bogus)).rejects.toThrow(/Unsupported file type/);
  });
});
