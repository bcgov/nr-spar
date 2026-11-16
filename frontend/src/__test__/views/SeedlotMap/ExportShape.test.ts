import { describe, it, expect } from 'vitest';

import { exportAois } from '../../../views/Seedlot/SeedlotMap/AoiToolbar/exportShape';
import type { AoiPolygon } from '../../../types/SparMapTypes';

const square = {
  type: 'Feature',
  properties: { source: 'drawn' },
  geometry: {
    type: 'Polygon',
    coordinates: [[[-123, 49], [-122, 49], [-122, 50], [-123, 50], [-123, 49]]]
  }
} as AoiPolygon;

const FILENAME = /^spar-aoi-60001-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z\./;

describe('exportAois', () => {
  it('refuses to export nothing', async () => {
    await expect(exportAois([], '60001', 'geojson')).rejects.toThrow('No polygons to export');
  });

  it('writes a GeoJSON collection with a name and index per polygon', async () => {
    const result = await exportAois([square, square], '60001', 'geojson');
    expect(result.filename).toMatch(FILENAME);
    expect(result.filename.endsWith('.geojson')).toBe(true);
    expect(result.mimeType).toBe('application/geo+json');
    const parsed = JSON.parse(await result.blob.text());
    expect(parsed.features).toHaveLength(2);
    expect(parsed.features[1].properties).toEqual({
      source: 'drawn', polygonIndex: 2, name: 'SPAR AOI 60001 - polygon 2', seedlotNumber: '60001'
    });
  });

  it('writes KML for Google Earth', async () => {
    const result = await exportAois([square], '60001', 'kml');
    expect(result.filename.endsWith('.kml')).toBe(true);
    const kml = await result.blob.text();
    expect(kml).toContain('<name>SPAR AOI 60001</name>');
    expect(kml).toContain('SPAR AOI 60001 - polygon 1');
    expect(kml).toContain('-123,49');
  });

  it('zips a shapefile', async () => {
    const result = await exportAois([square], '60001', 'shapefile');
    expect(result.filename.endsWith('.zip')).toBe(true);
    expect(result.mimeType).toBe('application/zip');
    const bytes = new Uint8Array(await result.blob.arrayBuffer());
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('PK');
  });

  it('names the file "unknown" without a seedlot number', async () => {
    const result = await exportAois([square], '  ', 'geojson');
    expect(result.filename).toMatch(/^spar-aoi-unknown-/);
  });
});
