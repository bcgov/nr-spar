package ca.bc.gov.oracleapi.dto;

import ca.bc.gov.oracleapi.entity.TransferLimitEntity;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Seed transfer limit used to derive B-class Area of Use min/max from the collection geography.
 *
 * <p>Limits are offsets from the collection location: latitude north/south, longitude east/west
 * (degrees and minutes) and elevation up/down (metres). Null limits mean "no offset".
 */
@Schema(description = "A seed transfer limit matching the search criteria.")
public record TransferLimitDto(
    @Schema(description = "TRANSFER_LIMIT row identifier.", example = "240")
        Long transferLimitSkey,
    @Schema(description = "Species the limit applies to; null means all species.", example = "FDC")
        String vegetationCode,
    @Schema(description = "Genetic class code.", example = "B") String geneticClassCode,
    @Schema(description = "Superior provenance (B+) row; null for A class.", example = "false")
        Boolean superiorProvenance,
    @Schema(description = "Coast (C) or interior (I).", example = "C") String coastInteriorCode,
    @Schema(description = "Seed plan zone the limit applies to; null means all zones.", example = "M")
        String seedPlanZoneCode,
    @Schema(description = "Lowest collection latitude (degrees) this row covers.", example = "48")
        Integer siteMinLatDeg,
    @Schema(description = "Highest collection latitude (degrees) this row covers.", example = "60")
        Integer siteMaxLatDeg,
    @Schema(description = "Northward latitude limit, degrees.", example = "3")
        Integer limitNorthLatDeg,
    @Schema(description = "Northward latitude limit, minutes.", example = "0")
        Integer limitNorthLatMin,
    @Schema(description = "Southward latitude limit, degrees.", example = "2")
        Integer limitSouthLatDeg,
    @Schema(description = "Southward latitude limit, minutes.", example = "0")
        Integer limitSouthLatMin,
    @Schema(description = "Eastward longitude limit, degrees.", example = "2")
        Integer limitEastLongDeg,
    @Schema(description = "Eastward longitude limit, minutes.", example = "0")
        Integer limitEastLongMin,
    @Schema(description = "Westward longitude limit, degrees.", example = "3")
        Integer limitWestLongDeg,
    @Schema(description = "Westward longitude limit, minutes.", example = "0")
        Integer limitWestLongMin,
    @Schema(description = "Upward elevation limit, metres.", example = "350")
        Integer limitUpElevation,
    @Schema(description = "Downward elevation limit, metres.", example = "350")
        Integer limitDownElevation,
    @Schema(
            description = "Free-text transfer recommendation, if any.",
            example = "IF COLLECTION ELEV >1100 M, TRANSFER LIMIT IS +/- 300 M")
        String transferRecommendation,
    @Schema(description = "Maximum collection elevation range, metres.", example = "350")
        Integer maxCollectionElevationRange) {

  /** Maps a {@link TransferLimitEntity} to its wire representation. */
  public static TransferLimitDto from(TransferLimitEntity entity) {
    return new TransferLimitDto(
        entity.getTransferLimitSkey(),
        entity.getVegetationCode(),
        entity.getGeneticClassCode(),
        entity.getSuperiorProvenance(),
        entity.getCoastInteriorCode(),
        entity.getSeedPlanZoneCode(),
        entity.getSiteMinLatDeg(),
        entity.getSiteMaxLatDeg(),
        entity.getLimitNorthLatDeg(),
        entity.getLimitNorthLatMin(),
        entity.getLimitSouthLatDeg(),
        entity.getLimitSouthLatMin(),
        entity.getLimitEastLongDeg(),
        entity.getLimitEastLongMin(),
        entity.getLimitWestLongDeg(),
        entity.getLimitWestLongMin(),
        entity.getLimitUpElevation(),
        entity.getLimitDownElevation(),
        entity.getTransferRecommendation(),
        entity.getMaxCollectionElevationRange());
  }
}
