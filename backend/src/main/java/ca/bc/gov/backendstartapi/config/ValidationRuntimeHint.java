package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.validation.ValidSearchCriteriaJsonValidator;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

/**
 * Registers reflection hints for custom {@link jakarta.validation.ConstraintValidator}
 * implementations.
 *
 * <p>Hibernate Validator instantiates constraint validators reflectively through their no-arg
 * constructor. In a GraalVM native image that constructor is removed unless explicitly registered,
 * which otherwise surfaces at runtime as "No default constructor found".
 */
public class ValidationRuntimeHint implements RuntimeHintsRegistrar {

  @Override
  public void registerHints(@NonNull RuntimeHints hints, @Nullable ClassLoader classLoader) {
    hints
        .reflection()
        .registerType(
            ValidSearchCriteriaJsonValidator.class,
            MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
            MemberCategory.INVOKE_DECLARED_CONSTRUCTORS);
  }
}
