package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This class represents an {@link ca.bc.gov.backendstartapi.entity.Orchard} object including a
 * {@link ca.bc.gov.backendstartapi.entity.OrchardLotTypeCode}.
 */
@Schema(description = "Represents an Orchard object with an Orchard Lot Type.")
public record OrchardDto(
    @Schema(
            description =
                """
                A unique identifier which is assigned to a location where cuttings or
                A class seed is produced.
                """,
            example = "339")
        String id,
    @Schema(
            description = "The name of a location where cuttings or A class seed is produced.",
            example = "EAGLEROCK")
        String name,
    @Schema(description = "A code which represents a species of tree or brush.", example = "PLI")
        String vegetationCode,
    @Schema(
            description =
                """
                A code representing a type of orchard. The two values will be 'S' (Seed Lot) or
                'C' (Cutting Lot).
                """,
            example = "S")
        Character lotTypeCode,
    @Schema(
            description =
                """
                A description of the Orchard Lot Type code. The two values will be 'Seed Lot'
                or 'Cutting Lot'.
                """,
            example = "Seed Lot")
        String lotTypeDescription,
    @Schema(
            description = "A code which represents the current stage or status of an orchard.",
            example = "PRD")
        String stageCode,
    @Schema(description = "The bgc zone code", example = "SBS") String becZoneCode,
    @Schema(description = "The description of a bgc zone code", example = "Sub-Boreal Spruce")
        String becZoneDescription,
    @Schema(description = "The bgc sub-zone code", example = "wk") String becSubzoneCode,
    @Schema(description = "The variant.", example = "1") String variant,
    @Schema(description = "The bec version id.", example = "5") Integer becVersionId) {}
