package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotSearchResultDto;
import ca.bc.gov.backendstartapi.mapper.SeedlotSearchMapperImpl;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.search.Criterion;
import ca.bc.gov.backendstartapi.search.FilterGroup;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.search.FilterGroup.Logic;
import ca.bc.gov.backendstartapi.search.InvalidSearchException;
import ca.bc.gov.backendstartapi.search.SearchSchema;
import ca.bc.gov.backendstartapi.search.PageResponse;
import ca.bc.gov.backendstartapi.search.SearchOperator;
import ca.bc.gov.backendstartapi.search.SearchRequest;
import ca.bc.gov.backendstartapi.search.SortOrder;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.TestUserInfos;
import ca.bc.gov.backendstartapi.security.UserInfo;
import com.fasterxml.jackson.databind.json.JsonMapper;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.jdbc.Sql;

/** Runs real queries against H2 to prove the generated SQL filters, sorts and scopes correctly. */
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Sql(scripts = {"classpath:sql_scripts/SeedlotSearchServiceTest.sql"})
class SeedlotSearchServiceTest {

  @Autowired private SeedlotRepository seedlotRepository;

  private LoggedUserService loggedUserService;
  private SeedlotSearchService service;

  @BeforeEach
  void setUp() {
    loggedUserService = mock(LoggedUserService.class);
    service =
        new SeedlotSearchService(
            seedlotRepository,
            loggedUserService,
            new SeedlotSearchMapperImpl(),
            new SeedlotSearchSchemaConfig()
                .seedlotSearchSchema(JsonMapper.builder().findAndAddModules().build()));
  }

  private void loginAsTscAdmin() {
    when(loggedUserService.isTscAdminLogged()).thenReturn(true);
  }

  private void loginWithClients(List<String> clientIds) {
    UserInfo user = TestUserInfos.idirUser(Set.of("SPAR_MINISTRY_ORCHARD"), clientIds);
    when(loggedUserService.isTscAdminLogged()).thenReturn(false);
    when(loggedUserService.getLoggedUserInfo()).thenReturn(Optional.of(user));
  }

  private static Criterion criterion(String field, SearchOperator op, Object... values) {
    return new Criterion(field, op, List.of(values));
  }

  private static FilterGroup and(Criterion... criteria) {
    return new FilterGroup(Logic.AND, List.of(criteria), null);
  }

  private static List<String> numbers(PageResponse<SeedlotSearchResultDto> response) {
    return response.content().stream().map(SeedlotSearchResultDto::seedlotNumber).toList();
  }

  @Test
  @DisplayName("TSC admin with no filter sees everything, newest update first")
  void adminNoFilter() {
    loginAsTscAdmin();
    var response = service.search(new SearchRequest(null, null, null, null));

    assertEquals(List.of("63005", "63004", "63003", "63002", "63001"), numbers(response));
    assertEquals(5, response.page().totalElements());
    assertEquals(20, response.page().size());
  }

  @Test
  @DisplayName("Non-admin only sees seedlots for their own client numbers")
  void nonAdminScoped() {
    loginWithClients(List.of("00012797"));
    var response = service.search(new SearchRequest(null, null, null, null));

    assertEquals(List.of("63003", "63002", "63001"), numbers(response));
  }

  @Test
  @DisplayName("A client filter cannot widen the access scope")
  void filterCannotEscapeScope() {
    loginWithClients(List.of("00012797"));
    var filter = and(criterion("applicantClientNumber", SearchOperator.EQ, "00099999"));
    var response = service.search(new SearchRequest(filter, null, null, null));

    assertEquals(0, response.page().totalElements());
  }

  @Test
  @DisplayName("Non-admin with no client numbers sees nothing")
  void nonAdminNoClients() {
    loginWithClients(List.of());
    var response = service.search(new SearchRequest(null, null, null, null));

    assertEquals(0, response.page().totalElements());
  }

  @Test
  @DisplayName("Nested filter: status = PND AND (species = SX OR species = PLI)")
  void nestedGroups() {
    loginAsTscAdmin();
    var speciesOr =
        new FilterGroup(
            Logic.OR,
            List.of(
                criterion("species", SearchOperator.EQ, "SX"),
                criterion("species", SearchOperator.EQ, "PLI")),
            null);
    var filter =
        new FilterGroup(
            Logic.AND,
            List.of(criterion("status", SearchOperator.IN, "PND")),
            List.of(speciesOr));

    var response = service.search(new SearchRequest(filter, null, null, null));

    assertEquals(List.of("63003"), numbers(response));
  }

