package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A DTO containing optimistic-lock data for deleting one germinator tray content item. */
public record GerminatorTrayDeleteContentDto(
    @NotNull
    @Schema(description = "Request item activity key", example = "12345")
    BigDecimal riaSkey,

    @NotNull
    @Schema(description = "Activity update timestamp originally fetched by the user")
    LocalDateTime updateTimestamp
) {
}
