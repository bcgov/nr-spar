package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;

/** This record represents each parent tree id to fetch lat long data. */
public record GeospatialRequestDto(Long parentTreeId, BigDecimal proportion) {}
