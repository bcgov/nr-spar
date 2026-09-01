import {
  assertImportFileAllowed,
  detectImportKind,
  importShapeFile,
  MAX_IMPORT_FILE_BYTES
} from '../../views/Seedlot/SeedlotMap/AoiToolbar/importShape';

const makeFile = (
  name: string,
  contents: string,
  type = ''
): File => {
  const file = new File([contents], name, { type });
  // jsdom's File may omit Blob.text(); polyfill for importShapeFile.
  if (typeof file.text !== 'function') {
    Object.defineProperty(file, 'text', {
      configurable: true,
      value: async () => contents
    });
  }
  return file;
};

describe('importShape', () => {
  describe('detectImportKind', () => {
    it.each([
      ['aoi.kml', 'application/vnd.google-earth.kml+xml', 'kml'],
      ['aoi.kmz', '', 'kmz'],
      ['aoi.geojson', 'application/geo+json', 'geojson'],
      ['aoi.json', 'application/json', 'geojson'],
      ['shapes.zip', 'application/zip', 'shp-zip'],
      ['parcel.shp', '', 'shp'],
      ['notes.txt', 'text/plain', 'unknown']
    ] as const)('detects %s as %s', (name, mime, kind) => {
      expect(detectImportKind(makeFile(name, '{}', mime))).toBe(kind);
    });
  });

  describe('assertImportFileAllowed', () => {
    it('rejects unsupported extensions', () => {
      expect(() => assertImportFileAllowed(makeFile('notes.txt', 'hello')))
        .toThrow(/Unsupported file type/i);
    });

    it('rejects files over the size cap', () => {
      const big = new File([new Uint8Array(MAX_IMPORT_FILE_BYTES + 1)], 'huge.geojson', {
        type: 'application/geo+json'
      });
      expect(() => assertImportFileAllowed(big)).toThrow(/too large/i);
    });

    it('allows a small geojson', () => {
      expect(() => assertImportFileAllowed(
        makeFile('ok.geojson', '{}', 'application/geo+json')
      )).not.toThrow();
    });
  });

  describe('importShapeFile', () => {
    it('imports a GeoJSON polygon Feature', async () => {
      const geojson = JSON.stringify({
        type: 'Feature',
        properties: { name: 'test' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-123, 48],
            [-122, 48],
            [-122, 49],
            [-123, 49],
            [-123, 48]
          ]]
        }
      });
      const result = await importShapeFile(
        makeFile('poly.geojson', geojson, 'application/geo+json')
      );
      expect(result.polygons).toHaveLength(1);
      expect(result.polygons[0].geometry.type).toBe('Polygon');
      expect(result.warnings).toEqual([]);
    });

    it('splits a MultiPolygon and warns', async () => {
      const geojson = JSON.stringify({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [[[-123, 48], [-122, 48], [-122, 49], [-123, 49], [-123, 48]]],
            [[[-121, 48], [-120, 48], [-120, 49], [-121, 49], [-121, 48]]]
          ]
        }
      });
      const result = await importShapeFile(
        makeFile('multi.geojson', geojson, 'application/geo+json')
      );
      expect(result.polygons).toHaveLength(2);
      expect(result.warnings[0]).toMatch(/Skipped or split/i);
    });

    it('throws for unsupported types before parsing', async () => {
      await expect(importShapeFile(makeFile('x.csv', 'a,b')))
        .rejects.toThrow(/Unsupported file type/i);
    });
  });
});
