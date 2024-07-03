package ca.bc.gov.oracleapi.vo;

import ca.bc.gov.oracleapi.response.BaseResponse;

/** This class represents a check object. */
public record CheckVo(String message, String release) implements BaseResponse {}
