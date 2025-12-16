package ca.bc.gov.oracleapi.entity.consep.idclass;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class holds the primary key columns for test code related entities. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class TestCodeSubsetId implements Serializable {

  @Column(name = "CODE_SUBSET_NAME", length = 18)
  private String codeSubsetName;

  @Column(name = "COLUMN_NAME", length = 18)
  private String columnName;

  @Column(name = "CODE_ARGUMENT", length = 50)
  private String codeArgument;
}
