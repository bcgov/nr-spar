package ca.bc.gov.backendstartapi.entity.idclass;

import ca.bc.gov.backendstartapi.entity.SmpMix;
import java.io.Serializable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/** Composite key for {@link SmpMix}. */
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class SmpMixId implements Serializable {

  @NonNull private String seedlot;

  private int parentTreeId;
}
