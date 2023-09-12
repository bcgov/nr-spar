package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@Schema(
    description = "Forest Client location information.",
    example = """
        {
          "clientNumber": "00000001",
          "locationCode": "00",
          "locationName": "Office",
          "companyCode": "01382",
          "address1": "2080 Labieux Rd",
          "city": "NANAIMO",
          "province": "BC",
          "postalCode": "V9T6J9",
          "country": "CANADA",
          "homePhone": "8006618773",
          "expired": "N",
          "trusted": "N"
        }"""
)
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ForestClientLocationDto(
    @Schema(description = "An eight-digit number that identifies the client.",
            example = "00000001")
        String clientNumber,
    @Schema(description = "A two-digit number that indexes the location of the client.",
            example = "00")
        String locationCode,
    @Schema(description = "The name that describes the location.",
            example = "Office",
            nullable = true)
        String locationName,
    @Schema(description = "A five-digit code that identifies the company in the location.",
            example = "01382")
        String companyCode,
    @Schema(description = "The current address of the ForestClient.",
            example = "2080 Labieux Rd")
        String address1,
    @Schema(description = "First complementary address information. Optional.",
            example = "Building 2",
            nullable = true)
        String address2,
    @Schema(description = "Second complementary address information. Optional.",
            example = "Room 3-100",
            nullable = true)
        String address3,
    @Schema(description = "The city that the location is.",
            example = "NANAIMO")
        String city,
    @Schema(description = "The province that the location is.",
            example = "BC")
        String province,
    @Schema(description = "The postal code of the location.",
            example = "V9T6J9")
        String postalCode,
    @Schema(description = "The country of the location.",
            example = "CANADA")
        String country,
    @Schema(description = "The business phone of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String businessPhone,
    @Schema(description = "The home phone of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String homePhone,
    @Schema(description = "The cellphone of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String cellPhone,
    @Schema(description = "The fax number of the company/individual in the location. Optional.",
            example = "555 555 5555",
            nullable = true)
        String faxNumber,
    @Schema(description = "The email of the company/individual in the location. Optional.",
            example = "company@email.com",
            nullable = true)
        String email,
    @Schema(description = "Define if this entry is expired or not<br>Y means yes<br>N means no",
            example = "Y")
    ForestClientExpiredEnum expired,
    @Schema(description = "Define if this entry can be trusted or not<br>Y means yes<br>N means no",
            example = "N")
    ForestClientExpiredEnum trusted,
    @Schema(description = "The date when the mail was returned. Optional.",
            example = "2012-05-14",
            nullable = true)
        String returnedMailDate,
    @Schema(description = "An open field containing comments about the location. Optional.",
            example = "It is used just as a mail address, residential address",
            nullable = true)
        String comment
) {}
