package ca.bc.gov.backendstartapi.report;

import java.util.List;

/** Assembled SPRR001 bands as Jasper beans (main + ownership). */
public record Sprr001ReportData(Sprr001MainRow mainRow, List<Sprr001OwnershipRow> ownershipRows) {}
