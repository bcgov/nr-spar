package ca.bc.gov.backendstartapi.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response body for {@code POST /api/seedlots/{seedlotNumber}/aoi}.
 *
 * @param seedlotNumber the seedlot number the AOI was saved for
 * @param ok simple acknowledgement flag — {@code true} on success
 * @param savedAt server-side timestamp of the persisted record
 * @param becZones BEC zone codes the saved polygon intersects. Derived client-side via a
 *     direct WFS call to DataBC openmaps (see {@code becZonesApi.ts} on the frontend) and
 *     echoed back here without server-side re-verification, following the silva pattern.
 *     Empty list when the client either omitted the derivation or the openmaps call failed
 *     and the client degraded to fail-open.
 */
public record SaveSeedlotAoiResponseDto(
    String seedlotNumber, boolean ok, LocalDateTime savedAt, List<String> becZones) {}
