package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** This record represents the seedlot form step 1. */
@Schema(description = "Seedlot collection information. Form step 1")
public record SeedlotFormCollectionDto(
    @Schema(
            description =
                """
                A sequentially assigned number which uniquely identifies a Ministry client
                (collection).
                """,
            example = "00012797")
        @NotNull
        String collectionClientNumber,
    @Schema(
            description =
                """
                A code to uniquely identify, within each client (collection), the addresses of
                different divisions or locations at which the client operates. The location code is
                sequentially assigned starting with \"00\" for the client's permanent address.
                """,
            example = "02")
        @NotNull
        String collectionLocnCode,
    @Schema(
            description =
                """
                The actual start date (year, month, and day) that the cones (source for seedlots)
                were collected.
                """,
            example = "2023/11/20")
        @NotNull
        LocalDate collectionStartDate,
    @Schema(
            description =
                """
                The actual end date (year, month, and day) that the cones (source for seedlots) were
                collected.
                """,
            example = "2023/11/30")
        @NotNull
        LocalDate collectionEndDate,
    @Schema(
            description = "The number of containers (sacks of cones) that were collected.",
            example = "2")
        @NotNull
        BigDecimal noOfContainers,
    @Schema(
            description =
                """
                The volume of cones, in hectolitres, that were collected per container
                (as reported on the cone collection form).
                """,
            example = "4")
        @NotNull
        BigDecimal volPerContainer,
    @Schema(
            description =
                "A code which represents the number of trees that the Seedlot was collected from.",
            example = "8")
        @NotNull
        BigDecimal clctnVolume,
    @Schema(
            description = "A free format text field used to enter general comments for a Seedlot.",
            example = "Any comment")
        @NotNull
        String seedlotComment,
    @Schema(
            description = "The collection methods in which the cones of a Seedlot were collected.",
            example = "[1, 2]")
        @NotNull
        List<Integer> coneCollectionMethodCodes) {}
