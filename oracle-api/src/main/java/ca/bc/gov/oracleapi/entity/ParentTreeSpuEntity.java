package ca.bc.gov.oracleapi.entity;

import ca.bc.gov.oracleapi.entity.idclass.ParentTreeSpuId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** This class represents a ParentTree-SPU relation object in the database. */
@Getter
@Setter
@Entity
@Table(name = "PARENT_TREE_SEED_PLAN_UNIT")
public class ParentTreeSpuEntity {

  @EmbeddedId private ParentTreeSpuId id;
}