  @Test
  @DisplayName("Date range filter converts ISO strings to LocalDate")
  void dateBetween() {
    loginAsTscAdmin();
    var filter =
        and(criterion("collectionStartDate", SearchOperator.BETWEEN, "2026-01-01", "2026-12-31"));
    var sort = List.of(new SortOrder("seedlotNumber", Direction.ASC));

    var response = service.search(new SearchRequest(filter, sort, null, null));

    assertEquals(List.of("63001", "63002"), numbers(response));
  }

  @Test
  @DisplayName("Timestamp filter on an embedded audit field")
  void timestampGte() {
    loginAsTscAdmin();
    var filter = and(criterion("updatedAt", SearchOperator.GTE, "2026-05-04T00:00:00"));

    var response = service.search(new SearchRequest(filter, null, null, null));

    assertEquals(List.of("63005", "63004"), numbers(response));
  }

  @Test
  @DisplayName("Paging returns correct slice and metadata")
  void paging() {
    loginAsTscAdmin();
    var filter = and(criterion("seedlotNumber", SearchOperator.STARTS_WITH, "6300"));
    var sort = List.of(new SortOrder("seedlotNumber", Direction.ASC));

    var page0 = service.search(new SearchRequest(filter, sort, 0, 2));
    var page2 = service.search(new SearchRequest(filter, sort, 2, 2));

    assertEquals(List.of("63001", "63002"), numbers(page0));
    assertEquals(List.of("63005"), numbers(page2));
    assertEquals(5, page0.page().totalElements());
    assertEquals(3, page0.page().totalPages());
  }

  @Test
  @DisplayName("Sorting on a joined lookup code uses the id as tiebreaker")
  void sortByJoinedFieldWithTiebreaker() {
    loginAsTscAdmin();
    var sort = List.of(new SortOrder("status", Direction.DESC));

    var response = service.search(new SearchRequest(null, sort, null, null));

    assertEquals(List.of("63002", "63004", "63001", "63003", "63005"), numbers(response));
  }

  private static Criterion exists(String child, SearchOperator op, Criterion... where) {
    FilterGroup group = where.length == 0 ? null : new FilterGroup(Logic.AND, List.of(where), null);
    return new Criterion(child, op, null, group);
  }

  @Test
  @DisplayName("EXISTS on a child table: seedlots containing orchard 405")
  void childExists() {
    loginAsTscAdmin();
    var filter =
        and(exists("orchards", SearchOperator.EXISTS, criterion("orchardId", SearchOperator.EQ, "405")));
    var sort = List.of(new SortOrder("seedlotNumber", Direction.ASC));

    var response = service.search(new SearchRequest(filter, sort, null, null));

    assertEquals(List.of("63001", "63004"), numbers(response));
  }

  @Test
  @DisplayName("Child conditions must match the same child row")
  void childConditionsSameRow() {
    loginAsTscAdmin();
    // 63001 has orchard 210, but 210 is not its primary orchard; only 63002 has 210 as primary.
    var filter =
        and(
            exists(
                "orchards",
                SearchOperator.EXISTS,
                criterion("orchardId", SearchOperator.EQ, "210"),
                criterion("isPrimary", SearchOperator.EQ, true)));

    var response = service.search(new SearchRequest(filter, null, null, null));

    assertEquals(List.of("63002"), numbers(response));
  }

  @Test
  @DisplayName("A seedlot with several matching child rows appears once and counts once")
  void childNoDuplicates() {
    loginAsTscAdmin();
    var filter =
        and(
            exists(
                "orchards",
                SearchOperator.EXISTS,
                criterion("orchardId", SearchOperator.IN, "405", "210")));

    var response = service.search(new SearchRequest(filter, null, null, null));

    assertEquals(List.of("63004", "63002", "63001"), numbers(response));
    assertEquals(3, response.page().totalElements());
  }

  @Test
  @DisplayName("EXISTS without where: seedlots that have any orchard")
  void childAnyRow() {
    loginAsTscAdmin();
    var response =
        service.search(
            new SearchRequest(and(exists("orchards", SearchOperator.EXISTS)), null, null, null));

    assertEquals(3, response.page().totalElements());
  }

