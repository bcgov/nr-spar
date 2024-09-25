package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.ParentTreeOrchard;
import ca.bc.gov.oracleapi.entity.idclass.ParentTreeOrchardId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link ParentTreeOrchard} data from the database. */
public interface ParentTreeOrchardRepository
    extends JpaRepository<ParentTreeOrchard, ParentTreeOrchardId> {

  List<ParentTreeOrchard> findByIdOrchardId(String orchardId);

  List<ParentTreeOrchard> findAllById_parentTreeIdIn(List<Long> parentTreeIds);
}
