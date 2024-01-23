package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * A record that contains the basic client information and the information for each location code.
 */
@Schema(description = "One of the many agencies that work with the ministry.")
public record ForestClientSearchDto(
    @Schema(description = "An eight-digit number that identifies the client.") String clientNumber,
    @Schema(
            description =
                "The client last name if it's an individual or the company name if it's a company.")
        String clientName,
    @Schema(description = "The first name of the individual, or null if it's a company.")
        String legalFirstName,
    @Schema(description = "The middle name of the individual, or null if it's a company")
        String legalMiddleName,
    ForestClientStatusEnum clientStatusCode,
    ForestClientTypeEnum clientTypeCode,
    @Schema(description = "An acronym for this client; works as an alternative identifier.")
        String acronym,
    @Schema(
            description = "A two-digit number that indexes the location of the client.",
            example = "00")
        String locationCode,
    @Schema(
            description = "The name that describes the location.",
            example = "Office",
            nullable = true)
        String locationName,
    @Schema(
            description = "A five-digit code that identifies the company in the location.",
            example = "01382")
        String companyCode,
    @Schema(description = "The current address of the ForestClient.", example = "2080 Labieux Rd")
        String address1,
    @Schema(
            description = "First complementary address information. Optional.",
            example = "Building 2",
            nullable = true)
        String address2,
    @Schema(
            description = "Second complementary address information. Optional.",
            example = "Room 3-100",
            nullable = true)
        String address3,
    @Schema(description = "The city that the location is.", example = "NANAIMO") String city,
    @Schema(description = "The province that the location is.", example = "BC") String province,
    @Schema(description = "The postal code of the location.", example = "V9T6J9") String postalCode,
    @Schema(description = "The country of the location.", example = "CANADA") String country,
    @Schema(
            description = "The business phone of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String businessPhone,
    @Schema(
            description = "The home phone of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String homePhone,
    @Schema(
            description = "The cellphone of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String cellPhone,
    @Schema(
            description = "The fax number of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String faxNumber,
    @Schema(
            description = "The email of the company/individual in the location. Optional.",
            example = "company@email.com",
            nullable = true)
        String email,
    @Schema(
            description = "Define if this entry is expired or not<br>Y means yes<br>N means no",
            example = "Y")
        ForestClientExpiredEnum expired,
    @Schema(
            description = "Define if this entry can be trusted or not<br>Y means yes<br>N means no",
            example = "N")
        ForestClientExpiredEnum trusted,
    @Schema(
            description = "The date when the mail was returned. Optional.",
            example = "2012-05-14",
            nullable = true)
        String returnedMailDate,
    @Schema(
            description = "An open field containing comments about the location. Optional.",
            example = "It is used just as a mail address, residential address",
            nullable = true)
        String comment) {}
