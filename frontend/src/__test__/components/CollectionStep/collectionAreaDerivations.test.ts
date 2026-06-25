import type { Feature, MultiPolygon } from 'geojson';
import {
  meanLatLng, formatLatLng, formatElevationRange
} from '../../../components/SeedlotRegistrationSteps/CollectionStep/collectionAreaDerivations';

const square: Feature<MultiPolygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [[[
      [-123.46, 48.55], [-123.45, 48.55], [-123.45, 48.56], [-123.46, 48.56], [-123.46, 48.55]
    ]]]
  }
};

describe('collectionAreaDerivations', () => {
  it('meanLatLng averages every vertex', () => {
    const m = meanLatLng(square);
    expect(m).not.toBeNull();
    expect(m!.lng).toBeCloseTo(-123.456, 3);
    expect(m!.lat).toBeCloseTo(48.554, 3);
  });

  it('meanLatLng returns null for empty coordinates', () => {
    const empty = { ...square, geometry: { type: 'MultiPolygon', coordinates: [] } } as Feature<MultiPolygon>;
    expect(meanLatLng(empty)).toBeNull();
  });

  it('formatLatLng renders 4-decimal degrees', () => {
    expect(formatLatLng({ lat: 48.554, lng: -123.456 })).toBe('48.5540, -123.4560');
  });

  it('formatElevationRange renders rounded en-dash range', () => {
    expect(formatElevationRange(310.4, 539.8)).toBe('310–540 m');
  });
});
