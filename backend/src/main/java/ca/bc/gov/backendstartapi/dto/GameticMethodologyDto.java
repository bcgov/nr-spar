package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This record defines the data object to be returned from the gametic methodology endpoint. */
@Schema(
    description =
        """
        A list of gametic methodology with helpful boolean indicators. The code field starts with
        a character (M/F) that indicate the sex of the methodology, this is a legacy from the
        oracle database. It is recommeneded to use the isFemaleMethodology flag instead.
        """)
public record GameticMethodologyDto(
    @Schema(description = "The code that represent a methodlogy", example = "F1") String code,
    @Schema(description = "The description of amethodlogy", example = "Visual Estimate")
        String description,
    @Schema(
            description = "The flag that indicates whether the methodology is applicable to female",
            example = "true")
        boolean isFemaleMethodology,
    @Schema(
            description =
                "The flag that indicates whether the methodology is applicable to lodgepole pine",
            example = "false")
        boolean isPliSpecies) {}
