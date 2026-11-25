package ca.bc.gov.oracleapi.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.RETURNS_SELF;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.search.FilterGroup.Logic;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** Unit tests for {@link SearchSchema}, using mocked JPA criteria objects (no database). */
@SuppressWarnings({"unchecked", "rawtypes"})
class SearchSchemaTest {

  private static final ObjectMapper MAPPER = JsonMapper.builder().findAndAddModules().build();

  /** Stand-in root entity; the schema never touches it directly. */
  static class Thing {}

  /** Stand-in child entity. */
  static class Item {}

  private SearchSchema<Thing> schema;

  private CriteriaBuilder cb;
  private Root root;
  private Path path;
  private CriteriaQuery query;

  @BeforeEach
  void setUp() {
    schema = baseBuilder().allowUnpaged(3).build(MAPPER);

    cb = mock(CriteriaBuilder.class);
    root = mock(Root.class);
    path = mock(Path.class);
    query = mock(CriteriaQuery.class);
    when(root.get(anyString())).thenReturn(path);
    when(path.get(anyString())).thenReturn(path);
  }

  private static SearchSchema.Builder<Thing> baseBuilder() {
    return SearchSchema.forEntity(Thing.class)
        .sortableField("name", "name", String.class, SearchOperator.EQ,
            SearchOperator.NE, SearchOperator.IN, SearchOperator.CONTAINS,
            SearchOperator.STARTS_WITH, SearchOperator.IS_NULL, SearchOperator.IS_NOT_NULL)
        .sortableField("code", "code", String.class, SearchOperator.EQ, SearchOperator.CONTAINS)
        .field("count", "count", Integer.class, SearchOperator.EQ, SearchOperator.GT,
            SearchOperator.GTE, SearchOperator.LT, SearchOperator.LTE, SearchOperator.BETWEEN)
        .field("ownerId", "owner.id", Integer.class, SearchOperator.EQ)
        .sortableField("id", "id", Integer.class, SearchOperator.EQ)
        .ignoreCase("code")
        .child(
            "items",
            Item.class,
            c -> c.link("id", "parentId").field("status", "status", String.class, SearchOperator.EQ))
        .defaultSort(Sort.by("name"))
        .tiebreaker("id");
  }

  private static Criterion c(String field, SearchOperator op, Object... values) {
    return new Criterion(field, op, Arrays.asList(values));
  }

  private static FilterGroup and(Criterion... criteria) {
    return new FilterGroup(Logic.AND, List.of(criteria), null);
  }

  private void run(FilterGroup filter) {
    schema.toSpecification(filter).toPredicate(root, query, cb);
  }

  private void assertInvalid(FilterGroup filter, String messagePart) {
    var e = assertThrows(InvalidSearchException.class, () -> schema.toSpecification(filter));
    assertTrue(
        e.getMessage().contains(messagePart),
        () -> "'" + e.getMessage() + "' should contain '" + messagePart + "'");
  }

  private static void assertIllegalState(Executable executable) {
    assertThrows(IllegalStateException.class, executable);
  }

  @Nested
  @DisplayName("Builder validation")
  class BuilderValidation {

    @Test
    void fieldNeedsAnOperator() {
      var builder = SearchSchema.forEntity(Thing.class);
      assertIllegalState(() -> builder.field("a", "a", String.class));
    }

    @Test
    void childOperatorNotAllowedOnField() {
      var builder = SearchSchema.forEntity(Thing.class);
      assertIllegalState(() -> builder.field("a", "a", String.class, SearchOperator.EXISTS));
    }

    @Test
    void textOperatorNeedsStringField() {
      var builder = SearchSchema.forEntity(Thing.class);
      assertIllegalState(() -> builder.field("a", "a", Integer.class, SearchOperator.CONTAINS));
    }

    @Test
    void duplicateNamesRejected() {
      var builder = SearchSchema.forEntity(Thing.class).field("a", "a", String.class,
          SearchOperator.EQ);
      assertIllegalState(() -> builder.field("a", "b", String.class, SearchOperator.EQ));
    }

    @Test
    void ignoreCaseNeedsDeclaredField() {
      var builder = SearchSchema.forEntity(Thing.class);
      assertIllegalState(() -> builder.ignoreCase("missing"));
    }

    @Test
    void ignoreCaseNeedsStringField() {
      var builder =
          SearchSchema.forEntity(Thing.class).field("n", "n", Integer.class, SearchOperator.EQ);
      assertIllegalState(() -> builder.ignoreCase("n"));
    }

    @Test
    void childNeedsALink() {
      var builder = SearchSchema.forEntity(Thing.class);
      assertIllegalState(
          () -> builder.child("kids", Item.class, c -> c.field("x", "x", String.class,
              SearchOperator.EQ)));
    }

    @Test
    void unpagedNeedsPositiveLimit() {
      var builder = SearchSchema.forEntity(Thing.class);
      assertIllegalState(() -> builder.allowUnpaged(0));
    }

