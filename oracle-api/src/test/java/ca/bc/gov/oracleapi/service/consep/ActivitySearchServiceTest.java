package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import ca.bc.gov.oracleapi.mapper.ActivitySearchMapperImpl;
import ca.bc.gov.oracleapi.repository.consep.ActivitySearchRepository;
import ca.bc.gov.oracleapi.search.Criterion;
import ca.bc.gov.oracleapi.search.FilterGroup;
import ca.bc.gov.oracleapi.search.FilterGroup.Logic;
import ca.bc.gov.oracleapi.search.InvalidSearchException;
import ca.bc.gov.oracleapi.search.PageResponse;
import ca.bc.gov.oracleapi.search.SearchOperator;
import ca.bc.gov.oracleapi.search.SearchRequest;
import ca.bc.gov.oracleapi.search.SortOrder;
import com.fasterxml.jackson.databind.json.JsonMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.test.context.TestPropertySource;

/** Runs real searches against H2 (Oracle mode) to prove the generated queries are correct. */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:activitysearchservicetestdb;MODE=Oracle;DB_CLOSE_DELAY=-1",
      "spring.jpa.hibernate.ddl-auto=create-drop",
      "spring.sql.init.mode=always",
      "spring.sql.init.schema-locations=classpath:schema-consep-only.sql"
    })
class ActivitySearchServiceTest {

  @Autowired private TestEntityManager em;
  @Autowired private ActivitySearchRepository repository;

  private ActivitySearchService service;

  @BeforeEach
  void setUp() {
    var schema =
        new ActivitySearchSchemaConfig()
            .activitySearchSchema(JsonMapper.builder().findAndAddModules().build());
    service = new ActivitySearchService(repository, new ActivitySearchMapperImpl(), schema);
    //        riaSkey lot       sample   type  skey  germ  begin
    persist(1, "00098", "00098", "GER", 100, -1, LocalDateTime.of(2025, 1, 10, 9, 0));
    persist(2, "00098", "00098", "MC", 100, 0, LocalDateTime.of(2025, 1, 5, 9, 0));
    persist(3, "F20082140146", "F2008214", "GER", 0, -1, LocalDateTime.of(2024, 6, 1, 9, 0));
    persist(4, "63000", "63000", "PUR", 200, 0, LocalDateTime.of(2025, 3, 1, 9, 0));
    em.flush();
  }

  private void persist(
      int riaSkey, String lot, String sample, String type, int requestSkey, int germ,
      LocalDateTime begin) {
    ActivitySearchResultEntity e = new ActivitySearchResultEntity();
    e.setRiaSkey(riaSkey);
    e.setSeedlotDisplay(lot);
    e.setSeedlotSample(sample);
    e.setActivityTypeCd(type);
    e.setRequestSkey(requestSkey);
    e.setGermTestInd(germ);
    e.setActualBeginDtTm(begin);
    e.setReqId("RTS2025" + riaSkey);
    e.setItemId("A");
    em.persist(e);
  }

  private static Criterion criterion(String field, SearchOperator op, Object... values) {
    return new Criterion(field, op, List.of(values));
  }

  private static SearchRequest req(FilterGroup filter, List<SortOrder> sort) {
    return new SearchRequest(filter, sort, null, null);
  }

  private static FilterGroup and(Criterion... criteria) {
    return new FilterGroup(Logic.AND, List.of(criteria), null);
  }

  private static List<Integer> ids(PageResponse<ActivitySearchResponseDto> page) {
    return page.content().stream().map(ActivitySearchResponseDto::riaSkey).toList();
  }

  @Test
  @DisplayName("Default sort is seedlotSample then actualBeginDtTm")
  void defaultSort() {
    assertEquals(List.of(2, 1, 4, 3), ids(service.search(req(null, null))));
  }

  @Test
  @DisplayName("Lot numbers + test types (the main screen's basic search)")
  void lotsAndTypes() {
    var filter =
        and(
            criterion("seedlotDisplay", SearchOperator.IN, "00098", "63000"),
            criterion("activityTypeCd", SearchOperator.IN, "GER", "PUR"));
    assertEquals(List.of(1, 4), ids(service.search(req(filter, null))));
  }

  @Test
  @DisplayName("Lot numbers match regardless of case")
  void lotsIgnoreCase() {
    var exact = and(criterion("seedlotDisplay", SearchOperator.IN, "f20082140146"));
    assertEquals(List.of(3), ids(service.search(req(exact, null))));
    var prefix = and(criterion("seedlotDisplay", SearchOperator.STARTS_WITH, "f"));
    assertEquals(List.of(3), ids(service.search(req(prefix, null))));
  }

  @Test
  @DisplayName("Exclude historical tests: requestSkey != 0")
  void excludeHistorical() {
    var filter = and(criterion("requestSkey", SearchOperator.NE, 0));
    assertEquals(3, service.search(req(filter, null)).page().totalElements());
  }

  @Test
  @DisplayName("Germ tests only + family lots only (case-insensitive starts with F)")
  void germAndFamilyLots() {
    var familyLots =
        new FilterGroup(
            Logic.OR,
            List.of(
                criterion("seedlotDisplay", SearchOperator.STARTS_WITH, "F"),
                criterion("seedlotDisplay", SearchOperator.STARTS_WITH, "f")),
            null);
    var filter =
        new FilterGroup(
            Logic.AND,
            List.of(criterion("germTestInd", SearchOperator.EQ, -1)),
            List.of(familyLots));
    assertEquals(List.of(3), ids(service.search(req(filter, null))));
  }

  @Test
  @DisplayName("Date range with end-of-day upper bound")
  void dateRange() {
    var filter =
        and(
            criterion(
                "actualBeginDtTm",
                SearchOperator.BETWEEN,
                "2025-01-01T00:00:00",
                "2025-01-10T23:59:59.999"));
    assertEquals(List.of(2, 1), ids(service.search(req(filter, null))));
  }

  @Test
  @DisplayName("Client sort with riaSkey tiebreaker")
  void clientSort() {
    var sort = List.of(new SortOrder("activityTypeCd", Direction.ASC));
    assertEquals(List.of(1, 3, 2, 4), ids(service.search(req(null, sort))));
  }

  @Test
  @DisplayName("Paging metadata")
  void paging() {
    var page = service.search(new SearchRequest(null, null, 1, 3));
    assertEquals(List.of(3), ids(page));
    assertEquals(4, page.page().totalElements());
    assertEquals(2, page.page().totalPages());
  }

  @Test
  @DisplayName("Unpaged (export) returns every match in one response, in sort order")
  void unpagedExport() {
    var filter = and(criterion("requestSkey", SearchOperator.NE, 0));
    var page = service.search(new SearchRequest(filter, null, null, null, true));
    assertEquals(List.of(2, 1, 4), ids(page));
    assertEquals(3, page.page().totalElements());
    assertEquals(1, page.page().totalPages());
  }

  @Test
  @DisplayName("Unknown field is rejected")
  void unknownField() {
    var request = req(and(criterion("germinationPct", SearchOperator.EQ, 90)), null);
    assertThrows(InvalidSearchException.class, () -> service.search(request));
  }

  @Test
  @DisplayName("Missing lot numbers are compared case-insensitively and keep request order")
  void missingLots() {
    assertEquals(
        List.of("99999", "F1"),
        service.findMissingLotNumbers(List.of("99999", "00098", "f20082140146", "f1", " ")));
  }
}
