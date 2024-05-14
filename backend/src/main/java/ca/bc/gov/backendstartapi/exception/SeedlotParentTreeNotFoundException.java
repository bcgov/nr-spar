package ca.bc.gov.backendstartapi.exception;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;

/** This class represents a {@link SeedlotParentTree} not found. */
public class SeedlotParentTreeNotFoundException extends NotFoundGenericException {

  public SeedlotParentTreeNotFoundException() {
    super("SeedlotParentTree");
  }
}
