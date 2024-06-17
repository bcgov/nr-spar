package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * This general record is used for simple data object with only a code and description to be
 * consumed by endpoints.
 */
@Schema(
    description =
        """
        A DTO for common data record that consists of a code and a description.
        """)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CodeDescriptionDto {
  @Schema(description = "The Code that represent a data object", example = "1")
  private String code;

  @Schema(description = "The description/value of the data object", example = "Squirrel cache")
  private String description;
}
