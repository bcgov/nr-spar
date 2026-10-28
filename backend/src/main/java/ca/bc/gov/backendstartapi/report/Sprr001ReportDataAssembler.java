package ca.bc.gov.backendstartapi.report;

import static ca.bc.gov.backendstartapi.report.ReportFormats.date;
import static ca.bc.gov.backendstartapi.report.ReportFormats.decimal;
import static ca.bc.gov.backendstartapi.report.ReportFormats.dmsComponent;
import static ca.bc.gov.backendstartapi.report.ReportFormats.latitudeDesc;
import static ca.bc.gov.backendstartapi.report.ReportFormats.longitudeDesc;
import static ca.bc.gov.backendstartapi.report.ReportFormats.numberTreesFromDesc;
import static ca.bc.gov.backendstartapi.report.ReportFormats.text;
import static ca.bc.gov.backendstartapi.report.ReportFormats.yesNo;

import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.dto.SeedlotBclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCollectionGeometryDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDtoClassB;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.service.ForestClientService;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * Assembles SPRR001 Jasper beans from Postgres form data enriched with the Forest Client API and
 * live oracle-api code descriptions, replacing the legacy Oracle {@code SPR001P} /
 * {@code SPR001P_OWNERSHIP} cursors.
 */
@Service
@RequiredArgsConstructor
public class Sprr001ReportDataAssembler {

  private static final String COPIED_LOT_SENTINEL = "COPIED_LOT";
  private static final String DB_NAME = "spar";

  private final SeedlotService seedlotService;
  private final ForestClientService forestClientService;
  private final MethodOfPaymentRepository methodOfPaymentRepository;
  private final SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;
  private final Sprr001OwnershipRowMapper ownershipRowMapper;

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;

  /**
   * Builds the SPRR001 main and ownership beans for one seedlot.
   *
   * @param seedlot the seedlot to print
   * @return filled Jasper beans for the main report and ownership subreport
   */
  public Sprr001ReportData assemble(Seedlot seedlot) {
    SeedlotBclassFormDto form = seedlotService.buildBclassFormData(seedlot);
    ReportClientResolver clients = new ReportClientResolver(forestClientService);
    ReportOracleCodeResolver codes = new ReportOracleCodeResolver(oracleApiProvider);
    SeedlotFormCollectionDtoClassB collection = form.collectionStep();

    Sprr001MainRow row = new Sprr001MainRow();
    putSeedlotSummary(row, seedlot, collection, codes);
    putApplicant(row, seedlot, clients);
    putGeneticWorth(row, form.geneticWorthTraits());
    putCollection(row, seedlot.getId(), collection, clients, codes);
    putCollectionSite(row, collection, form.collectionGeometry(), form.aouSpzList());
    putAreaOfUse(row, seedlot, collection, form.aouSpzList());
    putInterimStorage(row, form.interimStep(), clients);
    putExtractionAndStorage(row, form.extractionStep(), clients);
    putRegistrationAudit(row, seedlot);

    return new Sprr001ReportData(row, assembleOwnership(form.ownershipStep(), clients, codes));
  }

  private static void putSeedlotSummary(
      Sprr001MainRow row,
      Seedlot seedlot,
      SeedlotFormCollectionDtoClassB collection,
      ReportOracleCodeResolver codes) {
    row.setDbName(DB_NAME);
    row.setSeedlotNumber(seedlot.getId());
    row.setToBeRegistrdInd(yesNo(seedlot.getIntendedForCrownLand()));
    row.setBcSource(yesNo(seedlot.getSourceInBc()));
    row.setSuperiorPrvncInd(yesNo(collection.superiorProvenanceInd()));
    row.setEffectivePopSize(seedlot.getEffectivePopulationSize());
    row.setSpecies(seedlot.getVegetationCode());
    row.setSpeciesDesc(codes.speciesDesc(seedlot.getVegetationCode()));

    if (seedlot.getSeedlotStatus() != null) {
      row.setStatus(seedlot.getSeedlotStatus().getSeedlotStatusCode());
      row.setStatusDesc(seedlot.getSeedlotStatus().getDescription());
    }
    if (seedlot.getGeneticClass() != null) {
      row.setGeneticClass(seedlot.getGeneticClass().getGeneticClassCode());
    }
    if (seedlot.getSeedlotSource() != null) {
      row.setSeedlotSourceCode(seedlot.getSeedlotSource().getSeedlotSourceCode());
      row.setSeedlotSource(seedlot.getSeedlotSource().getDescription());
    }
  }

