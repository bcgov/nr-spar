package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import ca.bc.gov.oracleapi.entity.projection.ParentTreeProj;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This class holds methods for retrieving {@link ParentTreeEntity} data from the database. */
public interface ParentTreeRepository extends JpaRepository<ParentTreeEntity, Long> {

  List<ParentTreeEntity> findAllByIdIn(List<Long> ids);

  @Query(
      value =
         """
          SELECT PT.PARENT_TREE_ID AS \"parentTreeId\",
            PT.PARENT_TREE_NUMBER AS \"parentTreeNumber\",
            PTO.ORCHARD_ID AS \"orchardId\",
            PTSPU.SEED_PLAN_UNIT_ID AS \"spu\",
            PT.TESTED_IND AS \"tested\",
            Q.GENETIC_TYPE_CODE AS \"geneticTypeCode\",
            Q.GENETIC_WORTH_CODE AS \"geneticWorthCode\",
            Q.GENETIC_QUALITY_VALUE AS \"geneticQualityValue\"
          FROM parent_tree PT
          JOIN parent_tree_orchard PTO ON PTO.parent_tree_id = PT.parent_tree_id
          LEFT JOIN parent_tree_seed_plan_unit PTSPU ON PTSPU.parent_tree_id = PT.parent_tree_id
          LEFT JOIN parent_tree_genetic_quality Q ON PT.parent_tree_id = Q.parent_tree_id
            AND Q.seed_plan_unit_id = PTSPU.seed_plan_unit_id
            AND Q.genetic_worth_calc_ind = 'Y'
          WHERE PT.VEGETATION_CODE = ?1
            AND PT.ACTIVE_IND = 'Y'
            AND PT.parent_tree_reg_status_code = 'APP'
          ORDER BY PT.parent_tree_id
        """,
      nativeQuery = true)
  List<ParentTreeProj> findAllParentTreeWithVegCode(String vegCode);
}
