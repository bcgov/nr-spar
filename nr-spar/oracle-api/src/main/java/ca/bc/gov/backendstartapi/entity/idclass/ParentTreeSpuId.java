package ca.bc.gov.backendstartapi.entity.idclass;

import ca.bc.gov.backendstartapi.entity.ParentTreeOrchard;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class holds the primary key columns of {@link ParentTreeOrchard}. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ParentTreeSpuId {
  @Column(name = "PARENT_TREE_ID")
  private Long parentTreeId;

  @Column(name = "SEED_PLAN_UNIT_ID")
  private Integer spuId;
}
