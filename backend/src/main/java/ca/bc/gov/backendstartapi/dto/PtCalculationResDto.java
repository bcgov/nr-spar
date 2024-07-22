package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/** This class represents the JSON that will be returned by the GW calculations. */
@Schema(
    description =
        """
        This class represents the JSON that will be returned when requesting the
        various calculated values for a Class-A seedlot registration form.
        """)
public record PtCalculationResDto(
    @Schema(description = "Contains a list of calculated traits.")
        List<GeneticWorthTraitsDto> geneticTraits,
    @Schema(description = "Various calculated value for the orchard parent trees.")
        CalculatedParentTreeValsDto calculatedPtVals,
    @Schema(description = "The calculated mean geospatial values for SMP mix.")
        GeospatialRespondDto smpMixMeanGeoData) {}
