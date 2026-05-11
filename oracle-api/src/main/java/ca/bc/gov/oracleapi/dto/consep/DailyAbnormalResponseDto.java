package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Daily abnormal response")
public class DailyAbnormalResponseDto {
  @NotNull
  @Schema(description = "A surrogate access key for DAILY_GERM table.", example = "12345")
  Long dailyGermSkey;

  ReplicateAbnormalDto rep1;

  ReplicateAbnormalDto rep2;

  ReplicateAbnormalDto rep3;

  ReplicateAbnormalDto rep4;
}
