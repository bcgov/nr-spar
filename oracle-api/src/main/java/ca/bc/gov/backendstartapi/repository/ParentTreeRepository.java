package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.ParentTree;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This class holds methods for retrieving {@link ParentTree} data from the database. */
public interface ParentTreeRepository extends JpaRepository<ParentTree, Long> {

  @Query("from ParentTree where id in ?1")
  List<ParentTree> findAllIn(List<Long> ids);

  @Query(
      value =
          "SELECT DISTINCT PT.* FROM PARENT_TREE PT JOIN PARENT_TREE_ORCHARD PTO ON"
              + " PT.PARENT_TREE_ID = PTO.PARENT_TREE_ID JOIN ORCHARD O ON O.ORCHARD_ID ="
              + " PTO.ORCHARD_ID WHERE O.ORCHARD_STAGE_CODE != 'RET' AND PT.VEGETATION_CODE = ?1"
              + " ORDER BY PT.PARENT_TREE_NUMBER ASC",
      nativeQuery = true)
  List<ParentTree> findAllNonRetParentTreeWithVegCode(String vegCode);
}
