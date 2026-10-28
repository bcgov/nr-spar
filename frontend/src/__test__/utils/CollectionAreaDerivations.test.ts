import type { Feature, MultiPolygon } from 'geojson';

import { meanLatLng } from '../../components/SeedlotRegistrationSteps/CollectionStep/collectionAreaDerivations';

const rectangle = (coords: Array<[number, number]>): Feature<MultiPolygon> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [[coords]]
  }
});

describe('meanLatLng', () => {
  it('does not double-count a closed ring vertex', () => {
    const feature = rectangle([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0]
    ]);

    expect(meanLatLng(feature)).toEqual({ lat: 0.5, lng: 0.5 });
  });

  it('returns null for an empty geometry', () => {
    const feature: Feature<MultiPolygon> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates: [] }
    };

    expect(meanLatLng(feature)).toBeNull();
  });
});
