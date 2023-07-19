package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This class represents an {@link ca.bc.gov.backendstartapi.entity.Orchard} object including a
 * {@link ca.bc.gov.backendstartapi.entity.OrchardLotTypeCode}.
 */
@Schema(description = "Represents an Spu object with orchard id.")
public record SeedPlanUnitObjDto(
    String orchardId,
    int seedPlanningUnitId,
    String vegetationCode,
    boolean active,
    boolean retired,
    boolean spuNotAssigned) {}
