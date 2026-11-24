package ca.bc.gov.oracleapi.search;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.AbstractQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Turns a {@link SearchRequest} into a JPA {@link Specification} and a {@link Pageable}, using a
 * whitelist of fields and child collections declared through {@link #forEntity(Class)}. Everything
 * is validated eagerly, so a bad request fails with {@link InvalidSearchException} (HTTP 400)
 * before any SQL runs.
 *
 * <p>The schema holds structure only (which fields exist, how tables link). Which filters to apply
 * is entirely up to the client.
 *
 * <p>Build one instance per resource and reuse it; it is immutable and thread-safe.
 *
 * @param <E> the JPA entity being searched
 */
public final class SearchSchema<E> {

  private final Node root;
  private final List<String> tiebreakerPaths;
  private final Sort defaultSort;
  private final int unpagedLimit;
  private final ObjectMapper mapper;

  private SearchSchema(
      Node root,
      List<String> tiebreakerPaths,
      Sort defaultSort,
      int unpagedLimit,
      ObjectMapper mapper) {
    this.root = root;
    this.tiebreakerPaths = List.copyOf(tiebreakerPaths);
    this.defaultSort = defaultSort;
    this.unpagedLimit = unpagedLimit;
    this.mapper = mapper;
  }

  /** Starts declaring the search surface of an entity. */
  public static <E> Builder<E> forEntity(Class<E> entityType) {
    return new Builder<>(entityType);
  }

  // ================================================================== filtering

  /** Builds a validated specification; {@code null} matches everything. */
  public Specification<E> toSpecification(FilterGroup filter) {
    if (filter == null) {
      return (r, q, cb) -> cb.conjunction();
    }
    PredicateFactory factory = compileGroup(root, filter, 1, new int[] {0});
    return factory::build;
  }

  /** Builds a predicate for a given root inside a (sub)query. */
  @FunctionalInterface
  private interface PredicateFactory {
    Predicate build(Root<?> root, AbstractQuery<?> query, CriteriaBuilder cb);
  }

  private PredicateFactory compileGroup(Node node, FilterGroup group, int depth, int[] count) {
    if (depth > SearchLimits.MAX_FILTER_DEPTH) {
      throw new InvalidSearchException(
          "Filters may be nested at most " + SearchLimits.MAX_FILTER_DEPTH + " levels deep");
    }
    List<PredicateFactory> parts = new ArrayList<>();
    for (Criterion criterion : nullSafe(group.criteria())) {
      countPart(count);
      parts.add(compileCriterion(node, criterion, depth, count));
    }
    for (FilterGroup child : nullSafe(group.groups())) {
      countPart(count);
      parts.add(compileGroup(node, child, depth + 1, count));
    }
    if (parts.isEmpty()) {
      return (r, q, cb) -> cb.conjunction();
    }
    boolean or = group.logicOrDefault() == FilterGroup.Logic.OR;
    return (r, q, cb) -> {
      Predicate[] predicates = parts.stream().map(p -> p.build(r, q, cb)).toArray(Predicate[]::new);
      return or ? cb.or(predicates) : cb.and(predicates);
    };
  }

  /** Counts criteria and nested groups together, so a filter's total size is bounded. */
  private static void countPart(int[] count) {
    if (++count[0] > SearchLimits.MAX_CRITERIA) {
      throw new InvalidSearchException(
          "A filter may contain at most %d criteria and groups in total"
              .formatted(SearchLimits.MAX_CRITERIA));
    }
  }

  private PredicateFactory compileCriterion(
      Node node, Criterion criterion, int depth, int[] count) {
    SearchOperator op = criterion.operator();
    if (op.isChildOperator()) {
      return compileChildCriterion(node, criterion, depth, count);
    }
    if (criterion.where() != null) {
      throw new InvalidSearchException(
          "'where' is only allowed with EXISTS or NOT_EXISTS (field '%s')"
              .formatted(criterion.field()));
    }
    return compileFieldCriterion(node, criterion);
  }

  private PredicateFactory compileChildCriterion(
      Node node, Criterion criterion, int depth, int[] count) {
    Child child = node.children.get(criterion.field());
    if (child == null) {
      throw new InvalidSearchException(
          "Unknown child collection '%s'. Allowed: %s"
              .formatted(criterion.field(), node.children.keySet()));
    }
    if (!nullSafe(criterion.values()).isEmpty()) {
      throw new InvalidSearchException(
          "%s takes no values; put conditions in 'where'".formatted(criterion.operator()));
    }
    PredicateFactory inner =
        criterion.where() == null ? null : compileGroup(child, criterion.where(), depth + 1, count);
    boolean negate = criterion.operator() == SearchOperator.NOT_EXISTS;

    return (parentRoot, query, cb) -> {
      Subquery<Integer> subquery = query.subquery(Integer.class);
      Root<?> childRoot = subquery.from(child.entityType);
      List<Predicate> predicates = new ArrayList<>();
      for (Link link : child.links) {
        predicates.add(
            cb.equal(path(childRoot, link.childPath()), path(parentRoot, link.parentPath())));
      }
      if (inner != null) {
        predicates.add(inner.build(childRoot, subquery, cb));
      }
      subquery.select(cb.literal(1)).where(predicates.toArray(Predicate[]::new));
      Predicate exists = cb.exists(subquery);
      return negate ? cb.not(exists) : exists;
    };
  }

  @SuppressWarnings({"unchecked", "rawtypes"})
  private PredicateFactory compileFieldCriterion(Node node, Criterion criterion) {
    SearchField field = node.fields.get(criterion.field());
    if (field == null) {
      String hint =
          node.children.containsKey(criterion.field())
              ? " ('%s' is a child collection; use EXISTS or NOT_EXISTS)"
                  .formatted(criterion.field())
              : "";
      throw new InvalidSearchException(
          "Unknown field '%s'. Allowed: %s%s"
              .formatted(criterion.field(), node.fields.keySet(), hint));
    }
    SearchOperator op = criterion.operator();
    if (!field.operators().contains(op)) {
      throw new InvalidSearchException(
          "Operator %s is not allowed on '%s'. Allowed: %s"
              .formatted(op, field.apiName(), field.operators()));
    }
    List<Object> raw = nullSafe(criterion.values());
    if (raw.size() < op.minValues() || raw.size() > op.maxValues()) {
      throw new InvalidSearchException(
          op.minValues() == op.maxValues()
              ? "Operator %s on '%s' expects %d value(s)"
                  .formatted(op, field.apiName(), op.minValues())
              : "Operator %s on '%s' expects %d to %d values"
                  .formatted(op, field.apiName(), op.minValues(), op.maxValues()));
    }
    boolean upper = field.ignoreCase() && op != SearchOperator.CONTAINS;
    List<Comparable> values =
        raw.stream()
            .map(v -> convert(v, field))
            .map(v -> upper ? ((String) v).toUpperCase(Locale.ROOT) : v)
            .map(Comparable.class::cast)
            .toList();

    return (r, q, cb) -> {
      Path<?> column = path(r, field.entityPath());
      Expression p = upper ? cb.upper((Expression<String>) column) : column;
      return switch (op) {
        case EQ -> cb.equal(p, values.get(0));
        case NE -> cb.notEqual(p, values.get(0));
        case IN -> p.in(values);
        case GT -> cb.greaterThan(p, values.get(0));
        case GTE -> cb.greaterThanOrEqualTo(p, values.get(0));
        case LT -> cb.lessThan(p, values.get(0));
        case LTE -> cb.lessThanOrEqualTo(p, values.get(0));
        case BETWEEN -> cb.between(p, values.get(0), values.get(1));
        case CONTAINS ->
            cb.like(
                cb.lower((Expression<String>) p),
                "%" + escapeLike(values.get(0).toString().toLowerCase(Locale.ROOT)) + "%",
                '\\');
        case STARTS_WITH ->
            cb.like((Expression<String>) p, escapeLike(values.get(0).toString()) + "%", '\\');
        case IS_NULL -> cb.isNull(p);
        case IS_NOT_NULL -> cb.isNotNull(p);
        case EXISTS, NOT_EXISTS -> throw new IllegalStateException("handled elsewhere");
      };
    };
  }

  private Object convert(Object value, SearchField field) {
    if (value == null) {
      throw new InvalidSearchException(
          "Null values are not allowed for '%s'; use IS_NULL instead".formatted(field.apiName()));
    }
    try {
      return mapper.convertValue(value, field.javaType());
    } catch (IllegalArgumentException e) {
      throw new InvalidSearchException(
          "Invalid value '%s' for '%s' (expected %s)"
              .formatted(value, field.apiName(), field.javaType().getSimpleName()));
    }
  }

  // ================================================================== running a search

  /**
   * Runs a search: validates the request, applies the filter (and an optional server-side scope,
   * e.g. row-level access, which is always ANDed in), and returns one page, or every match when
   * the request is {@code unpaged} and this search allows it.
   *
   * @param repository the entity's repository
   * @param request the client's request
   * @param scope extra server-side restriction, or {@code null}
   * @return the matching rows
   */
  public Page<E> find(
      JpaSpecificationExecutor<E> repository, SearchRequest request, Specification<E> scope) {
    Specification<E> spec = toSpecification(request.filter());
    if (scope != null) {
      spec = spec.and(scope);
    }
    if (!request.isUnpaged()) {
      return repository.findAll(spec, toPageable(request));
    }
    if (unpagedLimit == 0) {
      throw new InvalidSearchException("This search does not support unpaged results");
    }
    long total = repository.count(spec);
    if (total > unpagedLimit) {
      throw new InvalidSearchException(
          "%d results match, more than the %d allowed in one response; narrow the filter"
              .formatted(total, unpagedLimit));
    }
    return new PageImpl<>(repository.findAll(spec, toSort(request)));
  }

  /** Same as {@link #find(JpaSpecificationExecutor, SearchRequest, Specification)}, unscoped. */
  public Page<E> find(JpaSpecificationExecutor<E> repository, SearchRequest request) {
    return find(repository, request, null);
  }

  // ================================================================== paging & sorting

  /** Builds a validated, size-capped pageable with a stable sort. */
  public Pageable toPageable(SearchRequest request) {
    int size = Math.min(request.sizeOrDefault(), SearchLimits.MAX_PAGE_SIZE);
    return PageRequest.of(request.pageOrDefault(), size, toSort(request));
  }

  /** Builds the validated sort, falling back to the default and ending with the tiebreaker. */
  public Sort toSort(SearchRequest request) {
    List<Sort.Order> orders = new ArrayList<>();
    for (SortOrder sortOrder : nullSafe(request.sort())) {
      SearchField field = root.fields.get(sortOrder.field());
      if (field == null) {
        throw new InvalidSearchException(
            "Unknown sort field '%s'. Allowed: %s"
                .formatted(sortOrder.field(), root.fields.keySet()));
      }
      if (!field.sortable()) {
        throw new InvalidSearchException("'" + field.apiName() + "' is not sortable");
      }
      Sort.Direction direction =
          sortOrder.direction() == null ? Sort.Direction.ASC : sortOrder.direction();
      orders.add(new Sort.Order(direction, field.entityPath()));
    }
    Sort sort = orders.isEmpty() ? defaultSort : Sort.by(orders);
    for (String tiebreaker : tiebreakerPaths) {
      if (sort.getOrderFor(tiebreaker) == null) {
        sort = sort.and(Sort.by(Sort.Direction.ASC, tiebreaker));
      }
    }
    return sort;
  }

  // ================================================================== helpers

  private static Path<?> path(Root<?> root, String dottedPath) {
    Path<?> path = root;
    for (String part : dottedPath.split("\\.")) {
      path = path.get(part);
    }
    return path;
  }

  private static String escapeLike(String value) {
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }

  private static <T> List<T> nullSafe(List<T> items) {
    return items == null ? List.of() : items;
  }

  // ================================================================== model

  /** Fields and child collections available at one level (the root entity or a child). */
  private static class Node {
    final Map<String, SearchField> fields;
    final Map<String, Child> children;

    Node(Map<String, SearchField> fields, Map<String, Child> children) {
      this.fields = Map.copyOf(fields);
      this.children = Map.copyOf(children);
    }
  }

  /** A child collection, linked to its parent by one or more column pairs. */
  private static final class Child extends Node {
    final Class<?> entityType;
    final List<Link> links;

    Child(
        Class<?> entityType,
        List<Link> links,
        Map<String, SearchField> fields,
        Map<String, Child> children) {
      super(fields, children);
      this.entityType = entityType;
      this.links = List.copyOf(links);
    }
  }

  /** {@code child.childPath = parent.parentPath}. */
  private record Link(String parentPath, String childPath) {}

  // ================================================================== builder

  /** Shared field/child declarations for the root and child builders. */
  public abstract static class NodeBuilder<B extends NodeBuilder<B>> {
    final Map<String, SearchField> fields = new LinkedHashMap<>();
    final Map<String, Child> children = new LinkedHashMap<>();

    abstract B self();

    abstract String describe();

    /** A filterable (not sortable) field. */
    public B field(String apiName, String entityPath, Class<?> type, SearchOperator... ops) {
      return addField(apiName, entityPath, type, false, ops);
    }

    B addField(
        String apiName, String entityPath, Class<?> type, boolean sortable, SearchOperator[] ops) {
      if (ops.length == 0) {
        throw new IllegalStateException("Field '" + apiName + "' needs at least one operator");
      }
      EnumSet<SearchOperator> operators = EnumSet.copyOf(Arrays.asList(ops));
      for (SearchOperator op : operators) {
        if (op.isChildOperator()) {
          throw new IllegalStateException(
              "Operator %s is for child collections, not field '%s'".formatted(op, apiName));
        }
        if (op.isTextOnly() && type != String.class) {
          throw new IllegalStateException(
              "Operator %s requires a String field, but '%s' is %s"
                  .formatted(op, apiName, type.getSimpleName()));
        }
      }
      ensureUnique(apiName);
      fields.put(apiName, new SearchField(apiName, entityPath, type, sortable, operators, false));
      return self();
    }

    /**
     * Makes already-declared String fields compare case-insensitively ({@code upper(column)}
     * against upper-cased values) for EQ, NE, IN and STARTS_WITH. CONTAINS always ignores case.
     */
    public B ignoreCase(String... apiNames) {
      for (String apiName : apiNames) {
        SearchField field = fields.get(apiName);
        if (field == null || field.javaType() != String.class) {
          throw new IllegalStateException(
              "ignoreCase needs a declared String field, got '%s' in %s"
                  .formatted(apiName, describe()));
        }
        fields.put(apiName, field.withIgnoreCase());
      }
      return self();
    }

    /**
     * A child collection clients can filter with EXISTS / NOT_EXISTS. The child entity does not
     * need a JPA relationship to the parent; declare the linking columns with {@link
     * ChildBuilder#link(String, String)}.
     */
    public <C> B child(String apiName, Class<C> childType, Consumer<ChildBuilder> spec) {
      ensureUnique(apiName);
      ChildBuilder builder = new ChildBuilder(apiName);
      spec.accept(builder);
      children.put(apiName, builder.build(childType));
      return self();
    }

    private void ensureUnique(String apiName) {
      if (fields.containsKey(apiName) || children.containsKey(apiName)) {
        throw new IllegalStateException(
            "Duplicate search name '%s' in %s".formatted(apiName, describe()));
      }
    }
  }

  /** Declares a child collection. */
  public static final class ChildBuilder extends NodeBuilder<ChildBuilder> {
    private final String name;
    private final List<Link> links = new ArrayList<>();

    private ChildBuilder(String name) {
      this.name = name;
    }

    @Override
    ChildBuilder self() {
      return this;
    }

    @Override
    String describe() {
      return "child '" + name + "'";
    }

    /** Links child rows to the parent: {@code child.childPath = parent.parentPath}. */
    public ChildBuilder link(String parentPath, String childPath) {
      links.add(new Link(parentPath, childPath));
      return this;
    }

    private Child build(Class<?> childType) {
      if (links.isEmpty()) {
        throw new IllegalStateException("Child '" + name + "' needs at least one link");
      }
      return new Child(childType, links, fields, children);
    }
  }

  /** Declares the root entity's search surface. */
  public static final class Builder<E> extends NodeBuilder<Builder<E>> {
    private final Class<E> entityType;
    private final List<String> tiebreakerPaths = new ArrayList<>();
    private Sort defaultSort = Sort.unsorted();
    private int unpagedLimit;

    private Builder(Class<E> entityType) {
      this.entityType = Objects.requireNonNull(entityType);
    }

    @Override
    Builder<E> self() {
      return this;
    }

    @Override
    String describe() {
      return entityType.getSimpleName();
    }

    /** A filterable and sortable field. */
    public Builder<E> sortableField(
        String apiName, String entityPath, Class<?> type, SearchOperator... ops) {
      return addField(apiName, entityPath, type, true, ops);
    }

    /** Sort used when the request has none. */
    public Builder<E> defaultSort(Sort sort) {
      this.defaultSort = Objects.requireNonNull(sort);
      return this;
    }

    /**
     * Entity paths that together uniquely identify a row (usually the id, or every part of a
     * composite key). Always appended to the sort so pages are stable.
     */
    public Builder<E> tiebreaker(String... entityPaths) {
      tiebreakerPaths.addAll(Arrays.asList(entityPaths));
      return this;
    }

    /**
     * Lets clients ask for every match in one response ({@code "unpaged": true}), e.g. for exports.
     * Requests matching more than {@code maxRows} rows are rejected rather than truncated. Searches
     * that do not call this reject unpaged requests.
     */
    public Builder<E> allowUnpaged(int maxRows) {
      if (maxRows <= 0) {
        throw new IllegalStateException("allowUnpaged needs a positive row limit");
      }
      this.unpagedLimit = maxRows;
      return this;
    }

    /** Validates the declaration and builds the schema. */
    public SearchSchema<E> build(ObjectMapper mapper) {
      if (tiebreakerPaths.isEmpty()) {
        throw new IllegalStateException(
            entityType.getSimpleName() + " search needs a tiebreaker (unique key paths)");
      }
      return new SearchSchema<>(
          new Node(fields, children),
          tiebreakerPaths,
          defaultSort,
          unpagedLimit,
          Objects.requireNonNull(mapper));
    }
  }
}
