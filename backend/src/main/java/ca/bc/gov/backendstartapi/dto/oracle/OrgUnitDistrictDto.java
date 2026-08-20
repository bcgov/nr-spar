package ca.bc.gov.backendstartapi.dto.oracle;

/**
 * District org unit fields used by SPRR001 from oracle-api {@code /api/org-unit-districts}. Not
 * returned by SPAR endpoints.
 */
public record OrgUnitDistrictDto(Integer orgUnitNo, String orgUnitName) {}
