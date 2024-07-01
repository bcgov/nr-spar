package ca.bc.gov.oracleapi.entity;

import ca.bc.gov.oracleapi.entity.idclass.ParentTreeOrchardId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents a relation between {@link ParentTreeEntity} and {@link Orchard} in the
 * database.
 */
@Getter
@Setter
@Entity
@Table(name = "PARENT_TREE_ORCHARD")
public class ParentTreeOrchard {

  @EmbeddedId private ParentTreeOrchardId id;
}
