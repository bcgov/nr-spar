package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SeedlotFormExtractionDto(
    @Schema(
            description = "Defines the usage of the Tree Seed Center as Extratory Agency",
            example = "true")
        @NotNull
        Boolean extractoryAgencyIsTsc,
    @Schema(
            description =
                """
              A sequentially assigned number which uniquely identifies a Ministry client (extractory).
              """,
            example = "00012797")
        @NotNull
        String extractoryClientNumber,
    @Schema(
            description =
                """
              A code to uniquely identify, within each client (extractory), the addresses of
              different divisions or locations at which the client operates. The location code
              is sequentially assigned starting with \"00\" for the client´s permanent address.
              """,
            example = "01")
        @NotNull
        String extractoryLocnCode,
    @Schema(
            description =
                """
              The actual start date (year, month, and day) when the seed was extracted from the
              cones.
              """,
            example = "2023/11/23",
            nullable = true)
        LocalDate extractionStDate,
    @Schema(
            description =
                """
              The actual end date (year, month, and day) when the seed was extracted from the
              cones.
              """,
            example = "2023/11/23",
            nullable = true)
        LocalDate extractionEndDate,
    @Schema(
            description = "Defines the usage of the Tree Seed Center as Storage Agency",
            example = "true")
        @NotNull
        Boolean storageAgencyIsTsc,
    @Schema(
            description =
                """
              A sequentially assigned number which uniquely identifies a Ministry client (storage).
              """,
            example = "00012797")
        @NotNull
        String storageClientNumber,
    @Schema(
            description =
                """
              A code to uniquely identify, within each client (storage), the addresses of different
              divisions or locations at which the client operates. The location code is
              sequentially assigned starting with \"00\" for the client´s permanent address.
              """,
            example = "01")
        @NotNull
        String storageLocnCode,
    @Schema(
            description = "Commencement date of temporary Seedlot storage.",
            example = "2023/11/23",
            nullable = true)
        LocalDate temporaryStrgStartDate,
    @Schema(
            description = "End date of Seedlot temporary storage.",
            example = "2023/11/23",
            nullable = true)
        LocalDate temporaryStrgEndDate) {}
