package ca.bc.gov.backendstartapi.report.html;

import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import ca.bc.gov.backendstartapi.report.Sprr001OwnershipRow;
import ca.bc.gov.backendstartapi.report.Sprr001ReportData;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

/** Realistic Class B SPRR001 data for template and model tests. */
final class Sprr001HtmlSamples {

  private Sprr001HtmlSamples() {}

  static Sprr001ReportData classB() {
    Sprr001MainRow r = new Sprr001MainRow();
    r.setDbName("SPAR TEST");
    r.setSeedlotNumber("63001");
    r.setToBeRegistrdInd("Y");
    r.setStatusDesc("Submitted");
    r.setSpeciesDesc("FDC - Coastal Douglas-fir");
    r.setGeneticClass("B");
    r.setSuperiorPrvncInd("N");
    r.setBcSource("Y");
    r.setClientAcronym("WFP");
    r.setApplicantClientLocn("00");
    r.setClientName("WESTERN FOREST PRODUCTS INC.");
    r.setApplicantsAddress("118-1334 Island Hwy, Campbell River BC");
    r.setApplicantEmailAddress("seed@example.com");
    r.setCollectionOrgUnitDesc("DCR - Campbell River Natural Resource District");
    r.setCollectionLocnDesc("Upper Quinsam Lake, east slope");
    r.setCollectionProv("BC");
    r.setCfsAppendix("Y");
    r.setGwAd("12");
    r.setGwDfs("3");
    r.setCollectionLatDeg(new BigDecimal("49"));
    r.setCollectionLatMin(new BigDecimal("5"));
    r.setCollectionLatSec(new BigDecimal("7"));
    r.setCollectionLongDeg(new BigDecimal("125"));
    r.setCollectionLongMin(new BigDecimal("30"));
    r.setCollectionLongSec(new BigDecimal("0"));
    r.setCollectionElevation(new BigDecimal("450"));
    r.setCollectionElevationMin(new BigDecimal("300"));
    r.setCollectionElevationMax(new BigDecimal("600"));
    r.setRadiusOfCollectionArea(new BigDecimal("2.5"));
    r.setCaptureMethod("GPS");
    r.setSpzOfCollectionAreaDesc("M - Maritime");
    r.setGeoArea("Vancouver Island");
    r.setCollectionSpzInd("Y");
    r.setBgcZoneCode("CWH");
    r.setBgcSubzoneCode("xm");
    r.setVariant("2");
    r.setCollectionBgcInd("Y");
    r.setConeCollectionMethodDesc("Climbing");
    r.setCollectionStartDate("2026-09-01");
    r.setCollectionEndDate("2026-09-15");
    r.setNoOfContainers(new BigDecimal("12"));
    r.setVolPerContainer(new BigDecimal("1.5"));
    r.setClctnVolume(new BigDecimal("18"));
    r.setOrchardComment("Cones collected from 40 trees across the stand.");
    r.setCollectionClientAcronym("WFP");
    r.setCollectionCliLocnCd("00");
    r.setCollectionClientName("WESTERN FOREST PRODUCTS INC.");
    r.setCollectorAddress("Campbell River BC");
    r.setSpz("M - Maritime");
    r.setMinElevation(new BigDecimal("0"));
    r.setMaxElevation(new BigDecimal("800"));
    r.setMinLatitudeDeg(new BigDecimal("48"));
    r.setMinLatitudeMinutes(new BigDecimal("18"));
    r.setMinLatitudeSec(new BigDecimal("0"));
    r.setMaxLatitudeDeg(new BigDecimal("50"));
    r.setMaxLatitudeMin(new BigDecimal("45"));
    r.setMaxLatitudeSec(new BigDecimal("0"));
    r.setMinLongitudeDeg(new BigDecimal("123"));
    r.setMinLongitudeMinutes(new BigDecimal("15"));
    r.setMinLongitudeSec(new BigDecimal("0"));
    r.setMaxLongitudeDeg(new BigDecimal("128"));
    r.setMaxLongitudeMin(new BigDecimal("30"));
    r.setMaxLongitudeSec(new BigDecimal("0"));
    r.setOwnershipComment("Area of use per SPZ transfer limits.");
    r.setExtractoryAgencyAcronym("TSC");
    r.setExtrctCliLocnCd("00");
    r.setExtractoryAgencyName("TREE SEED CENTRE");
    r.setExtractionStDate("2026-10-01");
    r.setExtractionEndDate("2026-10-05");
    r.setSeedAgencyAcronym("TSC");
    r.setSeedStoreClientLocn("00");
    r.setSeedAgencyClientName("TREE SEED CENTRE");
    r.setTemporaryStorageStartDate("2026-10-06");
    r.setTemporaryStorageEndDate("2026-12-31");
    r.setCreatedByUser("IDIR\\JSMITH");
    r.setCreatedDate("2026-09-20");
    r.setLastUpdatedByUser("IDIR\\JSMITH");
    r.setLastUpdatedDate("2026-10-02");
    r.setSubmittedByUser("IDIR\\JSMITH");
    r.setSubmittedByDate("2026-10-02");
    r.setDeclaration(Timestamp.valueOf("2026-10-02 10:00:00"));

    Sprr001OwnershipRow owner = new Sprr001OwnershipRow();
    owner.setClientAcronym("WFP");
    owner.setClientLocnCode("00");
    owner.setOwnerPortionPct(new BigDecimal("100"));
    owner.setReservedPct(new BigDecimal("100"));
    owner.setSurplusPct(new BigDecimal("0"));
    owner.setFundingSource("ITC");
    owner.setSparFundSrceDesc("Industry Tree Coverage");
    owner.setMethodOfPaymentCode("ITC");
    owner.setMethodOfPaymentDesc("Invoice to Client Address");

    return new Sprr001ReportData(r, List.of(owner));
  }
}
