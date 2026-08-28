package ca.bc.gov.backendstartapi.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks an endpoint as part of the B-class seedlot feature. Requests to it are rejected with a 403
 * while {@code features.seedlot-b.enabled} is false.
 * Only usable on endpoints that serve B-class exclusively. Endpoints shared with A-class need a
 * payload-level check instead, since the class is only known once the body is read.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresSeedlotB {}
