package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** A record of the method of payment, has one more field than {@link CodeDescriptionDto}. */
@Schema(
    description =
        """
        A record of the method of payment, has one more field than CodeDescriptionDto
        """)
public record MethodOfPaymentDto(
    @Schema(description = "The Code that represent a data object", example = "ITC") String code,
    @Schema(
            description = "The description/value of the data object",
            example = "Invoice to Client Address")
        String description,
    @Schema(
            description = "Determines if the method is default, can be true or null",
            example = "true",
            nullable = true)
        Boolean isDefault) {}
