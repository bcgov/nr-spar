package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/** This class represents the JSON that will be returned by the GW calculations. */
@Schema(
    description =
        """
        This class represents the JSON that will be returned when requesting the
        Parent tree values data.
        """)
public record CaculatedParentTreeValsDto(
    @Schema(
            description = "The calculated value for the Effective Population Size.",
            example = "2.97655")
        BigDecimal neValue,
    @Schema(description = "Geospatial data") GeospatialRespondDto geospatialData) {}
