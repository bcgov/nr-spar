package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SeedlotFormInterimDto(
    @Schema(
            description =
                """
              A sequentially assigned number which uniquely identifies a Ministry client (interm
              storage).
              """,
            example = "00012797")
        @NotNull
        String intermStrgClientNumber,
    @Schema(
            description =
                """
              A code to uniquely identify, within each client (interm storage), the addresses of
              different divisions or locations at which the client operates. The location code is
              sequentially assigned starting with \"00\" for the client's permanent address.
              """,
            example = "01")
        @NotNull
        String intermStrgLocnCode,
    @Schema(
            description =
                """
              The actual start date (year, month, and day) when the cone was stored during interim
              storage.
              """,
            example = "2023/12/20")
        @NotNull
        LocalDateTime intermStrgStDate,
    @Schema(
            description =
                """
              The actual end date (year, month, and day) when the cone was stored during interim
              storage.
              """,
            example = "2023/12/21")
        @NotNull
        LocalDateTime intermStrgEndDate,
    @Schema(
            description =
                """
              The location where the tree seed was stored during interim storage. Can be used if
              users did not enter a registered client data. Optional field
              """,
            example = "Some location",
            nullable = true)
        String intermStrgLocn,
    @Schema(
            description =
                """
              A code which represents the type of facility where the seed was stored during interim storage.
              """,
            example = "OCV")
        @NotNull
        String intermFacilityCode) {}
