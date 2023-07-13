package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This record represents the OrchardLotTypeDescriptionDto object found in the oracle-api service.
 */
@Schema(description = "Represents an Orchard object received from oracle-api.")
public record OrchardDto(
    @Schema(
            description = """
                A unique identifier of an orchard
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
        String stageCode) {}
