package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * The location information of Forest Clients.
 *
 * @param clientNumber the number that identifies this client
 * @param locationCode the location's index
 * @param locationName the location's name
 * @param companyCode the code of the company that is in the location
 * @param address1 the address information
 * @param address2 complementary address information; optional
 * @param address3 complementary address information; optional
 * @param city the name of the city where the location is
 * @param province the code of the province/territory where the location is
 * @param postalCode the postal code of the location
 * @param country the country code of the location
 * @param businessPhone the business phone number; optional
 * @param homePhone the home/personal phone number; optional
 * @param cellPhone the cellphone number; optional
 * @param faxNumber the fax number; optional
 * @param email the email address; optional
 * @param expired define if the location is expired; possible values: Y or N
 * @param trusted define if the location is trusted; possible values: Y or N
 * @param returnedMailDate the date when the mail was returned; optional
 * @param comment an open field containing comments about the address
 *
 */
@Schema(description = "Forest Client location information.")
public record ForestClientLocationDto(
    @Schema(description = "An eight-digit number that identifies the client.")
        String clientNumber,
    @Schema(description = "A two-digit number that indexes the location of the client.")
        String locationCode,
    @Schema(description = "The name that describes the location.")
        String locationName,
    @Schema(description = "A five-digit code that identifies the company in the location.")
        String companyCode,
    @Schema(description = "The current address of the forest client.")
        String address1,
    @Schema(description = "First complementary address information. Optional.")
        String address2,
    @Schema(description = "Second complementary address information. Optional.")
        String address3,
    @Schema(description = "The city that the location is.")
        String city,
    @Schema(description = "The province that the location is.")
        String province,
    @Schema(description = "The postal code of the location.")
        String postalCode,
    @Schema(description = "The country of the location.")
        String country,
    @Schema(description = "The business phone of the company/individual in the location. Optional.")
        String businessPhone,
    @Schema(description = "The home phone of the company/individual in the location. Optional.")
        String homePhone,
    @Schema(description = "The cellphone of the company/individual in the location. Optional.")
        String cellPhone,
    @Schema(description = "The fax number of the company/individual in the location. Optional.")
        String faxNumber,
    @Schema(description = "The email of the company/individual in the location. Optional.")
        String email,
    ForestClientExpiredEnum expired,
    ForestClientExpiredEnum trusted,
    @Schema(description = "The date when the mail was returned. Optional")
        String returnedMailDate,
    @Schema(description = "An open field containing comments about the location. Optional.")
        String comment
) {}
