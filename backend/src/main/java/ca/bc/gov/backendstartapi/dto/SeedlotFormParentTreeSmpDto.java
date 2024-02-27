package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import java.util.List;

/** This record represents the JSON body to be sent when saving the seedlot form. */
public record SeedlotFormParentTreeSmpDto(
    String seedlotNumber,
    Integer parentTreeId,
    String parentTreeNumber,
    BigDecimal coneCount,
    BigDecimal pollenCount,
    Integer smpSuccessPct,
    Integer nonOrchardPollenContamPct,
    Integer amountOfMaterial,
    BigDecimal proportion,
    List<ParentTreeGeneticQualityDto> parentTreeGeneticQualities) {}
