package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** The repository for {@link SeedlotCollectionMethod}. */
public interface SeedlotCollectionMethodRepository
    extends JpaRepository<SeedlotCollectionMethod, SeedlotCollectionMethodId> {

  /**
   * Fetches all collection methods for a seedlot, eagerly joining {@code coneCollectionMethod}.
   *
   * <p>{@code coneCollectionMethod} is a derived-identity association ({@code @Id @ManyToOne}),
   * which Hibernate otherwise resolves only far enough to read the identifier, leaving fields
   * like {@code description} unpopulated. The join fetch loads it fully in a single query.
   */
  @Query(
      "SELECT scm FROM SeedlotCollectionMethod scm "
          + "JOIN FETCH scm.coneCollectionMethod "
          + "WHERE scm.seedlot.id = :seedlotNumber")
  List<SeedlotCollectionMethod> findAllBySeedlot_id(@Param("seedlotNumber") String seedlotNumber);

  void deleteAllBySeedlot_id(String seedlotNumber);
}