  private static void putApplicant(
      Sprr001MainRow row, Seedlot seedlot, ReportClientResolver clients) {
    ClientDisplay applicant =
        clients.resolve(seedlot.getApplicantClientNumber(), seedlot.getApplicantLocationCode());

    row.setClientAcronym(applicant.acronym());
    row.setClientName(applicant.name());
    row.setApplicantsAddress(applicant.address());
    row.setApplicantClientNumber(seedlot.getApplicantClientNumber());
    row.setApplicantClientLocn(seedlot.getApplicantLocationCode());
    row.setApplicantEmailAddress(seedlot.getApplicantEmailAddress());
  }

  private static void putGeneticWorth(Sprr001MainRow row, List<GeneticWorthTraitsDto> traits) {
    Map<String, String> valuesByTrait = new HashMap<>();
    for (GeneticWorthTraitsDto trait : traits) {
      if (trait.traitCode() == null || trait.traitValue() == null) {
        continue;
      }
      valuesByTrait.putIfAbsent(
          trait.traitCode().toUpperCase(Locale.ROOT), trait.traitValue().toPlainString());
    }
    row.setGwAd(valuesByTrait.get("AD"));
    row.setGwDfs(valuesByTrait.get("DFS"));
    row.setGwDfu(valuesByTrait.get("DFU"));
    row.setGwDfw(valuesByTrait.get("DFW"));
    row.setGwDsb(valuesByTrait.get("DSB"));
    row.setGwDsc(valuesByTrait.get("DSC"));
    row.setGwDsg(valuesByTrait.get("DSG"));
    row.setGwGvo(valuesByTrait.get("GVO"));
    row.setGwIws(valuesByTrait.get("IWS"));
    row.setGwWdu(valuesByTrait.get("WDU"));
    row.setGwWve(valuesByTrait.get("WVE"));
    row.setGwWwd(valuesByTrait.get("WWD"));
  }

  private void putCollection(
      Sprr001MainRow row,
      String seedlotNumber,
      SeedlotFormCollectionDtoClassB collection,
      ReportClientResolver clients,
      ReportOracleCodeResolver codes) {
    ClientDisplay collector =
        clients.resolve(collection.collectionClientNumber(), collection.collectionLocnCode());
    Integer orgUnit = collection.orgUnitNo();

    row.setCollectionOrgUnit(decimal(orgUnit));
    row.setCollectionOrgUnitDesc(codes.orgUnitDesc(orgUnit));
    row.setCollectionLocnDesc(collection.collectionLocationDesc());
    row.setCollectionProv(stringify(collection.provenanceId()));
    row.setCfsAppendix(yesNo(collection.collectionStandardMetInd()));
    row.setCollectionStartDate(date(collection.collectionStartDate()));
    row.setCollectionEndDate(date(collection.collectionEndDate()));
    row.setNoOfContainers(collection.noOfContainers());
    row.setVolPerContainer(collection.volPerContainer());
    row.setClctnVolume(collection.clctnVolume());
    row.setOrchardComment(collection.seedlotComment());
    row.setNmbrTreesFromCode(collection.numberTreesFromCode());
    row.setNmbrTreesFromDesc(numberTreesFromDesc(collection.numberTreesFromCode()));
    row.setCollectionCliNumber(collection.collectionClientNumber());
    row.setCollectionCliLocnCd(collection.collectionLocnCode());
    row.setCollectionClientAcronym(collector.acronym());
    row.setCollectionClientName(collector.name());
    row.setCollectorAddress(collector.address());

    putConeCollectionMethods(row, seedlotNumber);
  }

