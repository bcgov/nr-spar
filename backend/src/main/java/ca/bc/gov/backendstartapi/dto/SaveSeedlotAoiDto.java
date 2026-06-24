package ca.bc.gov.backendstartapi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

/**
 * Request body for {@code POST /api/seedlots/{seedlotNumber}/aoi}.
 *
 * @param polygon the GeoJSON Feature (Polygon or MultiPolygon) to persist
 * @param becZones BEC zone codes the polygon intersects, derived client-side via a direct
 *     WFS call to DataBC openmaps before this request fires — see {@code becZonesApi.ts} on
 *     the frontend. Nullable: a missing or empty list is treated as "no derivation performed"
 *     and simply echoed back in the response DTO. The backend intentionally does not
 *     re-verify, matching the silva architectural pattern (client does geospatial work,
 *     backend stays geospatial-dumb).
 */
public record SaveSeedlotAoiDto(
    @JsonProperty("polygon") GeoJsonFeature polygon,
    @JsonProperty("becZones") List<String> becZones) {

  /**
   * Minimal GeoJSON Feature shape. The {@code geometry} is accepted as a raw Jackson
   * {@link JsonNode} so any GeoJSON geometry type ({@code Polygon}, {@code MultiPolygon},
   * {@code Feature}, {@code FeatureCollection}) can flow through and be validated server-side
   * before conversion to JTS.
   */
  public record GeoJsonFeature(String type, JsonNode geometry, JsonNode properties) {}
}
