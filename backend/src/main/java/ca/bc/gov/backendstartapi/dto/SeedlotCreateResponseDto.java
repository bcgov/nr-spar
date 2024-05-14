package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This class represents the response body returned when creating a Seedlot. */
@Schema(description = "This class represents the response body returned when creating a Seedlot.")
public record SeedlotCreateResponseDto(
    @Schema(
            description =
                """
                The unique number (key) assigned to a quantity of seed of a particular species and
                quality from a  given location collected at a given time.
                """,
            example = "630001")
        String seedlotNumber,
    @Schema(description = "A code which represents the current status of a lot.", example = "PND")
        String seedlotStatusCode) {}
