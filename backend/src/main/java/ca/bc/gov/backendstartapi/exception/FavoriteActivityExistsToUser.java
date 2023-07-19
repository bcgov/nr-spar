package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** This class represents a situation where an activity is already registered to a user. */
@ResponseStatus(
    value = HttpStatus.BAD_REQUEST,
    reason = "Activity already registered to this user!")
public class FavoriteActivityExistsToUser extends RuntimeException {}
