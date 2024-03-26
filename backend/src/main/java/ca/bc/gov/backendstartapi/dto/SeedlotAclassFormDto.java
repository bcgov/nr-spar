package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * This record represents a dto with all data related to an a-class seedlot,
 * including parent trees and calculations results.
 *
 * @param seedlotData all form seedlot related data
 * @param parentTrees a list with all parent trees related to the orchard
 * @param calculatedValues the results of all calculation made on the backend related
 *                         to the seedlot
 */
@Schema(description = "An object with seedlot related data, for a-class seedlots")
public record SeedlotAclassFormDto(
    SeedlotFormSubmissionDto seedlotData,
    List<GeneticWorthTraitsDto> calculatedValues
) {}
