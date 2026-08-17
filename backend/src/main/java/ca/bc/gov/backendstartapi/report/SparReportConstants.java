package ca.bc.gov.backendstartapi.report;

/** Legacy Jasper report identifiers used by SPAR. */
public final class SparReportConstants {

  /** Class B seedlot registration detail report (legacy Crystal/Jasper SPRR001). */
  public static final String SPRR001_REPORT_NAME = "SPRR001-SEEDLOT_REG_DTL.rpt";

  public static final String SPRR001_MAIN_JRXML = "SPRR001-SEEDLOT_REG_DTL.jrxml";

  public static final String SPRR001_MAIN_JASPER = "SPRR001-SEEDLOT_REG_DTL.jasper";

  /** BC logo rendered in the SPRR001 title band via {@code SUBREPORT_DIR + "spar_bc_logo.jpg"}. */
  public static final String SPRR001_LOGO_IMAGE = "spar_bc_logo.jpg";

  public static final String REPORT_CLASSPATH_DIR = "reports/SPRR001/";

  private SparReportConstants() {}
}
