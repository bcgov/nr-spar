package ca.bc.gov.backendstartapi.search;

import static ca.bc.gov.backendstartapi.search.SearchOperator.BETWEEN;
import static ca.bc.gov.backendstartapi.search.SearchOperator.CONTAINS;
import static ca.bc.gov.backendstartapi.search.SearchOperator.EQ;
import static ca.bc.gov.backendstartapi.search.SearchOperator.EXISTS;
import static ca.bc.gov.backendstartapi.search.SearchOperator.IN;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.search.FilterGroup.Logic;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

/** Validation, declaration and paging rules; no database needed. */
class SearchSchemaTest {

  private static final ObjectMapper MAPPER = JsonMapper.builder().findAndAddModules().build();

  private final SearchSchema<Seedlot> schema =
      SearchSchema.forEntity(Seedlot.class)
          .sortableField("seedlotNumber", "id", String.class, EQ, IN)
          .sortableField("status", "seedlotStatus.seedlotStatusCode", String.class, EQ, IN)
          .field("species", "vegetationCode", String.class, EQ, IN)
          .field("intendedForCrownLand", "intendedForCrownLand", Boolean.class, EQ)
          .sortableField("collectionStartDate", "collectionStartDate", LocalDate.class, EQ, BETWEEN)
          .child(
              "orchards",
              SeedlotOrchard.class,
              c -> c.link("id", "seedlot.id").field("orchardId", "orchardId", String.class, EQ))
          .defaultSort(Sort.by(Direction.DESC, "auditInformation.updateTimestamp"))
          .tiebreaker("id")
          .build(MAPPER);

  private static FilterGroup filterOf(Criterion... criteria) {
    return new FilterGroup(Logic.AND, List.of(criteria), null);
  }

  private String errorFor(FilterGroup filter) {
    return assertThrows(InvalidSearchException.class, () -> schema.toSpecification(filter))
        .getMessage();
  }

  // ------------------------------------------------------------------ field validation

  @Test
  @DisplayName("Unknown field is rejected and allowed fields are listed")
  void unknownField() {
    String msg =
        errorFor(filterOf(new Criterion("applicantEmailAddress", EQ, List.of("x"))));
    assertTrue(msg.contains("Unknown field 'applicantEmailAddress'"));
    assertTrue(msg.contains("status"));
  }

  @Test
  @DisplayName("Operator not allowed on field is rejected")
  void disallowedOperator() {
    String msg = errorFor(filterOf(new Criterion("species", CONTAINS, List.of("F"))));
    assertTrue(msg.contains("CONTAINS is not allowed on 'species'"));
  }

  @Test
  @DisplayName("Wrong number of values is rejected")
  void wrongArity() {
    String msg =
        errorFor(filterOf(new Criterion("collectionStartDate", BETWEEN, List.of("2026-01-01"))));
    assertTrue(msg.contains("expects 2 value(s)"));
  }

  @Test
  @DisplayName("Unparseable value is rejected with the expected type")
  void badValue() {
    String msg =
        errorFor(filterOf(new Criterion("collectionStartDate", EQ, List.of("yesterday"))));
    assertTrue(msg.contains("expected LocalDate"));
  }

  @Test
  @DisplayName("Null value is rejected")
  void nullValue() {
    List<Object> values = new ArrayList<>();
    values.add(null);
    String msg = errorFor(filterOf(new Criterion("species", EQ, values)));
    assertTrue(msg.contains("use IS_NULL"));
  }

  @Test
  @DisplayName("Nesting deeper than the limit is rejected")
  void tooDeep() {
    FilterGroup filter = filterOf(new Criterion("species", EQ, List.of("FDI")));
    for (int i = 0; i < SearchLimits.MAX_FILTER_DEPTH; i++) {
      filter = new FilterGroup(Logic.AND, null, List.of(filter));
    }
    assertTrue(errorFor(filter).contains("nested at most"));
  }

