package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import ca.bc.gov.oracleapi.entity.projection.ParentTreeProj;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This class holds methods for retrieving {@link ParentTreeEntity} data from the database. */
public interface ParentTreeRepository extends JpaRepository<ParentTreeEntity, Long> {

  @Query("from ParentTreeEntity where id in ?1")
  List<ParentTreeEntity> findAllIn(List<Long> ids);

  @Query(
      value =
          """
            SELECT DISTINCT PT.PARENT_TREE_ID AS \"parentTreeId\",
              PT.PARENT_TREE_NUMBER AS \"parentTreeNumber\",
              O.ORCHARD_ID AS \"orchardId\", Q.SEED_PLAN_UNIT_ID AS \"spu\",
              PT.TESTED_IND AS \"tested\"
            FROM PARENT_TREE PT
            JOIN PARENT_TREE_ORCHARD PTO
              ON PTO.PARENT_TREE_ID = PT.PARENT_TREE_ID
            JOIN ORCHARD O
              ON O.ORCHARD_ID = PTO.ORCHARD_ID
            LEFT JOIN PARENT_TREE_GENETIC_QUALITY Q
              ON PT.PARENT_TREE_ID = Q.PARENT_TREE_ID
            WHERE PT.VEGETATION_CODE = ?1
              AND PT.parent_tree_reg_status_code = 'APP'
          """,
      nativeQuery = true)
  List<ParentTreeProj> findAllParentTreeWithVegCode(String vegCode);
}
