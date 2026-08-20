package ca.bc.gov.backendstartapi.report;

import java.math.BigDecimal;
import lombok.Data;

/** Jasper bean for the SPRR001 ownership subreport band. */
@Data
public class Sprr001OwnershipRow {
  private String clientNumber;
  private String clientAcronym;
  private String clientLocnCode;
  private String clientName;
  private BigDecimal ownerPortionPct;
  private BigDecimal reservedPct;
  private BigDecimal surplusPct;
  private String fundingSource;
  private String sparFundSrceDesc;
  private String methodOfPaymentCode;
  private String methodOfPaymentDesc;
}
