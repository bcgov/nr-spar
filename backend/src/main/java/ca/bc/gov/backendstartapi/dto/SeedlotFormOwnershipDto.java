package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SeedlotFormOwnershipDto(
    @Schema(
            description =
                """
                A sequentially assigned number which uniquely identifies a Ministry client (owner).
                """,
            example = "00012797")
        @NotNull
        String ownerClientNumber,
    @Schema(
            description =
                """
                A code to uniquely identify, within each client (owner), the addresses of different
                divisions or locations at which the client operates. The location code is
                sequentially assigned starting with \"00\" for the client's permanent address.
                """,
            example = "02")
        @NotNull
        String ownerLocnCode,
    @Schema(
            description = "The original percentage of seed that was owned by a client.",
            example = "100")
        @NotNull
        BigDecimal originalPctOwned,
    @Schema(
            description =
                """
                The original percentage of seed from an owner's portion of a Seedlot that has been
                declared reserved.
                """,
            example = "100")
        @NotNull
        BigDecimal originalPctRsrvd,
    @Schema(
            description =
                """
                The original percentage of seed from an owner's portion of a Seedlot that has been
                declared surplus.
                """,
            example = "5")
        @NotNull
        BigDecimal originalPctSrpls,
    @Schema(
            description =
                """
                A code which represents the method of payment for services where payment is
                required.
                """,
            example = "BCT")
        @NotNull
        String methodOfPaymentCode,
    @Schema(
            description = "A code which represents the source funds for payment of the request.",
            example = "ITC")
        @NotNull
        String sparFundSrceCode,
    @Schema(
            description = "Defines the usage of the Applicant Agency as Owner Agency",
            example = "true")
        @NotNull
        Boolean useApplicantAgencyAsOwner) {}
