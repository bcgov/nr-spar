import { buildGeomDisplayValues } from '../../views/Seedlot/ContextContainerClassA/utils';
import { MeanGeomDataType } from '../../types/PtCalcTypes';

const fullGeom: MeanGeomDataType = {
  meanLatitudeDegree: 49,
  meanLatitudeMinute: 30,
  meanLatitudeSecond: 0,
  meanLongitudeDegree: 124,
  meanLongitudeMinute: 15,
  meanLongitudeSecond: 0,
  meanLatitude: null,
  meanLongitude: null,
  meanElevation: 800
};

describe('buildGeomDisplayValues', () => {
  it('returns null when geomData is null', () => {
    expect(buildGeomDisplayValues(null)).toBeNull();
  });

  it('formats all display fields correctly when values are fully populated', () => {
    const result = buildGeomDisplayValues(fullGeom);
    expect(result).not.toBeNull();
    expect(result!.latDm).toBe("49° 30'");
    expect(result!.lonDm).toBe("124° 15'");
    expect(result!.elevation).toBe('800 m');
  });

  it('returns empty string for latDm when meanLatitudeMinute is null', () => {
    const geom: MeanGeomDataType = { ...fullGeom, meanLatitudeMinute: null };
    const result = buildGeomDisplayValues(geom);
    expect(result!.latDm).toBe('');
  });

  it('returns empty string for lonDm when meanLongitudeMinute is null', () => {
    const geom: MeanGeomDataType = { ...fullGeom, meanLongitudeMinute: null };
    const result = buildGeomDisplayValues(geom);
    expect(result!.lonDm).toBe('');
  });

  it('returns empty string for elevation when meanElevation is null', () => {
    const geom: MeanGeomDataType = { ...fullGeom, meanElevation: null };
    const result = buildGeomDisplayValues(geom);
    expect(result!.elevation).toBe('');
  });

  it('returns empty strings for all DM/elevation fields when all are null', () => {
    const geom: MeanGeomDataType = {
      ...fullGeom,
      meanLatitudeMinute: null,
      meanLongitudeMinute: null,
      meanElevation: null
    };
    const result = buildGeomDisplayValues(geom);
    expect(result!.latDm).toBe('');
    expect(result!.lonDm).toBe('');
    expect(result!.elevation).toBe('');
  });

  it('includes degree in latDm even when minute is present', () => {
    const geom: MeanGeomDataType = { ...fullGeom, meanLatitudeDegree: 52, meanLatitudeMinute: 0 };
    const result = buildGeomDisplayValues(geom);
    expect(result!.latDm).toBe("52° 0'");
  });
});