  @Test
  @DisplayName("NOT_EXISTS: seedlots not owned by client 00055555")
  void childNotExists() {
    loginAsTscAdmin();
    var filter =
        and(
            exists(
                "owners",
                SearchOperator.NOT_EXISTS,
                criterion("clientNumber", SearchOperator.EQ, "00055555")));
    var sort = List.of(new SortOrder("seedlotNumber", Direction.ASC));

    var response = service.search(new SearchRequest(filter, sort, null, null));

    assertEquals(List.of("63002", "63003", "63004", "63005"), numbers(response));
  }

  @Test
  @DisplayName("Child filters combine with field filters and the access scope")
  void childWithScope() {
    loginWithClients(List.of("00012797"));
    var filter =
        and(
            criterion("status", SearchOperator.EQ, "PND"),
            exists("orchards", SearchOperator.EXISTS, criterion("orchardId", SearchOperator.EQ, "405")));

    var response = service.search(new SearchRequest(filter, null, null, null));

    // 63004 also has orchard 405 but belongs to another client.
    assertEquals(List.of("63001"), numbers(response));
  }

  @Test
  @DisplayName("Seedlot search does not allow unpaged requests")
  void unpagedNotAllowed() {
    loginAsTscAdmin();
    var request = new SearchRequest(null, null, null, null, true);
    assertThrows(InvalidSearchException.class, () -> service.search(request));
  }

  /** A schema that allows unpaged requests up to {@code limit} rows, for engine tests. */
  private SearchSchema<Seedlot> unpagedSchema(int limit) {
    return SearchSchema.forEntity(Seedlot.class)
        .sortableField("seedlotNumber", "id", String.class, SearchOperator.EQ, SearchOperator.IN)
        .field("species", "vegetationCode", String.class, SearchOperator.EQ, SearchOperator.IN)
        .tiebreaker("id")
        .allowUnpaged(limit)
        .build(JsonMapper.builder().findAndAddModules().build());
  }

  @Test
  @DisplayName("Unpaged returns every match in one page, sorted, ignoring page and size")
  void unpagedReturnsAll() {
    var sort = List.of(new SortOrder("seedlotNumber", Direction.DESC));
    var page = unpagedSchema(5).find(seedlotRepository, new SearchRequest(null, sort, 3, 1, true));

    assertEquals(
        List.of("63005", "63004", "63003", "63002", "63001"),
        page.getContent().stream().map(Seedlot::getId).toList());
    assertEquals(5, page.getTotalElements());
    assertEquals(1, page.getTotalPages());
  }

  @Test
  @DisplayName("Unpaged over the row limit is rejected, not truncated")
  void unpagedOverLimit() {
    var schema = unpagedSchema(4);
    var request = new SearchRequest(null, null, null, null, true);
    var ex =
        assertThrows(InvalidSearchException.class, () -> schema.find(seedlotRepository, request));
    assertTrue(ex.getMessage().contains("5 results match, more than the 4 allowed"));
  }

  @Test
  @DisplayName("Unpaged still applies the filter and the server-side scope")
  void unpagedWithFilterAndScope() {
    var filter = and(criterion("species", SearchOperator.IN, "FDI", "SX"));
    Specification<Seedlot> scope =
        (root, query, cb) -> root.get("applicantClientNumber").in(List.of("00012797"));

    var page =
        unpagedSchema(2)
            .find(seedlotRepository, new SearchRequest(filter, null, null, null, true), scope);

    // 5 seedlots exist, but only 63001 (FDI) and 63003 (SX) match and are in scope, so a limit
    // of 2 is enough: the limit is checked after filtering.
    assertEquals(2, page.getTotalElements());
  }

  @Test
  @DisplayName("Result rows map own fields, lookups and audit timestamps")
  void mapsLookups() {
    loginAsTscAdmin();
    var filter = and(criterion("seedlotNumber", SearchOperator.EQ, "63002"));

    var row = service.search(new SearchRequest(filter, null, null, null)).content().get(0);

    assertEquals("63002", row.seedlotNumber());
    assertEquals("00012797", row.applicantClientNumber());
    assertEquals("01", row.applicantLocationCode());
    assertNotNull(row.createdAt());
    assertNotNull(row.updatedAt());
    assertEquals("SUB", row.statusCode());
    assertEquals("Submitted", row.statusDescription());
    assertEquals("A", row.geneticClassCode());
    assertEquals("PLI", row.species());
  }
}
