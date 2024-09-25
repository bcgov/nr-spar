package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This record represents the seedlot SMP Parents from outside number. */
@Schema(description = "The seedlot SMP Parents from outside number.")
public record SeedlotFormSmpParentOutsideDto(Integer smpParentsOutside) {}