    @Test
    void tiebreakerRequired() {
      var builder =
          SearchSchema.forEntity(Thing.class).field("a", "a", String.class, SearchOperator.EQ);
      assertIllegalState(() -> builder.build(MAPPER));
    }
  }

  @Nested
  @DisplayName("Filter validation")
  class FilterValidation {

    @Test
    void tooDeep() {
      FilterGroup group = and(c("id", SearchOperator.EQ, 1));
      for (int i = 0; i < SearchLimits.MAX_FILTER_DEPTH; i++) {
        group = new FilterGroup(Logic.AND, null, List.of(group));
      }
      assertInvalid(group, "nested at most");
    }

    @Test
    void tooManyCriteria() {
      List<Criterion> criteria = new ArrayList<>();
      for (int i = 0; i <= SearchLimits.MAX_CRITERIA; i++) {
        criteria.add(c("id", SearchOperator.EQ, i));
      }
      assertInvalid(new FilterGroup(Logic.AND, criteria, null), "at most");
    }

    @Test
    void whereOnlyWithExists() {
      var criterion =
          new Criterion("id", SearchOperator.EQ, List.of(1), and(c("status", SearchOperator.EQ,
              "x")));
      assertInvalid(and(criterion), "'where' is only allowed");
    }

    @Test
    void unknownChild() {
      assertInvalid(and(c("nope", SearchOperator.EXISTS)), "Unknown child collection");
    }

    @Test
    void existsTakesNoValues() {
      assertInvalid(and(c("items", SearchOperator.EXISTS, "x")), "takes no values");
    }

    @Test
    void unknownField() {
      assertInvalid(and(c("nope", SearchOperator.EQ, 1)), "Unknown field 'nope'");
    }

    @Test
    void childUsedAsFieldGetsHint() {
      assertInvalid(and(c("items", SearchOperator.EQ, 1)), "is a child collection");
    }

    @Test
    void operatorNotAllowed() {
      assertInvalid(and(c("ownerId", SearchOperator.GT, 1)), "is not allowed");
    }

    @Test
    void wrongFixedValueCount() {
      assertInvalid(and(c("count", SearchOperator.BETWEEN, 1)), "expects 2 value(s)");
    }

    @Test
    void wrongRangeValueCount() {
      assertInvalid(and(c("name", SearchOperator.IN)), "expects 1 to");
    }

    @Test
    void nullValue() {
      assertInvalid(and(c("id", SearchOperator.EQ, (Object) null)), "use IS_NULL");
    }

    @Test
    void unconvertibleValue() {
      assertInvalid(and(c("id", SearchOperator.EQ, "abc")), "Invalid value 'abc'");
    }
  }

  @Nested
  @DisplayName("Predicate building")
  class Predicates {

    @Test
    void nullFilterMatchesEverything() {
      run(null);
      verify(cb).conjunction();
    }

    @Test
    void emptyGroupMatchesEverything() {
      run(new FilterGroup(null, null, null));
      verify(cb).conjunction();
    }

    @Test
    void orGroup() {
      run(new FilterGroup(
          Logic.OR, List.of(c("id", SearchOperator.EQ, 1), c("id", SearchOperator.EQ, 2)), null));
      verify(cb).or(any(Predicate[].class));
      verify(cb, never()).and(any(Predicate[].class));
    }

    @Test
    void comparisonOperators() {
      run(and(
          c("name", SearchOperator.NE, "a"),
          c("count", SearchOperator.GT, 1),
          c("count", SearchOperator.GTE, 2),
          c("count", SearchOperator.LT, 3),
          c("count", SearchOperator.LTE, 4),
          c("count", SearchOperator.BETWEEN, 5, 6),
          c("ownerId", SearchOperator.EQ, "7")));
      verify(cb).notEqual(path, "a");
      verify(cb).greaterThan(path, 1);
      verify(cb).greaterThanOrEqualTo(path, 2);
      verify(cb).lessThan(path, 3);
      verify(cb).lessThanOrEqualTo(path, 4);
      verify(cb).between(path, 5, 6);
      verify(cb).equal(path, 7);
      verify(path).get("id");
    }

    @Test
    void inAndNullChecks() {
      run(and(
          c("name", SearchOperator.IN, "a", "b"),
          c("name", SearchOperator.IS_NULL),
          c("name", SearchOperator.IS_NOT_NULL)));
      verify(path).in(List.of("a", "b"));
      verify(cb).isNull(path);
      verify(cb).isNotNull(path);
    }

    @Test
    void textOperatorsEscapeWildcards() {
      Expression lower = mock(Expression.class);
      when(cb.lower(path)).thenReturn(lower);
      run(and(
          c("name", SearchOperator.CONTAINS, "A%b"),
          c("name", SearchOperator.STARTS_WITH, "x_\\")));
      verify(cb).like(lower, "%a\\%b%", '\\');
      verify(cb).like(path, "x\\_\\\\%", '\\');
    }

