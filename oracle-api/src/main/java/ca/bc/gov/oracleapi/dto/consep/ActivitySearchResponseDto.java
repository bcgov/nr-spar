package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * This class represents a
 * {@link ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity} object.
 */
@Schema(description = "Search response for testing activity search API")
public record ActivitySearchResponseDto(
    String seedlotDisplay,
    String requestItem,
    String species,
    String activityId,
    String testRank,
    Integer currentTestInd,
    String testCategoryCd,
    Integer germinationPct,
    String pv,
    Integer moisturePct,
    Integer purityPct,
    Integer seedsPerGram,
    Integer otherTestResult,
    Integer testCompleteInd,
    Integer acceptResultInd,
    Integer significntStsInd,
    LocalDateTime seedWithdrawalDate,
    LocalDateTime revisedEndDt,
    LocalDateTime actualBeginDtTm,
    LocalDateTime actualEndDtTm,
    String riaComment,
    Integer requestSkey,
    String reqId,
    String itemId,
    String seedlotSample,
    Integer riaSkey,
    String activityTypeCd,
    String geneticClassCode
) {
}


