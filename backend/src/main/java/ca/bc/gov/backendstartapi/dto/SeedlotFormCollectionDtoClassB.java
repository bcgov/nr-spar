package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Collection and area-of-use data for a Class B (natural stand) seedlot registration. */
@Schema(description = "Collection and area-of-use information for a Class B seedlot form step 1.")
public record SeedlotFormCollectionDtoClassB(
    // ─── Shared collection site fields ───────────────────────────────────────
    @Schema(description = "Client number responsible for collection.", example = "00012797")
        String collectionClientNumber,
    @Schema(description = "Location code within the collection client.", example = "02")
        String collectionLocnCode,
    @Schema(description = "Collection start date.", example = "2024-05-01")
        LocalDate collectionStartDate,
    @Schema(description = "Collection end date.", example = "2024-05-15")
        LocalDate collectionEndDate,
    @Schema(description = "Number of containers (sacks) collected.", example = "10")
        BigDecimal noOfContainers,
    @Schema(description = "Volume per container in hectolitres.", example = "2.5")
        BigDecimal volPerContainer,
    @Schema(description = "Total cone volume (noOfContainers × volPerContainer).", example = "25")
        BigDecimal clctnVolume,
    @Schema(
            description = "General comment for the seedlot.",
            example = "Collected from south slope")
        String seedlotComment,
    @Schema(
            description = "Codes representing the cone collection methods used.",
            example = "[1, 2]")
        List<Integer> coneCollectionMethodCodes,
    // ─── B-class specific collection fields ──────────────────────────────────
    @Schema(
            description = "Description of the collection location.",
            example = "South ridge block 12")
        String collectionLocationDesc,
    @Schema(description = "Ministry org unit number.", example = "73")
        Integer orgUnitNo,
    @Schema(description = "Indicates if collection standard was met.", example = "true")
        Boolean collectionStandardMetInd,
    @Schema(description = "Radius (m) of the collection area.", example = "500.0")
        BigDecimal collectionAreaRadius,
    @Schema(description = "Capture method code.", example = "CLIMB")
        String captureMethodCode,
    @Schema(description = "Seed plan zone code.", example = "M")
        String seedPlanZoneCode,
    @Schema(
            description = "Indicates if collection falls within the seed plan zone.",
            example = "true")
        Boolean collectionSeedPlanZoneInd,
    @Schema(description = "Seed coast area code.", example = "001")
        String seedCoastAreaCode,
    @Schema(description = "Indicates BEC zone has been validated.", example = "true")
        Boolean collectionBgcValidatedInd,
    @Schema(description = "BEC override flag.", example = "false")
        Boolean becOverrideInd,
    @Schema(description = "Comment explaining the BEC override.")
        String becOverrideComment,
    @Schema(
            description = "Code representing the number of trees the seedlot was collected from.",
            example = "GT5")
        String numberTreesFromCode,
    @Schema(description = "Lot split indicator.", example = "false")
        Boolean isLotSplitInd,
    @Schema(description = "Superior provenance indicator.", example = "false")
        Boolean superiorProvenanceInd,
    @Schema(description = "Provenance ID.", example = "42")
        Integer provenanceId,
    // ─── Collection coordinates (mean of the polygon) ────────────────────────
    @Schema(description = "Collection latitude degrees.", example = "49")
        Integer collectionLatitudeDeg,
    @Schema(description = "Collection latitude minutes.", example = "30")
        Integer collectionLatitudeMin,
    @Schema(description = "Collection latitude seconds.", example = "0")
        Integer collectionLatitudeSec,
    @Schema(description = "Collection longitude degrees.", example = "123")
        Integer collectionLongitudeDeg,
    @Schema(description = "Collection longitude minutes.", example = "0")
        Integer collectionLongitudeMin,
    @Schema(description = "Collection longitude seconds.", example = "0")
        Integer collectionLongitudeSec,
    @Schema(description = "Collection elevation in metres (mean).", example = "800")
        @NotNull
        Integer collectionElevation,
    @Schema(description = "Minimum collection elevation in metres.", example = "600")
        @NotNull
        Integer collectionElevationMin,
    @Schema(description = "Maximum collection elevation in metres.", example = "1000")
        @NotNull
        Integer collectionElevationMax,
    // ─── Area of Use min/max (user-entered for B-class) ──────────────────────
    @Schema(description = "Minimum elevation for area of use.", example = "600")
        Integer elevationMin,
    @Schema(description = "Maximum elevation for area of use.", example = "1000")
        Integer elevationMax,
    @Schema(description = "Minimum latitude degrees for area of use.", example = "49")
        Integer latitudeDegMin,
    @Schema(description = "Minimum latitude minutes for area of use.", example = "0")
        Integer latitudeMinMin,
    @Schema(description = "Maximum latitude degrees for area of use.", example = "50")
        Integer latitudeDegMax,
    @Schema(description = "Maximum latitude minutes for area of use.", example = "0")
        Integer latitudeMinMax,
    @Schema(description = "Minimum longitude degrees for area of use.", example = "122")
        Integer longitudeDegMin,
    @Schema(description = "Minimum longitude minutes for area of use.", example = "0")
        Integer longitudeMinMin,
    @Schema(description = "Maximum longitude degrees for area of use.", example = "124")
        Integer longitudeDegMax,
    @Schema(description = "Maximum longitude minutes for area of use.", example = "0")
        Integer longitudeMinMax,
    @Schema(description = "Minimum latitude seconds for area of use.", example = "0")
        Integer latitudeSecMin,
    @Schema(description = "Maximum latitude seconds for area of use.", example = "0")
        Integer latitudeSecMax,
    @Schema(description = "Minimum longitude seconds for area of use.", example = "0")
        Integer longitudeSecMin,
    @Schema(description = "Maximum longitude seconds for area of use.", example = "0")
        Integer longitudeSecMax,
    @Schema(description = "Area of use comment.", example = "South-facing slope")
        String areaOfUseComment,
    @Schema(description = "Collection latitude hemisphere (N/S).", example = "N")
        Character collectionLatitudeCode,
    @Schema(description = "Collection longitude hemisphere (E/W).", example = "W")
        Character collectionLongitudeCode,
    // ─── BEC zone (from derive-bec or manual override) ───────────────────────
    @Schema(description = "BEC zone code.", example = "CDF")
        String bgcZoneCode,
    @Schema(description = "BEC zone description.", example = "Coastal Douglas-fir")
        String bgcZoneDescription,
    @Schema(description = "BEC subzone code.", example = "mm")
        String bgcSubzoneCode,
    @Schema(description = "BEC variant.", example = "1")
        Character variant,
    @Schema(description = "BEC version ID.", example = "12")
        Integer becVersionId,
    // ─── Collection polygon (optional, written to seedlot_collection_geometry) ─
    @Schema(
            description =
                "GeoJSON polygon (SRID 3005) representing the collection area; null if no"
                    + " polygon captured.")
        String collectionGeometryGeoJson) {}
