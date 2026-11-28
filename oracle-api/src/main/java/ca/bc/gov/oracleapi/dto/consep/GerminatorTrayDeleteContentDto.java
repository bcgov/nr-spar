package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A DTO containing optimistic-lock data for deleting one germinator tray content item. */
public record GerminatorTrayDeleteContentDto(
    @NotNull
    @Schema(description = "Request item activity key", example = "12345")
    BigDecimal riaSkey,

    @JsonProperty(value = "updateTimestamp", required = true)
    @Schema(description = "Activity timestamp last read; explicitly null for a legacy null version")
    LocalDateTime updateTimestamp
) {
}
