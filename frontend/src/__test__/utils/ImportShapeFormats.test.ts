import JSZip from 'jszip';
import { parseZip } from 'shpjs';

import { importShapeFile, MAX_ZIP_ENTRY_COUNT } from '../../views/Seedlot/SeedlotMap/AoiToolbar/importShape';

vi.mock('shpjs', () => ({ parseZip: vi.fn() }));

const RING = [
  [-123.02, 49.00],
  [-123.00, 49.00],
  [-123.00, 49.01],
  [-123.02, 49.01],
  [-123.02, 49.00]
];

const POLYGON = { type: 'Polygon', coordinates: [RING] };

const KML = `\uFEFF<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Block A</name>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>
        ${RING.map(([lng, lat]) => `${lng},${lat}`).join(' ')}
      </coordinates></LinearRing></outerBoundaryIs></Polygon>
    </Placemark>
    <Placemark>
      <name>Landing</name>
      <Point><coordinates>-123.01,49.005</coordinates></Point>
    </Placemark>
  </Document>
</kml>`;

const withReaders = (file: File, bytes: Uint8Array | string): File => {
  const buffer = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes;
  Object.defineProperty(file, 'text', {
    configurable: true,
    value: async () => (typeof bytes === 'string' ? bytes : new TextDecoder().decode(bytes))
  });
  Object.defineProperty(file, 'arrayBuffer', {
    configurable: true,
    value: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  });
  return file;
};

const textFile = (name: string, contents: string) => withReaders(new File([contents], name), contents);

const zipFile = async (name: string, entries: Record<string, string>) => {
  const zip = new JSZip();
  Object.entries(entries).forEach(([entryName, contents]) => zip.file(entryName, contents));
  const bytes = await zip.generateAsync({ type: 'uint8array' });
  return withReaders(new File([bytes], name), bytes);
};

const geojsonFile = (value: unknown) => textFile('shape.geojson', JSON.stringify(value));

describe('importShapeFile formats', () => {
  beforeEach(() => {
    vi.mocked(parseZip).mockReset();
  });

  describe('KML', () => {
    it('imports polygons and warns about skipped points', async () => {
      const result = await importShapeFile(textFile('block.kml', KML));

      expect(result.polygons).toHaveLength(1);
      expect(result.polygons[0].properties).toMatchObject({ name: 'Block A' });
      expect(result.warnings).toEqual(['Skipped or split 1 feature(s): Point']);
    });

    it('reports malformed XML', async () => {
      await expect(importShapeFile(textFile('broken.kml', '<kml><Document>')))
        .rejects.toThrow(/KML XML parse error/);
    });
  });

  describe('KMZ', () => {
    it('reads the KML inside the archive', async () => {
      const result = await importShapeFile(await zipFile('block.kmz', { 'files/DOC.KML': KML }));
      expect(result.polygons).toHaveLength(1);
    });

    it('rejects an archive without a KML file', async () => {
      await expect(importShapeFile(await zipFile('empty.kmz', { 'readme.txt': 'hi' })))
        .rejects.toThrow(/no \.kml file/);
    });

    it('rejects archives with too many files', async () => {
      const entries = Object.fromEntries(
        Array.from({ length: MAX_ZIP_ENTRY_COUNT + 1 }, (_, i) => [`f${i}.txt`, 'x'])
      );
      await expect(importShapeFile(await zipFile('many.kmz', entries)))
        .rejects.toThrow(/too many files/);
    });
  });

  describe('zipped shapefile', () => {
    it('merges every shapefile layer in the archive', async () => {
      vi.mocked(parseZip).mockResolvedValue([
        { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: POLYGON }] },
        {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[-123, 49], [-123.01, 49]] } }]
        }
      ] as never);

      const result = await importShapeFile(await zipFile('blocks.zip', { 'blocks.shp': 'stub' }));

      expect(parseZip).toHaveBeenCalledTimes(1);
      expect(result.polygons).toHaveLength(1);
      expect(result.warnings).toEqual(['Skipped or split 1 feature(s): LineString']);
    });

    it('warns when the archive has no polygons', async () => {
      vi.mocked(parseZip).mockResolvedValue(null as never);

      const result = await importShapeFile(await zipFile('empty.zip', { 'empty.shp': 'stub' }));

      expect(result.polygons).toEqual([]);
      expect(result.warnings).toEqual([
        'Skipped or split 1 feature(s): shapefile: empty result',
        'No polygons found in the imported file. Only polygon geometries can be used as AOIs.'
      ]);
    });
  });

  describe('GeoJSON shapes', () => {
    it('accepts a bare polygon geometry', async () => {
      const result = await importShapeFile(geojsonFile(POLYGON));
      expect(result.polygons).toHaveLength(1);
      expect(result.warnings).toEqual([]);
    });

    it('unpacks a geometry collection', async () => {
      const result = await importShapeFile(geojsonFile({
        type: 'GeometryCollection',
        geometries: [POLYGON, { type: 'Point', coordinates: [-123, 49] }]
      }));
      expect(result.polygons).toHaveLength(1);
      expect(result.warnings[0]).toContain('Point');
    });

    it('skips features without geometry', async () => {
      const result = await importShapeFile(geojsonFile({
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: {}, geometry: POLYGON },
          { type: 'Feature', properties: {}, geometry: null }
        ]
      }));
      expect(result.polygons).toHaveLength(1);
      expect(result.warnings[0]).toContain('feature with null geometry');
    });

    it('warns about unrecognised GeoJSON', async () => {
      const result = await importShapeFile(geojsonFile({ type: 'Topology' }));
      expect(result.polygons).toEqual([]);
      expect(result.warnings[0]).toContain('geojson: unrecognized GeoJSON shape');
    });

    it('rejects a collection area wider than the radius limit', async () => {
      await expect(importShapeFile(geojsonFile({
        type: 'Polygon',
        coordinates: [[[-124, 49], [-123, 49], [-123, 50], [-124, 50], [-124, 49]]]
      }))).rejects.toThrow(/cannot span more than/);
    });
  });
});
