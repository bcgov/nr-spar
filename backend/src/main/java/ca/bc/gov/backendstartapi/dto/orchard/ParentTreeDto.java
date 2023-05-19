package ca.bc.gov.backendstartapi.dto.orchard;

import java.util.List;

public record ParentTreeDto(
    int parentTreeId,
    String parentTreeNumber,
    String parentTreeRegStatusCode,
    String localNumber,
    boolean active,
    boolean tested,
    boolean breedingProgram,
    int femaleParentTreeId,
    int maleParentTreeId,
    List<ParentTreeGeneticQuality> parentTreeGeneticQualities) {}
