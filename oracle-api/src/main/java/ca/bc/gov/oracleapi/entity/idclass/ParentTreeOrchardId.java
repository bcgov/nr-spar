package ca.bc.gov.oracleapi.entity.idclass;

import ca.bc.gov.oracleapi.entity.ParentTreeOrchard;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class holds the primary key columns of {@link ParentTreeOrchard}. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class ParentTreeOrchardId {

  private Long parentTreeId;
  private String orchardId;
}