  private void putConeCollectionMethods(Sprr001MainRow row, String seedlotNumber) {
    List<SeedlotCollectionMethod> methods =
        seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlotNumber).stream()
            .sorted(
                Comparator.comparing(
                    method -> method.getConeCollectionMethod().getConeCollectionMethodCode()))
            .toList();

    ConeCollectionMethodEntity first = coneMethodAt(methods, 0);
    ConeCollectionMethodEntity second = coneMethodAt(methods, 1);

    row.setConeCollectionMethodDesc(first == null ? null : first.getDescription());
    row.setConeCollectionMethod2Code(
        second == null ? null : String.valueOf(second.getConeCollectionMethodCode()));
    row.setConeCollectionMethodDesc2(second == null ? null : second.getDescription());
  }

  private static void putCollectionSite(
      Sprr001MainRow row,
      SeedlotFormCollectionDtoClassB collection,
      SeedlotCollectionGeometryDto geometry,
      List<SeedPlanZoneDto> aouSpzList) {
    Integer latDeg = collection.collectionLatitudeDeg();
    Integer longDeg = collection.collectionLongitudeDeg();

    row.setRadiusOfCollectionArea(collection.collectionAreaRadius());
    row.setCollectionElevation(decimal(collection.collectionElevation()));
    row.setCollectionElevationMin(decimal(collection.collectionElevationMin()));
    row.setCollectionElevationMax(decimal(collection.collectionElevationMax()));
    row.setCollectionLatDeg(decimal(latDeg));
    row.setCollectionLatMin(dmsComponent(collection.collectionLatitudeMin(), latDeg));
    row.setCollectionLatSec(dmsComponent(collection.collectionLatitudeSec(), latDeg));
    row.setCollectionLatCode(text(collection.collectionLatitudeCode()));
    row.setCollectionLatDesc(latitudeDesc(collection.collectionLatitudeCode()));
    row.setCollectionLongDeg(decimal(longDeg));
    row.setCollectionLongMin(dmsComponent(collection.collectionLongitudeMin(), longDeg));
    row.setCollectionLongSec(dmsComponent(collection.collectionLongitudeSec(), longDeg));
    row.setCollectionLongCode(text(collection.collectionLongitudeCode()));
    row.setCollectionLongDesc(longitudeDesc(collection.collectionLongitudeCode()));
    row.setCaptureMethod(collection.captureMethodCode());
    row.setSpzOfCollectionArea(collection.seedPlanZoneCode());
    row.setSpzOfCollectionAreaDesc(collectionSpzDesc(collection, aouSpzList));
    row.setOverrideCnt(overrideCount(collection.becOverrideInd()));
    row.setGeoArea(geoArea(geometry));
    row.setBgcZoneCode(collection.bgcZoneCode());
    row.setBgcSubzoneCode(collection.bgcSubzoneCode());
    row.setVariant(text(collection.variant()));
    row.setCollectionBgcInd(yesNo(collection.collectionBgcValidatedInd()));
    row.setCollectionSpzInd(yesNo(collection.collectionSeedPlanZoneInd()));
  }

  private static void putAreaOfUse(
      Sprr001MainRow row,
      Seedlot seedlot,
      SeedlotFormCollectionDtoClassB collection,
      List<SeedPlanZoneDto> aouSpzList) {
    Integer latDegMin = collection.latitudeDegMin();
    Integer latDegMax = collection.latitudeDegMax();
    Integer longDegMin = collection.longitudeDegMin();
    Integer longDegMax = collection.longitudeDegMax();
    String spzCodes = joinSpzCodes(aouSpzList);

    // The seedlot elevation only prints once an area-of-use range has been entered.
    row.setElevation(decimal(collection.elevationMin() == null ? null : seedlot.getElevation()));
    row.setMinElevation(decimal(collection.elevationMin()));
    row.setMaxElevation(decimal(collection.elevationMax()));
    row.setSpz(spzCodes.isBlank() ? collection.seedPlanZoneCode() : spzCodes);
    row.setMinLatitudeDeg(decimal(latDegMin));
    row.setMinLatitudeMinutes(dmsComponent(collection.latitudeMinMin(), latDegMin));
    row.setMinLatitudeSec(dmsComponent(collection.latitudeSecMin(), latDegMin));
    row.setMaxLatitudeDeg(decimal(latDegMax));
    row.setMaxLatitudeMin(dmsComponent(collection.latitudeMinMax(), latDegMax));
    row.setMaxLatitudeSec(dmsComponent(collection.latitudeSecMax(), latDegMax));
    row.setMinLongitudeDeg(decimal(longDegMin));
    row.setMinLongitudeMinutes(dmsComponent(collection.longitudeMinMin(), longDegMin));
    row.setMinLongitudeSec(dmsComponent(collection.longitudeSecMin(), longDegMin));
    row.setMaxLongitudeDeg(decimal(longDegMax));
    row.setMaxLongitudeMin(dmsComponent(collection.longitudeMinMax(), longDegMax));
    row.setMaxLongitudeSec(dmsComponent(collection.longitudeSecMax(), longDegMax));
    row.setOwnershipComment(collection.areaOfUseComment());
  }

  private static void putInterimStorage(
      Sprr001MainRow row, SeedlotFormInterimDto interim, ReportClientResolver clients) {
    ClientDisplay agency =
        clients.resolve(interim.intermStrgClientNumber(), interim.intermStrgLocnCode());

    row.setInterimAgencyAcronym(agency.acronym());
    row.setInterimAgencyName(agency.name());
    row.setIntermAgenctNumber(interim.intermStrgClientNumber());
    row.setIntermAgenctLocn(interim.intermStrgLocnCode());
    row.setStorageLocation(interim.intermOtherFacilityDesc());
    row.setIntermStrgStDate(date(interim.intermStrgStDate()));
    row.setIntermStrgEndDate(date(interim.intermStrgEndDate()));
    row.setIntermFacilityCode(interim.intermFacilityCode());
    row.setStorageFacilityType(interim.intermFacilityCode());
  }

  private static void putExtractionAndStorage(
      Sprr001MainRow row, SeedlotFormExtractionDto extraction, ReportClientResolver clients) {
    ClientDisplay extractor =
        clients.resolve(extraction.extractoryClientNumber(), extraction.extractoryLocnCode());
    ClientDisplay seedStore =
        clients.resolve(extraction.storageClientNumber(), extraction.storageLocnCode());

    row.setExtractoryAgencyAcronym(extractor.acronym());
    row.setExtractoryAgencyName(extractor.name());
    row.setExtrctCliNumber(extraction.extractoryClientNumber());
    row.setExtrctCliLocnCd(extraction.extractoryLocnCode());
    row.setExtractionStDate(date(extraction.extractionStDate()));
    row.setExtractionEndDate(date(extraction.extractionEndDate()));
    row.setSeedAgencyAcronym(seedStore.acronym());
    row.setSeedAgencyClientName(seedStore.name());
    row.setSeedStoreClientNumber(extraction.storageClientNumber());
    row.setSeedStoreClientLocn(extraction.storageLocnCode());
    row.setTemporaryStorageStartDate(date(extraction.temporaryStrgStartDate()));
    row.setTemporaryStorageEndDate(date(extraction.temporaryStrgEndDate()));
  }

  private static void putRegistrationAudit(Sprr001MainRow row, Seedlot seedlot) {
    AuditInformation audit = seedlot.getAuditInformation();
    LocalDateTime declaredAt = seedlot.getDeclarationOfTrueInformationTimestamp();

    row.setCreatedByUser(audit == null ? null : audit.getEntryUserId());
    row.setCreatedDate(date(audit == null ? null : audit.getEntryTimestamp()));
    row.setLastUpdatedByUser(audit == null ? null : audit.getUpdateUserId());
    row.setLastUpdatedDate(date(audit == null ? null : audit.getUpdateTimestamp()));
    row.setSubmittedByUser(submittedBy(seedlot));
    row.setSubmittedByDate(
        date(Optional.ofNullable(seedlot.getApprovedTimestamp()).orElse(declaredAt)));
    row.setDeclaration(declaredAt == null ? null : Timestamp.valueOf(declaredAt));
  }

  private List<Sprr001OwnershipRow> assembleOwnership(
      List<SeedlotFormOwnershipDto> owners,
      ReportClientResolver clients,
      ReportOracleCodeResolver codes) {
    if (owners.isEmpty()) {
      return List.of();
    }

    Map<String, String> paymentDescriptions = loadPaymentDescriptions(owners);
    List<Sprr001OwnershipRow> rows = new ArrayList<>(owners.size());
    for (SeedlotFormOwnershipDto owner : owners) {
      ClientDisplay client = clients.resolve(owner.ownerClientNumber(), owner.ownerLocnCode());
      rows.add(
          ownershipRowMapper.toRow(
              owner,
              client,
              paymentDescriptions.get(owner.methodOfPaymentCode()),
              codes.fundingDesc(owner.sparFundSrceCode())));
    }
    return rows;
  }

  private Map<String, String> loadPaymentDescriptions(List<SeedlotFormOwnershipDto> owners) {
    List<String> codes =
        owners.stream()
            .map(SeedlotFormOwnershipDto::methodOfPaymentCode)
            .filter(Objects::nonNull)
            .distinct()
            .toList();
    if (codes.isEmpty()) {
      return new HashMap<>();
    }
    return methodOfPaymentRepository.findAllByMethodOfPaymentCodeIn(codes).stream()
        .filter(method -> method.getDescription() != null)
        .collect(
            Collectors.toMap(
                MethodOfPaymentEntity::getMethodOfPaymentCode,
                MethodOfPaymentEntity::getDescription,
                (first, duplicate) -> first));
  }

  private static ConeCollectionMethodEntity coneMethodAt(
      List<SeedlotCollectionMethod> methods, int index) {
    return index < methods.size() ? methods.get(index).getConeCollectionMethod() : null;
  }

  private static String collectionSpzDesc(
      SeedlotFormCollectionDtoClassB collection, List<SeedPlanZoneDto> aouSpzList) {
    return aouSpzList.stream()
        .filter(spz -> Objects.equals(spz.getCode(), collection.seedPlanZoneCode()))
        .map(SeedPlanZoneDto::getDescription)
        .filter(Objects::nonNull)
        .findFirst()
        .orElse(collection.seedPlanZoneCode());
  }

  private static String joinSpzCodes(List<SeedPlanZoneDto> aouSpzList) {
    return aouSpzList.stream()
        .map(SeedPlanZoneDto::getCode)
        .filter(Objects::nonNull)
        .sorted()
        .collect(Collectors.joining(", "));
  }

  private static BigDecimal overrideCount(Boolean becOverrideInd) {
    return Boolean.TRUE.equals(becOverrideInd) ? BigDecimal.ONE : BigDecimal.ZERO;
  }

  private static String geoArea(SeedlotCollectionGeometryDto geometry) {
    if (geometry == null || geometry.featureArea() == null) {
      return null;
    }
    return geometry.featureArea().toPlainString();
  }

  private static String submittedBy(Seedlot seedlot) {
    return Optional.ofNullable(seedlot.getApprovedUserId())
        .filter(userId -> !COPIED_LOT_SENTINEL.equalsIgnoreCase(userId))
        .orElse(seedlot.getDeclarationOfTrueInformationUserId());
  }

  private static String stringify(Integer value) {
    return value == null ? null : value.toString();
  }
}
