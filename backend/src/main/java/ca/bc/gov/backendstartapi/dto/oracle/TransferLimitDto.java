package ca.bc.gov.backendstartapi.dto.oracle;

/**
 * A seed transfer limit row from oracle-api's {@code /api/transfer-limits} (Oracle
 * TRANSFER_LIMIT). Limits are offsets from the collection location; null means "no offset".
 */
public record TransferLimitDto(
    Long transferLimitSkey,
    String vegetationCode,
    String geneticClassCode,
    Boolean superiorProvenance,
    String coastInteriorCode,
    String seedPlanZoneCode,
    Integer siteMinLatDeg,
    Integer siteMaxLatDeg,
    Integer limitNorthLatDeg,
    Integer limitNorthLatMin,
    Integer limitSouthLatDeg,
    Integer limitSouthLatMin,
    Integer limitEastLongDeg,
    Integer limitEastLongMin,
    Integer limitWestLongDeg,
    Integer limitWestLongMin,
    Integer limitUpElevation,
    Integer limitDownElevation) {}
