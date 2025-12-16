package ca.bc.gov.oracleapi.entity.consep.idclass;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

/** This class holds the primary key columns for test code related entities. */
@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class TestCodeId implements Serializable {
  @Column(name = "COLUMN_NAME", length = 18)
  private String columnName;

  @Column(name = "CODE_ARGUMENT", length = 50)
  private String codeArgument;
}