package ca.bc.gov.backendstartapi.entity.idclass;

import java.io.Serializable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/** Composite key for {@link ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth}. */
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@RequiredArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class SeedlotGeneticWorthId implements Serializable {

  @NonNull private String seedlot;

  @NonNull private String geneticWorth;
}
