package ca.bc.gov.backendstartapi.dto.orchard;

import java.util.List;

public record OrchardSpuDto(
    String orchardId,
    String vegetationCode,
    int seedPlanningUnitId,
    List<ParentTreeDto> parentTrees) {}
