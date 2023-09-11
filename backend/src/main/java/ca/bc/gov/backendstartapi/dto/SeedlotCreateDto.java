package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

/** This record represents a request body JSON for registering a new seedlot. */
@Schema(description = "This record represents a request body JSON for registering a new seedlot.")
public record SeedlotCreateDto(
    @Schema(
            description =
                """
                A sequentially assigned number which uniquely identifies a Ministry client"
                (applicant).
                """,
            example = "00012797")
        @NotNull
        String applicantClientNumber,
    @Schema(
            description =
                """
                A code to uniquely identify, within each client (applicant), the addresses of
                different divisions or locations at which the client operates. The location
                code is sequentially assigned starting with `00` for the client´s permanent address.
                """,
            example = "01")
        @NotNull
        String applicantLocationCode,
    @Schema(
            description = "Email address of client applying to register the Seedlot",
            example = "user.lastname@domain.com")
        @NotNull
        @Email
        String applicantEmailAddress,
    @Schema(description = "A code which represents a species of tree or brush.", example = "FDI")
        @NotNull
        String vegetationCode,
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
            description =
            """
            A code which represents the Genetic Quality of material (seed or cuttings). "A" class 
            represents superior Orchard produced seed or cuttings. "B" class represents naturally 
            collected seed or cuttings.
            """, example = "A")
            @NotNull
        Character geneticClassCode) {}
