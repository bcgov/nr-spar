package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/** This record represents the seedlot SMP Parents from outside number. */
@Schema(description = "The seedlot SMP Parents from outside number.")
public record SeedlotFormSmpParentOutsideDto(@NotNull Integer smpParentsOutside) {}
