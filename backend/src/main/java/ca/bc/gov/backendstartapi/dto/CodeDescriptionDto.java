package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This class holds the fields that will be returned from a ParentTreeGeneticQuality of a
 * ParentTree.
 */
@Schema(
    description =
        """
        The calculated genetic quality for Parent Trees by assessment age, assessment year and
        seed planning unit.
        """)
public record CodeDescriptionDto(
    @Schema(description = "The Code that represent a data object", example = "1") String code,
    @Schema(description = "The description/value of the data object", example = "Squirrel cache")
        String description) {}
