package ca.bc.gov.oracleapi.response;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Standard OpenAPI responses for endpoints secured by authentication and role-based access.
 *
 * <p>Includes:
 * <ul>
 *   <li>401 - Access token is missing or invalid</li>
 *   <li>403 - User does not have required role</li>
 * </ul>
 *
 * <p>This annotation is for OpenAPI documentation only and does not enforce security.
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "400",
        description = "Validation error or request data is invalid.",
        content = @Content(schema = @Schema(hidden = true))
    ),
    @ApiResponse(
        responseCode = "401",
        description = "Access token is missing or invalid",
        content = @Content(schema = @Schema(implementation = Void.class))
    ),
    @ApiResponse(
        responseCode = "403",
        description = "User does not have required role",
        content = @Content(schema = @Schema(implementation = Void.class))
    )
})
public @interface ApiAuthResponse {
}