  @Test
  @DisplayName("Too many criteria in total is rejected")
  void tooManyCriteria() {
    Criterion c = new Criterion("species", EQ, List.of("FDI"));
    FilterGroup filter =
        new FilterGroup(Logic.OR, Collections.nCopies(SearchLimits.MAX_CRITERIA + 1, c), null);
    assertTrue(errorFor(filter).contains("at most " + SearchLimits.MAX_CRITERIA));
  }

  @Test
  @DisplayName("Empty nested groups count toward the total too")
  void tooManyGroups() {
    FilterGroup empty = new FilterGroup(Logic.AND, null, null);
    FilterGroup filter =
        new FilterGroup(Logic.OR, null, Collections.nCopies(SearchLimits.MAX_CRITERIA + 1, empty));
    assertTrue(errorFor(filter).contains("at most " + SearchLimits.MAX_CRITERIA));
  }

  // ------------------------------------------------------------------ child validation

  @Test
  @DisplayName("Valid EXISTS with a where on a child field compiles")
  void childValid() {
    var where = filterOf(new Criterion("orchardId", EQ, List.of("405")));
    assertDoesNotThrow(
        () -> schema.toSpecification(filterOf(new Criterion("orchards", EXISTS, null, where))));
  }

  @Test
  @DisplayName("EXISTS on something that is not a child collection is rejected")
  void existsOnField() {
    String msg = errorFor(filterOf(new Criterion("species", EXISTS, null)));
    assertTrue(msg.contains("Unknown child collection 'species'"));
  }

  @Test
  @DisplayName("Using a child collection like a field points the client to EXISTS")
  void childUsedAsField() {
    String msg = errorFor(filterOf(new Criterion("orchards", EQ, List.of("405"))));
    assertTrue(msg.contains("use EXISTS or NOT_EXISTS"));
  }

  @Test
  @DisplayName("A where clause only accepts the child's own fields")
  void childWhereUnknownField() {
    var where = filterOf(new Criterion("species", EQ, List.of("FDI")));
    String msg = errorFor(filterOf(new Criterion("orchards", EXISTS, null, where)));
    assertTrue(msg.contains("Unknown field 'species'"));
  }

  @Test
  @DisplayName("EXISTS takes no values")
  void existsWithValues() {
    String msg = errorFor(filterOf(new Criterion("orchards", EXISTS, List.of("405"))));
    assertTrue(msg.contains("takes no values"));
  }

  @Test
  @DisplayName("A where clause on a field criterion is rejected")
  void whereOnField() {
    var where = filterOf(new Criterion("orchardId", EQ, List.of("405")));
    String msg = errorFor(filterOf(new Criterion("species", EQ, List.of("FDI"), where)));
    assertTrue(msg.contains("only allowed with EXISTS"));
  }

  @Test
  @DisplayName("Criteria inside a where count toward the total limit")
  void childCriteriaCounted() {
    Criterion c = new Criterion("orchardId", EQ, List.of("405"));
    var where = new FilterGroup(Logic.OR, Collections.nCopies(SearchLimits.MAX_CRITERIA, c), null);
    String msg = errorFor(filterOf(new Criterion("orchards", EXISTS, null, where)));
    assertTrue(msg.contains("at most " + SearchLimits.MAX_CRITERIA));
  }

  // ------------------------------------------------------------------ paging & sorting

  @Test
  @DisplayName("Defaults: page 0, size 20, default sort plus tiebreaker")
  void pageableDefaults() {
    Pageable pageable = schema.toPageable(new SearchRequest(null, null, null, null));

    assertEquals(0, pageable.getPageNumber());
    assertEquals(SearchLimits.DEFAULT_PAGE_SIZE, pageable.getPageSize());
    assertEquals(
        Sort.by(Direction.DESC, "auditInformation.updateTimestamp").and(Sort.by("id")),
        pageable.getSort());
  }

  @Test
  @DisplayName("Requested sort maps api names to entity paths and appends tiebreaker")
  void pageableSortMapping() {
    Pageable pageable =
        schema.toPageable(
            new SearchRequest(null, List.of(new SortOrder("status", Direction.DESC)), 1, 50));

    assertEquals(1, pageable.getPageNumber());
    assertEquals(50, pageable.getPageSize());
    assertEquals(
        Sort.by(Direction.DESC, "seedlotStatus.seedlotStatusCode").and(Sort.by("id")),
        pageable.getSort());
  }

