package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.entity.projection.ParentTreeNumberProj;
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
          SELECT DISTINCT PT.PARENT_TREE_ID as \"id\", PT.PARENT_TREE_NUMBER as \"number\"
           FROM PARENT_TREE PT JOIN PARENT_TREE_ORCHARD PTO ON PT.PARENT_TREE_ID =
           PTO.PARENT_TREE_ID JOIN ORCHARD O ON O.ORCHARD_ID = PTO.ORCHARD_ID
           WHERE O.ORCHARD_STAGE_CODE != 'RET' AND PT.VEGETATION_CODE = ?1
           ORDER BY \"number\" ASC
          """,
      nativeQuery = true)
  List<ParentTreeNumberProj> findAllNonRetParentTreeWithVegCode(String vegCode);
}
