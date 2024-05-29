package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.VegetationCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** A repository to fetch {@link VegetationCode vegetation codes}. */
public interface VegetationCodeRepository extends JpaRepository<VegetationCode, String> {

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
