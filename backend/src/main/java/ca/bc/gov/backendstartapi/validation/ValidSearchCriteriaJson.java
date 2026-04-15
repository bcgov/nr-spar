package ca.bc.gov.backendstartapi.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Rejects null JSON nodes, missing nodes, and blank JSON text values. */
@Documented
@Constraint(validatedBy = ValidSearchCriteriaJsonValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSearchCriteriaJson {

  String message() default "criteriaJson must be non-null JSON (object or array)";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