    @Test
    void ignoreCaseFieldComparesUpperCase() {
      Expression upper = mock(Expression.class);
      Expression lower = mock(Expression.class);
      when(cb.upper(path)).thenReturn(upper);
      when(cb.lower(path)).thenReturn(lower);
      run(and(c("code", SearchOperator.EQ, "abc"), c("code", SearchOperator.CONTAINS, "Ab")));
      verify(cb).equal(upper, "ABC");
      // CONTAINS lower-cases on its own rather than upper-casing.
      verify(cb).like(lower, "%ab%", '\\');
    }

    @Nested
    @DisplayName("EXISTS / NOT_EXISTS")
    class Exists {

      private Subquery subquery;
      private Path childPath;
      private Predicate exists;

      @BeforeEach
      void setUpSubquery() {
        subquery = mock(Subquery.class, RETURNS_SELF);
          Root childRoot = mock(Root.class);
        childPath = mock(Path.class);
        exists = mock(Predicate.class);
        when(query.subquery(Integer.class)).thenReturn(subquery);
        when(subquery.from(Item.class)).thenReturn(childRoot);
        when(childRoot.get(anyString())).thenReturn(childPath);
        when(cb.exists(subquery)).thenReturn(exists);
      }

      @Test
      void existsWithoutWhere() {
        run(and(c("items", SearchOperator.EXISTS)));
        verify(cb).exists(subquery);
        verify(cb, never()).not(any());
        verify(cb).equal(childPath, path);
      }

      @Test
      void notExistsWithWhere() {
        var criterion =
            new Criterion(
                "items", SearchOperator.NOT_EXISTS, null, and(c("status", SearchOperator.EQ,
                    "OPEN")));
        run(and(criterion));
        verify(cb).not(exists);
        verify(cb).equal(childPath, "OPEN");
      }
    }
  }

  @Nested
  @DisplayName("Sorting and paging")
  class Sorting {

    @Test
    void defaultSortGetsTiebreaker() {
      Sort sort = schema.toSort(new SearchRequest(null, null, null, null));
      assertEquals(Sort.by("name").and(Sort.by("id")), sort);
    }

    @Test
    void missingDirectionIsAscending() {
      Sort sort =
          schema.toSort(new SearchRequest(null, List.of(new SortOrder("code", null)), null, null));
      assertEquals(Sort.by(Direction.ASC, "code").and(Sort.by("id")), sort);
    }

    @Test
    void tiebreakerNotRepeated() {
      Sort sort =
          schema.toSort(
              new SearchRequest(null, List.of(new SortOrder("id", Direction.DESC)), null, null));
      assertEquals(Sort.by(Direction.DESC, "id"), sort);
    }

    @Test
    void unknownSortField() {
      var request = new SearchRequest(null, List.of(new SortOrder("nope", null)), null, null);
      assertThrows(InvalidSearchException.class, () -> schema.toSort(request));
    }

    @Test
    void unsortableField() {
      var request = new SearchRequest(null, List.of(new SortOrder("count", null)), null, null);
      assertThrows(InvalidSearchException.class, () -> schema.toSort(request));
    }

    @Test
    void pageSizeIsCapped() {
      Pageable pageable = schema.toPageable(new SearchRequest(null, null, 2, 5000));
      assertEquals(SearchLimits.MAX_PAGE_SIZE, pageable.getPageSize());
      assertEquals(2, pageable.getPageNumber());
    }
  }

  @Nested
  @DisplayName("find")
  class Find {

    private JpaSpecificationExecutor<Thing> repository;

    @BeforeEach
    void setUpRepository() {
      repository = mock(JpaSpecificationExecutor.class);
    }

    @Test
    void pagedAppliesScope() {
      Page<Thing> page = Page.empty();
      when(repository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
      Specification<Thing> scope = mock(Specification.class);

      assertSame(page, schema.find(repository, new SearchRequest(null, null, 0, 10), scope));

      ArgumentCaptor<Specification> captor = ArgumentCaptor.forClass(Specification.class);
      verify(repository).findAll(captor.capture(), any(Pageable.class));
      captor.getValue().toPredicate(root, query, cb);
      verify(scope).toPredicate(root, query, cb);
    }

    @Test
    void unpagedReturnsEverything() {
      when(repository.count(any(Specification.class))).thenReturn(2L);
      when(repository.findAll(any(Specification.class), any(Sort.class)))
          .thenReturn(List.of(new Thing(), new Thing()));

      Page<Thing> page =
          schema.find(repository, new SearchRequest(null, null, null, null, true));

      assertEquals(2, page.getContent().size());
    }

    @Test
    void unpagedOverLimitRejected() {
      when(repository.count(any(Specification.class))).thenReturn(4L);
      var request = new SearchRequest(null, null, null, null, true);
      assertThrows(InvalidSearchException.class, () -> schema.find(repository, request));
    }

    @Test
    void unpagedNotAllowed() {
      SearchSchema<Thing> pagedOnly = baseBuilder().build(MAPPER);
      var request = new SearchRequest(null, null, null, null, true);
      assertThrows(InvalidSearchException.class, () -> pagedOnly.find(repository, request));
    }
  }
}
