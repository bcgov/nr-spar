package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.NumberTreesCollectedCodeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This interface enables the number of trees collected from entity to be retrieved. */
public interface NumberTreesCollectedCodeRepository extends JpaRepository<NumberTreesCollectedCodeEntity, String> {

  @Query(
      value =
          "select n from NumberTreesCollectedCodeEntity n WHERE CURRENT_DATE >= n.effectiveDate "
              + "AND CURRENT_DATE < n.expiryDate ORDER BY n.code")
  List<NumberTreesCollectedCodeEntity> findAllValid();
}
