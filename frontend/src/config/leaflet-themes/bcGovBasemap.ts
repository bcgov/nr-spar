import type { SparMapBasemap } from '../../types/SparMapTypes';

/**
 * Default SPAR basemap — BC Gov's public web-mercator cache.
 *
 * Used by every theme profile and by the layer-tree's default-checked
 * base layer. Keep this as the single source of truth so a future
 * `profile.basemap` wiring cannot accidentally re-introduce a third-party
 * tile host (the unused OSM default that used to live in every profile).
 */
export const BC_GOV_BASEMAP: SparMapBasemap = {
  id: 'bcgov',
  label: 'BC Gov Base Map',
  urlTemplate:
    'https://maps.gov.bc.ca/arcserver/rest/services/Province/web_mercator_cache/MapServer/tile/{z}/{y}/{x}',
  attribution: '&copy; <a href="https://www2.gov.bc.ca/">Government of British Columbia</a>',
  maxZoom: 17
};
