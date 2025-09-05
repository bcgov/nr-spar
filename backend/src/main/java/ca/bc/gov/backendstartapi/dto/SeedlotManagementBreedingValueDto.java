package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** This class represents a JSON object for SMP breeding values. */
@Getter
@Setter
@Schema(description = "smp breeding values")
public class SeedlotManagementBreedingValueDto {
  @Schema(description = "smp bv of ad", example = "0.3")
  private Double ad;

  @Schema(description = "smp bv of dfs", example = "0.3")
  private Double dfs;

  @Schema(description = "smp bv of dfu", example = "0.3")
  private Double dfu;

  @Schema(description = "smp bv of dfw", example = "0.3")
  private Double dfw;

  @Schema(description = "smp bv of dsb", example = "0.3")
  private Double dsb;

  @Schema(description = "smp bv of dsc", example = "0.3")
  private Double dsc;

  @Schema(description = "smp bv of dsg", example = "0.3")
  private Double dsg;

  @Schema(description = "smp bv of gvo", example = "0.3")
  private Double gvo;

  @Schema(description = "smp bv of iws", example = "0.3")
  private Double iws;

  @Schema(description = "smp bv of wdu", example = "0.3")
  private Double wdu;

  @Schema(description = "smp bv of wve", example = "0.3")
  private Double wve;

  @Schema(description = "smp bv of wwd", example = "0.3")
  private Double wwd;

  /** Default constructor initializing all SMP breeding value fields to 0.0. */
  public SeedlotManagementBreedingValueDto() {
    this.ad = 0.0;
    this.dfs = 0.0;
    this.dfu = 0.0;
    this.dfw = 0.0;
    this.dsb = 0.0;
    this.dsc = 0.0;
    this.dsg = 0.0;
    this.gvo = 0.0;
    this.iws = 0.0;
    this.wdu = 0.0;
    this.wve = 0.0;
    this.wwd = 0.0;
  }

  /**
   * Constructs a new {@code SeedlotManagementBreedingValueDto} with provided SMP breeding values.
   *
   * @param ad SMP BV of ad
   * @param dfs SMP BV of dfs
   * @param dfu SMP BV of dfu
   * @param dfw SMP BV of dfw
   * @param dsb SMP BV of dsb
   * @param dsc SMP BV of dsc
   * @param dsg SMP BV of dsg
   * @param gvo SMP BV of gvo
   * @param iws SMP BV of iws
   * @param wdu SMP BV of wdu
   * @param wve SMP BV of wve
   * @param wwd SMP BV of wwd
   */
  public SeedlotManagementBreedingValueDto(
      Double ad,
      Double dfs,
      Double dfu,
      Double dfw,
      Double dsb,
      Double dsc,
      Double dsg,
      Double gvo,
      Double iws,
      Double wdu,
      Double wve,
      Double wwd) {
    this.ad = ad;
    this.dfs = dfs;
    this.dfu = dfu;
    this.dfw = dfw;
    this.dsb = dsb;
    this.dsc = dsc;
    this.dsg = dsg;
    this.gvo = gvo;
    this.iws = iws;
    this.wdu = wdu;
    this.wve = wve;
    this.wwd = wwd;
  }
}
