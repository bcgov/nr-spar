import { useMutation } from '@tanstack/react-query';
import type { Feature, MultiPolygon } from 'geojson';

import { saveAoi } from '../../../../api-service/sparMapApi';
import type { SaveAoiResponse } from '../../../../api-service/sparMapApi';
import { assertSingleBecZone } from './aoiValidation';

/**
 * react-query mutation for saving the current in-progress AOI to the FDS
 * backend. The hook is parameterised by seedlot number so the toolbar
 * can pass it once and call `mutate(multiPolygonFeature)` without
 * repeating the identifier.
 *
 * Accepts a GeoJSON `Feature<MultiPolygon>` to cover the legacy
 * multi-polygon flow — the single-polygon case is encoded as a
 * MultiPolygon with a single ring by `buildMultiPolygonFeature`.
 *
 * Before posting, the mutation derives intersecting BEC zones via a
 * client-side WFS call to DataBC's openmaps. The legacy Struts action
 * rejected AOIs crossing more than one BEC zone; this mutation keeps
 * that rule at the final save boundary too, so callers cannot bypass
 * the Validate button and persist invalid geometry.
 *
 * Scoped to the AoiToolbar component (not shared), so it lives here
 * rather than under `src/hooks`.
 */
export const useAoiSave = (seedlotNumber: string) => useMutation<
  SaveAoiResponse,
  Error,
  Feature<MultiPolygon>
>({
  mutationFn: async (polygon: Feature<MultiPolygon>) => {
    const becZones = await assertSingleBecZone(polygon);
    return saveAoi({ seedlotNumber, polygon, becZones });
  }
});
