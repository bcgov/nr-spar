package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This class represents a json object for smp breeding values
 */
@Schema(
    description = "smp breeding values")
public record SMPBreedingValueDto(
    @Schema(description = "smp bv of ad", example = "0.3") Double ad,
    @Schema(description = "smp bv of dfs", example = "0.3") Double dfs,
    @Schema(description = "smp bv of dfu", example = "0.3") Double dfu,
    @Schema(description = "smp bv of dfw", example = "0.3") Double dfw,
    @Schema(description = "smp bv of dsb", example = "0.3") Double dsb,
    @Schema(description = "smp bv of dsc", example = "0.3") Double dsc,
    @Schema(description = "smp bv of dsg", example = "0.3") Double dsg,
    @Schema(description = "smp bv of gvo", example = "0.3") Double gvo,
    @Schema(description = "smp bv of iws", example = "0.3") Double iws,
    @Schema(description = "smp bv of wdu", example = "0.3") Double wdu,
    @Schema(description = "smp bv of wve", example = "0.3") Double wve,
    @Schema(description = "smp bv of wwd", example = "0.3") Double wwd
) {}



