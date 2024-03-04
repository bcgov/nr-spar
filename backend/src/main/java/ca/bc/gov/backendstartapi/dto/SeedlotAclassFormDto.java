package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * This record represents a dto with all data related to an a-class seedlot,
 * including parent trees and calculations results.
 *
 * @param seedlotData all seedlot related data
 * @param parentTrees a list with all parent trees related to the orchard
 * @param calculatedValues the results of all calculation made on the backend related
 *                         to the seedlot
 */
@Schema(description = "An object with seedlot related data, for a-class seedlots")
public record SeedlotAclassFormDto(
    Seedlot seedlotData,
    List<SeedlotFormParentTreeSmpDto> parentTrees,
    List<GeneticWorthTraitsDto> calculatedValues
) {}
