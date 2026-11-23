package ca.bc.gov.backendstartapi.dto.oracle;

/**
 * Coast (C) or interior (I) classification of a seed plan zone, from oracle-api's {@code
 * /api/seed-plan-zones/{code}/coast-interior}.
 */
public record SpzCoastInteriorDto(String seedPlanZoneCode, String coastInteriorCode) {}
