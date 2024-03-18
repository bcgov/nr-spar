package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.VegetationCode;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** A repository to fetch {@link VegetationCode vegetation codes}. */
public interface VegetationCodeRepository extends JpaRepository<VegetationCode, String> {

  /**
   * Fetch a vegetation code by its identifier, if such code exists.
   *
   * @param code the identifier of the vegetation code sought
   * @return information about the vegetation code identified by {@code code}, if one exists
   */
  Optional<VegetationCode> findById(String code);

  /**
   * Paginated search for valid vegetation codes by their identifier or description.
   *
   * @param search a string to which the codes' identifiers and descriptions should be matched
   * @param pageable the {@link Pageable} page option
   * @return a list with up to {@code maxResults} results that match {@code search}, ordered by
   *     their identifiers
   */
  @Query(
      """
        SELECT vc FROM VegetationCode vc
        WHERE (vc.id ILIKE :search OR vc.description ILIKE :search)
        AND CURRENT_DATE >= vc.effectiveDate AND CURRENT_DATE < vc.expiryDate
        ORDER BY vc.id
        """)
  Page<VegetationCode> findByCodeOrDescription(String search, Pageable pageable);
}
