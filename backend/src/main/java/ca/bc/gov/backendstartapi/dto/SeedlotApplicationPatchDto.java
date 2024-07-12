package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

/** This record represents a request body JSON for registering a new seedlot. */
@Schema(
    description =
        "This record represents a request body JSON for patching a seedlot's application info.")
public record SeedlotApplicationPatchDto(
    @Schema(
            description = "Email address of client applying to register the Seedlot",
            example = "user.lastname@domain.com")
        @NotNull
        @Email
        String applicantEmailAddress,
    @Schema(
            description =
                """
                A code to indicate if an orchard seedlot is from tested parent trees, untested or"
                custom. One of `TPT`, `UPT` or `CUS`
                """,
            example = "TPT")
        @NotNull
        String seedlotSourceCode,
    @Schema(
            description =
                """
            An indicator which represents whether a Seedlot is intended to be registered for
            crown land reforestation use (`true` yes) or not (`false` no).
            """,
            example = "true")
        @NotNull
        Boolean toBeRegistrdInd,
    @Schema(
            description = "Indicates whether the source of the Seedlot is within British Columbia",
            example = "true")
        @NotNull
        Boolean bcSourceInd,
    @Schema(
            description = "Number representing the revision version of the seedlot record",
            example = "42")
        @NotNull
        Integer revisionCount) {}
