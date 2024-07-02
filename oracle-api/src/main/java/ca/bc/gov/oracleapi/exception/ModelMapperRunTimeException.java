package ca.bc.gov.oracleapi.exception;

import io.micrometer.common.lang.NonNull;

/** This exception is thrown when the model mapper encouters a runtime exception. */
public class ModelMapperRunTimeException extends RuntimeException {

  /** This exception is thrown when the model mapper encouters a runtime exception. */
  public ModelMapperRunTimeException(@NonNull String className, @NonNull String message) {
    super(
        "ModelMapper is unable to create or populate new instance of "
            + className
            + ".\nWith message: "
            + message);
  }
}
