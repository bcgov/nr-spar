package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/** This record represents the seedlot form step 6. */
@Schema(description = "Seedlot extration and storage information. Form step 6")
public record SeedlotFormExtractionDto(
    @Schema(
            description =
                """
              A sequentially assigned number which uniquely identifies a Ministry client
              (extractory).
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
        LocalDateTime extractionStDate,
    @Schema(
            description =
                """
              The actual end date (year, month, and day) when the seed was extracted from the
              cones.
              """,
            example = "2023/11/23",
            nullable = true)
        LocalDateTime extractionEndDate,
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
        LocalDateTime temporaryStrgStartDate,
    @Schema(
            description = "End date of Seedlot temporary storage.",
            example = "2023/11/23",
            nullable = true)
        LocalDateTime temporaryStrgEndDate) {}
