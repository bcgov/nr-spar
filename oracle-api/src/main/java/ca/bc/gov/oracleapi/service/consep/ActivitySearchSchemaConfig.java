package ca.bc.gov.oracleapi.service.consep;

import static ca.bc.gov.oracleapi.search.SearchOperator.BETWEEN;
import static ca.bc.gov.oracleapi.search.SearchOperator.CONTAINS;
import static ca.bc.gov.oracleapi.search.SearchOperator.EQ;
import static ca.bc.gov.oracleapi.search.SearchOperator.GTE;
import static ca.bc.gov.oracleapi.search.SearchOperator.IN;
import static ca.bc.gov.oracleapi.search.SearchOperator.IS_NOT_NULL;
import static ca.bc.gov.oracleapi.search.SearchOperator.IS_NULL;
import static ca.bc.gov.oracleapi.search.SearchOperator.LTE;
import static ca.bc.gov.oracleapi.search.SearchOperator.NE;
import static ca.bc.gov.oracleapi.search.SearchOperator.STARTS_WITH;

import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import ca.bc.gov.oracleapi.search.SearchSchema;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;

/** Search surface (field whitelist, sorting, limits) for {@link ActivitySearchService}. */
@Configuration
public class ActivitySearchSchemaConfig {

  private static final Class<LocalDateTime> DATE_TIME = LocalDateTime.class;

  /** Most rows an unpaged (export) request may return. */
  static final int UNPAGED_LIMIT = 10_000;

  /**
   * The complete public search surface for testing activities. API names match the view's
   * attribute names (and the frontend table's column ids), so sorting needs no mapping.
   */
  @Bean
  public SearchSchema<ActivitySearchResultEntity> activitySearchSchema(
      ObjectMapper objectMapper) {
    return SearchSchema.forEntity(ActivitySearchResultEntity.class)
        // Lot / request identity
        .sortableField("seedlotDisplay", "seedlotDisplay", String.class, EQ, IN, STARTS_WITH)
        .sortableField("seedlotSample", "seedlotSample", String.class, EQ, IN)
        .sortableField("requestItem", "requestItem", String.class, EQ, IN)
        .field("requestSkey", "requestSkey", Integer.class, EQ, NE, IN)
        .field("reqId", "reqId", String.class, EQ, IN)
        .field("itemId", "itemId", String.class, EQ, IN)
        .field("requestTypeSt", "requestTypeSt", String.class, EQ, IN)
        .field("requestYr", "requestYr", Integer.class, EQ, IN, GTE, LTE, BETWEEN)
        .sortableField("species", "species", String.class, EQ, IN)
        .sortableField("geneticClassCode", "geneticClassCode", String.class, EQ, IN)
        .field("orchardId", "orchardId", String.class, EQ, IN)
        // Activity / test
        .sortableField("activityTypeCd", "activityTypeCd", String.class, EQ, IN)
        .sortableField("activityId", "activityId", String.class, EQ, IN)
        .sortableField("testCategoryCd", "testCategoryCd", String.class, EQ, IN)
        .sortableField("testRank", "testRank", String.class, EQ, IN)
        .sortableField("germinatorTrayId", "germinatorTrayId", Integer.class, EQ, IN)
        .sortableField("pv", "pv", String.class, EQ)
        .sortableField("riaComment", "riaComment", String.class, CONTAINS, IS_NULL, IS_NOT_NULL)
        // Indicators (-1 = yes, 0 = no)
        .field("germTestInd", "germTestInd", Integer.class, EQ)
        .sortableField("assignedTrayInd", "assignedTrayInd", Integer.class, EQ)
        .sortableField("currentTestInd", "currentTestInd", Integer.class, EQ)
        .sortableField("testCompleteInd", "testCompleteInd", Integer.class, EQ)
        .sortableField("acceptResultInd", "acceptResultInd", Integer.class, EQ)
        .sortableField("significntStsInd", "significntStsInd", Integer.class, EQ)
        // Dates
        .sortableField("seedWithdrawalDate", "seedWithdrawalDate", DATE_TIME, GTE, LTE, BETWEEN)
        .sortableField("actualBeginDtTm", "actualBeginDtTm", DATE_TIME, GTE, LTE, BETWEEN)
        .sortableField("actualEndDtTm", "actualEndDtTm", DATE_TIME, GTE, LTE, BETWEEN)
        .sortableField("revisedStartDt", "revisedStartDt", DATE_TIME, GTE, LTE, BETWEEN)
        .sortableField("revisedEndDt", "revisedEndDt", DATE_TIME, GTE, LTE, BETWEEN)
        // Lot numbers are stored in mixed case; match them the way users type them.
        .ignoreCase("seedlotDisplay")
        .defaultSort(Sort.by("seedlotSample", "actualBeginDtTm"))
        .tiebreaker("riaSkey")
        // CSV export asks for every match in one response.
        .allowUnpaged(UNPAGED_LIMIT)
        .build(objectMapper);
  }
}
