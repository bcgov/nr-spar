package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/** This record represents the seedlot form step 4. */
@Schema(description = "Seedlot orchard information. Form step 4")
public record SeedlotFormOrchardDto(
    @Schema(
            description =
                """
              The primary Orchard ID selected by user.
              """,
            example = "125")
        @NotNull
        String primaryOrchardId,
    @Schema(
            description =
                """
              The secondary Orchard ID selected by user.
              """,
            example = "129",
            nullable = true)
        String secondaryOrchardId,
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
