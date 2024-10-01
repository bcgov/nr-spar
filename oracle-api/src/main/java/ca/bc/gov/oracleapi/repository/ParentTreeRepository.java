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
            WITH filtered_parent_tree AS (
              SELECT
                  PT.PARENT_TREE_ID,
                  PT.PARENT_TREE_NUMBER,
                  PT.TESTED_IND
              FROM parent_tree PT
              WHERE PT.VEGETATION_CODE = ?1
                AND PT.ACTIVE_IND = 'Y'
                AND PT.parent_tree_reg_status_code = 'APP'
            ),
            orchard_data AS (
                SELECT
                    PTO.parent_tree_id,
                    PTO.ORCHARD_ID
                FROM parent_tree_orchard PTO
                WHERE PTO.parent_tree_id IN (SELECT PARENT_TREE_ID FROM filtered_parent_tree)
            ),
            seed_plan_unit_data AS (
                SELECT
                    PTSPU.parent_tree_id,
                    PTSPU.SEED_PLAN_UNIT_ID
                FROM parent_tree_seed_plan_unit PTSPU
                WHERE PTSPU.parent_tree_id IN (SELECT PARENT_TREE_ID FROM filtered_parent_tree)
            ),
            genetic_quality_data AS (
                SELECT
                    Q.parent_tree_id,
                    Q.seed_plan_unit_id,
                    Q.GENETIC_TYPE_CODE,
                    Q.GENETIC_WORTH_CODE,
                    Q.GENETIC_QUALITY_VALUE
                FROM parent_tree_genetic_quality Q
                WHERE Q.genetic_worth_calc_ind = 'Y'
             )
            SELECT
                fpt.PARENT_TREE_ID AS \"parentTreeId\",
                fpt.PARENT_TREE_NUMBER AS \"parentTreeNumber\",
                od.ORCHARD_ID AS \"orchardId\",
                spud.SEED_PLAN_UNIT_ID AS \"spu\",
                fpt.TESTED_IND AS \"tested\",
                gqd.GENETIC_TYPE_CODE AS \"geneticTypeCode\",
                gqd.GENETIC_WORTH_CODE AS \"geneticWorthCode\",
                gqd.GENETIC_QUALITY_VALUE AS \"geneticQualityValue\"
            FROM filtered_parent_tree fpt
            JOIN orchard_data od ON od.parent_tree_id = fpt.PARENT_TREE_ID
            LEFT JOIN seed_plan_unit_data spud ON spud.parent_tree_id = fpt.PARENT_TREE_ID
            LEFT JOIN genetic_quality_data gqd ON gqd.parent_tree_id = fpt.PARENT_TREE_ID
              AND gqd.seed_plan_unit_id = spud.SEED_PLAN_UNIT_ID
            ORDER BY fpt.PARENT_TREE_ID
         """,
      nativeQuery = true)
  List<ParentTreeProj> findAllParentTreeWithVegCode(String vegCode);
}
