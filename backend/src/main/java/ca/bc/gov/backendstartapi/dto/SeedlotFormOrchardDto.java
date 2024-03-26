package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/** This record represents the seedlot form step 4. */
@Schema(description = "Seedlot orchard information. Form step 4")
public record SeedlotFormOrchardDto(
    @Schema(
            description =
                """
              The unique number (key) assigned to a quantity of seed of a particular species and
              quality from a given location collected at a given time.
              """,
            example = "[\"125\", \"129\"]")
        @NotNull
        List<String> orchardsId,
    @Schema(
            description =
                """
              Code that describes the female gametic contribution method code for a Seedlot.
              """,
            example = "F3")
        @NotNull
        String femaleGameticMthdCode,
    @Schema(
            description =
                """
              Code that describes the male gametic contribution method code for a Seedlot.
              """,
            example = "M3")
        @NotNull
        String maleGameticMthdCode,
    @Schema(
            description = "Indicates whether the lot was produced through controlled crosses.",
            example = "false")
        @NotNull
        Boolean controlledCrossInd,
    @Schema(
            description = "Indicates if biotechnological processes been used to produce this lot.",
            example = "true")
        @NotNull
        Boolean biotechProcessesInd,
    @Schema(
            description = "Indicates if pollen contamination was present in the seed Orchard",
            example = "false")
        @NotNull
        Boolean pollenContaminationInd,
    @Schema(
            description =
                """
              The proportion of contaminant pollen present in the seed Orchard. (Optional)
              """,
            example = "22",
            nullable = true)
        Integer pollenContaminationPct,
    @Schema(
            description = "The estimated Breeding Value of the contaminant pollen in an Orchard.",
            example = "45.6",
            nullable = true)
        BigDecimal contaminantPollenBv,
    @Schema(
            description = "Code that describes the pollen contamination method.",
            example = "true",
            nullable = true)
        String pollenContaminationMthdCode) {}