  @Test
  @DisplayName("Tiebreaker is not duplicated when the client already sorts by it")
  void noDuplicateTiebreaker() {
    Pageable pageable =
        schema.toPageable(
            new SearchRequest(
                null, List.of(new SortOrder("seedlotNumber", Direction.DESC)), null, null));

    assertEquals(Sort.by(Direction.DESC, "id"), pageable.getSort());
  }

  @Test
  @DisplayName("Composite tiebreaker appends every key column")
  void compositeTiebreaker() {
    var composite =
        SearchSchema.forEntity(SeedlotOrchard.class)
            .sortableField("orchardId", "orchardId", String.class, EQ)
            .tiebreaker("seedlot.id", "orchardId")
            .build(MAPPER);

    Pageable pageable = composite.toPageable(new SearchRequest(null, null, null, null));

    assertEquals(Sort.by("seedlot.id").and(Sort.by("orchardId")), pageable.getSort());
  }

  @Test
  @DisplayName("Sorting on a non-sortable field is rejected")
  void nonSortable() {
    var request =
        new SearchRequest(null, List.of(new SortOrder("intendedForCrownLand", null)), null, null);
    assertThrows(InvalidSearchException.class, () -> schema.toPageable(request));
  }

  @Test
  @DisplayName("Sorting on a child collection is rejected")
  void sortOnChild() {
    var request = new SearchRequest(null, List.of(new SortOrder("orchards", null)), null, null);
    assertThrows(InvalidSearchException.class, () -> schema.toPageable(request));
  }

  // ------------------------------------------------------------------ declaration checks

  @Test
  @DisplayName("Text operator on a non-text field fails at startup")
  void textOperatorOnNonText() {
    var builder = SearchSchema.forEntity(Seedlot.class);
    assertThrows(
        IllegalStateException.class,
        () -> builder.field("count", "totalParentTrees", Integer.class, CONTAINS));
  }

  @Test
  @DisplayName("Child operator on a field fails at startup")
  void childOperatorOnField() {
    var builder = SearchSchema.forEntity(Seedlot.class);
    assertThrows(
        IllegalStateException.class,
        () -> builder.field("species", "vegetationCode", String.class, EXISTS));
  }

  @Test
  @DisplayName("Child without a link fails at startup")
  void childWithoutLink() {
    var builder = SearchSchema.forEntity(Seedlot.class);
    assertThrows(
        IllegalStateException.class,
        () ->
            builder.child(
                "orchards",
                SeedlotOrchard.class,
                c -> c.field("orchardId", "orchardId", String.class, EQ)));
  }

  @Test
  @DisplayName("Duplicate names fail at startup")
  void duplicateNames() {
    var builder =
        SearchSchema.forEntity(Seedlot.class).field("species", "vegetationCode", String.class, EQ);
    assertThrows(
        IllegalStateException.class,
        () -> builder.field("species", "vegetationCode", String.class, IN));
  }

  @Test
  @DisplayName("ignoreCase needs a declared String field")
  void ignoreCaseValidation() {
    var builder =
        SearchSchema.forEntity(Seedlot.class)
            .field("count", "totalParentTrees", Integer.class, EQ);
    assertThrows(IllegalStateException.class, () -> builder.ignoreCase("count"));
    assertThrows(IllegalStateException.class, () -> builder.ignoreCase("unknown"));
  }

  @Test
  @DisplayName("Unpaged limit must be positive")
  void unpagedLimitPositive() {
    var builder = SearchSchema.forEntity(Seedlot.class);
    assertThrows(IllegalStateException.class, () -> builder.allowUnpaged(0));
  }

  @Test
  @DisplayName("Missing tiebreaker fails at startup")
  void missingTiebreaker() {
    var builder =
        SearchSchema.forEntity(Seedlot.class).field("species", "vegetationCode", String.class, EQ);
    assertThrows(IllegalStateException.class, () -> builder.build(MAPPER));
  }
}
