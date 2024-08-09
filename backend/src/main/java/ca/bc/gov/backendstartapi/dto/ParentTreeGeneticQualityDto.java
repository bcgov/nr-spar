package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

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
public record ParentTreeGeneticQualityDto(
    @Schema(
            description =
                """
                Describes the comparative measure of genetic value for a specific genetic trait of a
                parent tree. Examples are BV (Breeding Value) and CV (Clonal Value).
                """,
            example = "BV")
        String geneticTypeCode,
    @Schema(description = "A code describing various Genetic Worths.", example = "GVO")
        String geneticWorthCode,
    @Schema(
            description =
                """
                The genetic quality value based on the test assessment for a Parent Tree from a test
                no. and series.
                """,
            example = "18")
        BigDecimal geneticQualityValue,
    @Schema(description = "Whether the parent tree is tested", example = "true") Boolean isTested,
    @Schema(
            description = "Whether the genetic quality value is using default value.",
            example = "false")
        Boolean isEstimated) {}
