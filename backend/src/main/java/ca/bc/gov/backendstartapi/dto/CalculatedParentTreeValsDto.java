package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/** This class represents the JSON that will be returned by the GW calculations. */
@Schema(
    description =
        """
        This class represents the JSON that will be returned when requesting the
        Parent tree values data.
        """)
@Getter
@Setter
public class CalculatedParentTreeValsDto {
  private BigDecimal neValue;
  private GeospatialRespondDto geospatialData;
}
