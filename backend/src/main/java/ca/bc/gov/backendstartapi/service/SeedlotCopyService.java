package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.FeatureFlagConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.exception.FeatureDisabledException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.SaveSeedlotProgressRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

/** Service for copying a Class A or Class B seedlot to a new seedlot number. */
@Service
@RequiredArgsConstructor
public class SeedlotCopyService {

  private final SeedlotRepository seedlotRepository;
  private final SeedlotStatusService seedlotStatusService;
  private final SaveSeedlotProgressRepository saveProgressRepository;
  private final SeedlotGeneticWorthRepository geneticWorthRepository;
  private final SeedlotSeedPlanZoneRepository seedPlanZoneRepository;
  private final SeedlotParentTreeRepository parentTreeRepository;
  private final SeedlotParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository;
  private final SeedlotParentTreeSmpMixRepository parentTreeSmpMixRepository;
  private final SmpMixRepository smpMixRepository;
  private final SmpMixGeneticQualityRepository smpMixGeneticQualityRepository;
  private final SeedlotOrchardRepository orchardRepository;
  private final SeedlotCollectionMethodRepository collectionMethodRepository;
  private final FeatureFlagConfig featureFlagConfig;

  /**
   * Copies a source seedlot to a new auto-assigned number in the appropriate copy band:
   * Class A → 62000–62998, Class B → 52000–52998.
   *
   * <p>Matches legacy {@code copy_seedlot}: copies genetic worth, seed plan zones, and (for Class
   * A) orchards / parent trees / SMP mix. Ownership and collection geometry are intentionally
   * not copied. Collection methods are also copied for both classes (modern normalized equivalent
   * of legacy seedlot cone-method columns).
   *
   * <p>A form draft is created with {@code allStepData = {}}; the frontend detects the empty
   * payload and hydrates from normalized tables via the class-specific full-form endpoint. The
   * target starts with status PND (Pending) because child data is already populated at copy time.
   *
   * @param sourceSeedlotNumber the seedlot to copy from
   * @param userId the ID of the user performing the copy
   * @return a {@link SeedlotStatusResponseDto} with the new seedlot number and PND status
   */
  @Transactional
  public SeedlotStatusResponseDto copySeedlot(String sourceSeedlotNumber, String userId) {

    SparLog.info("Copy Seedlot started: source={}", sourceSeedlotNumber);

    Seedlot source =
        seedlotRepository
            .findById(sourceSeedlotNumber)
            .orElseThrow(SeedlotNotFoundException::new);

    boolean isClassB = isBclassSeedlot(source);

    // The copy endpoint serves both classes, so the toggle can't be enforced by
    // the @RequiresSeedlotB interceptor; the class comes from the source seedlot.
    if (isClassB && !featureFlagConfig.isSeedlotBclassEnabled()) {
      throw new FeatureDisabledException(FeatureFlagConfig.SEEDLOT_B_DISABLED_MESSAGE);
    }

    String targetNumber = resolveTargetNumber(isClassB);

    SparLog.info(
        "Copy Seedlot: source class={}, resolved target={}",
        isClassB ? "B" : "A",
        targetNumber);

    SeedlotStatusEntity pendingStatus =
        seedlotStatusService
            .findById(Constants.PENDING_SEEDLOT_STATUS)
            .orElseThrow(SeedlotStatusNotFoundException::new);

    Seedlot target = new Seedlot(targetNumber);
    applySourceFields(source, target);
    target.setAuditInformation(new AuditInformation(userId));
    applyFieldResets(source, target, pendingStatus, sourceSeedlotNumber);
    Seedlot savedTarget = seedlotRepository.save(target);

    SparLog.info("Copy Seedlot: target {} saved, copying child entities", targetNumber);

    copyChildEntities(sourceSeedlotNumber, savedTarget, userId, isClassB);

    SparLog.info("Copy Seedlot: child entities copied, creating draft for {}", targetNumber);

    createAndSaveDraft(savedTarget, userId, isClassB);

    SparLog.info("Copy Seedlot complete: {}", targetNumber);
    return new SeedlotStatusResponseDto(targetNumber, Constants.PENDING_SEEDLOT_STATUS);
  }

  private boolean isBclassSeedlot(Seedlot source) {
    if (source.getGeneticClass() == null
        || source.getGeneticClass().getGeneticClassCode() == null) {
      throw new SeedlotFormValidationException(
          "Source seedlot " + source.getId() + " has no genetic class.");
    }
    String code = source.getGeneticClass().getGeneticClassCode();
    if ("B".equals(code)) {
      return true;
    }
    if ("A".equals(code)) {
      return false;
    }
    throw new SeedlotFormValidationException(
        "Copy is only supported for genetic class A or B (found: " + code + ").");
  }

  /** Auto-assigns the next available number from the class-specific copy band. */
  private String resolveTargetNumber(boolean isClassB) {
    int min = isClassB ? Constants.CLASS_B_COPY_MIN : Constants.CLASS_A_COPY_MIN;
    int max = isClassB ? Constants.CLASS_B_COPY_MAX : Constants.CLASS_A_COPY_MAX;
    Integer maxInCopyBand = seedlotRepository.findNextSeedlotNumber(min, max);
    int next = (maxInCopyBand == null) ? min : maxInCopyBand + 1;
    if (next >= max) {
      throw new SeedlotFormValidationException(
          "Copy band exhausted: all numbers " + min + "–" + (max - 1) + " are in use.");
    }
    return String.valueOf(next);
  }

  private void applySourceFields(Seedlot source, Seedlot target) {
    // Copy all properties from source, then let the caller set the fields that must differ.
    BeanUtils.copyProperties(
        source,
        target,
        "id",
        "seedlotStatus",
        "revisionCount",
        "auditInformation",
        "numberOfContainers",
        "containerVolume",
        "totalConeVolume",
        "comment",
        "approvedUserId",
        "approvedTimestamp",
        "declarationOfTrueInformationUserId",
        "declarationOfTrueInformationTimestamp");
  }

  private void applyFieldResets(
      Seedlot source, Seedlot target, SeedlotStatusEntity newStatus, String sourceSeedlotNumber) {
    target.setSeedlotStatus(newStatus);
    target.setNumberOfContainers(BigDecimal.ONE);
    target.setContainerVolume(new BigDecimal("0.01"));
    target.setTotalConeVolume(new BigDecimal("0.01"));

    String sourceComment = source.getComment() != null ? source.getComment() : "";
    String truncated =
        sourceComment.length() > 1950 ? sourceComment.substring(0, 1950) : sourceComment;
    target.setComment("COPIED FROM LOT " + sourceSeedlotNumber + ".  " + truncated);

    target.setApprovedUserId("COPIED_LOT");
    target.setApprovedTimestamp(null);
    target.setDeclarationOfTrueInformationUserId(null);
    target.setDeclarationOfTrueInformationTimestamp(null);
  }

  private void copyChildEntities(
      String sourceNumber, Seedlot target, String userId, boolean isClassB) {
    AuditInformation audit = new AuditInformation(userId);
    copyGeneticWorth(sourceNumber, target, audit);
    copySeedPlanZones(sourceNumber, target, audit);
    copyCollectionMethods(sourceNumber, target, audit);

    // Legacy copy_seedlot deliberately does not copy owners or collection geometry.
    if (isClassB) {
      return;
    }

    copyOrchards(sourceNumber, target, audit);
    Map<Integer, SeedlotParentTree> ptMap = copyParentTrees(sourceNumber, target, audit);
    copyParentTreeGeneticQuality(sourceNumber, ptMap, audit);
    copyParentTreeSmpMix(sourceNumber, ptMap, audit);
    Map<Integer, SmpMix> smpMap = copySmpMix(sourceNumber, target, audit);
    copySmpMixGeneticQuality(sourceNumber, smpMap, audit);
  }

  private void copyGeneticWorth(String sourceNumber, Seedlot target, AuditInformation audit) {
    geneticWorthRepository.findAllBySeedlot_id(sourceNumber).forEach(source -> {
      SeedlotGeneticWorth copy = new SeedlotGeneticWorth(target, source.getGeneticWorth(), audit);
      copy.setGeneticQualityValue(source.getGeneticQualityValue());
      copy.setTestedParentTreeContributionPercentage(
          source.getTestedParentTreeContributionPercentage());
      geneticWorthRepository.save(copy);
    });
  }

  private void copySeedPlanZones(String sourceNumber, Seedlot target, AuditInformation audit) {
    seedPlanZoneRepository.findAllBySeedlot_id(sourceNumber).forEach(source -> {
      SeedlotSeedPlanZoneEntity copy =
          new SeedlotSeedPlanZoneEntity(
              target,
              source.getSpzCode(),
              source.getGeneticClass(),
              source.getIsPrimary(),
              source.getSpzDescription());
      copy.setSeedPlanZoneId(source.getSeedPlanZoneId());
      copy.setAuditInformation(audit);
      seedPlanZoneRepository.save(copy);
    });
  }

  private void copyOrchards(String sourceNumber, Seedlot target, AuditInformation audit) {
    orchardRepository.findAllBySeedlot_id(sourceNumber).forEach(source -> {
      SeedlotOrchard copy =
          new SeedlotOrchard(target, source.getIsPrimary(), source.getOrchardId());
      copy.setAuditInformation(audit);
      orchardRepository.save(copy);
    });
  }

  private void copyCollectionMethods(String sourceNumber, Seedlot target, AuditInformation audit) {
    collectionMethodRepository.findAllBySeedlot_id(sourceNumber).forEach(source -> {
      SeedlotCollectionMethod copy =
          new SeedlotCollectionMethod(target, source.getConeCollectionMethod());
      copy.setConeCollectionMethodOtherDescription(
          source.getConeCollectionMethodOtherDescription());
      copy.setAuditInformation(audit);
      collectionMethodRepository.save(copy);
    });
  }

  /**
   * Copies parent trees and returns a map from source parentTreeId to the saved target
   * {@link SeedlotParentTree}, used to wire up genetic quality and SMP mix child rows.
   */
  private Map<Integer, SeedlotParentTree> copyParentTrees(
      String sourceNumber, Seedlot target, AuditInformation audit) {
    Map<Integer, SeedlotParentTree> ptMap = new HashMap<>();
    parentTreeRepository.findAllBySeedlot_id(sourceNumber).forEach(source -> {
      SeedlotParentTree copy =
          new SeedlotParentTree(
              target,
              source.getParentTreeId(),
              source.getParentTreeNumber(),
              source.getConeCount(),
              source.getPollenCount(),
              audit);
      copy.setSmpSuccessPercentage(source.getSmpSuccessPercentage());
      copy.setNonOrchardPollenContaminationCount(source.getNonOrchardPollenContaminationCount());
      SeedlotParentTree saved = parentTreeRepository.save(copy);
      ptMap.put(source.getParentTreeId(), saved);
    });
    return ptMap;
  }

  private void copyParentTreeGeneticQuality(
      String sourceNumber, Map<Integer, SeedlotParentTree> ptMap, AuditInformation audit) {
    parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(sourceNumber)
        .forEach(source -> {
          SeedlotParentTree targetPt = ptMap.get(source.getSeedlotParentTree().getParentTreeId());
          if (targetPt == null) {
            return;
          }
          SeedlotParentTreeGeneticQuality copy =
              new SeedlotParentTreeGeneticQuality(
                  targetPt,
                  source.getGeneticTypeCode(),
                  source.getGeneticWorth(),
                  source.getGeneticQualityValue(),
                  audit);
          copy.qualityValueEstimated = source.qualityValueEstimated;
          copy.parentTreeUntested = source.parentTreeUntested;
          parentTreeGeneticQualityRepository.save(copy);
        });
  }

  private void copyParentTreeSmpMix(
      String sourceNumber, Map<Integer, SeedlotParentTree> ptMap, AuditInformation audit) {
    parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(sourceNumber)
        .forEach(source -> {
          SeedlotParentTree targetPt = ptMap.get(source.getSeedlotParentTree().getParentTreeId());
          if (targetPt == null) {
            return;
          }
          SeedlotParentTreeSmpMix copy =
              new SeedlotParentTreeSmpMix(
                  targetPt,
                  source.getGeneticTypeCode(),
                  source.getGeneticWorth(),
                  source.getGeneticQualityValue(),
                  audit);
          parentTreeSmpMixRepository.save(copy);
        });
  }

  /**
   * Copies SmpMix rows and returns a map from source parentTreeId to the saved target
   * {@link SmpMix}, used to wire up SmpMixGeneticQuality child rows.
   */
  private Map<Integer, SmpMix> copySmpMix(
      String sourceNumber, Seedlot target, AuditInformation audit) {
    Map<Integer, SmpMix> smpMap = new HashMap<>();
    smpMixRepository.findAllBySeedlot_id(sourceNumber).forEach(source -> {
      SmpMix copy =
          new SmpMix(
              target,
              source.getParentTreeId(),
              source.getParentTreeNumber(),
              source.getAmountOfMaterial(),
              source.getProportion(),
              audit,
              0);
      SmpMix saved = smpMixRepository.save(copy);
      smpMap.put(source.getParentTreeId(), saved);
    });
    return smpMap;
  }

  private void copySmpMixGeneticQuality(
      String sourceNumber, Map<Integer, SmpMix> smpMap, AuditInformation audit) {
    smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(sourceNumber)
        .forEach(source -> {
          SmpMix targetSmp = smpMap.get(source.getSmpMix().getParentTreeId());
          if (targetSmp == null) {
            return;
          }
          SmpMixGeneticQuality copy =
              new SmpMixGeneticQuality(
                  targetSmp,
                  source.getGeneticTypeCode(),
                  source.getGeneticWorth(),
                  source.getGeneticQualityValue(),
                  source.qualityValueEstimated,
                  audit,
                  0);
          smpMixGeneticQualityRepository.save(copy);
        });
  }

  /**
   * Creates a minimal draft with {@code allStepData = {}} so the frontend can hydrate from
   * normalized tables via the class-specific full-form endpoint.
   */
  private void createAndSaveDraft(Seedlot target, String userId, boolean isClassB) {
    Map<String, Object> stepStatus =
        Map.of("isComplete", false, "isCurrent", false, "isInvalid", false);
    Map<String, Object> progressStatus =
        isClassB
            ? Map.of(
                "collection", stepStatus,
                "ownership", stepStatus,
                "interim", stepStatus,
                "extraction", stepStatus)
            : Map.of(
                "collection", stepStatus,
                "ownership", stepStatus,
                "interim", stepStatus,
                "orchard", stepStatus,
                "parent", stepStatus,
                "extraction", stepStatus);

    SaveSeedlotProgressEntity draft =
        new SaveSeedlotProgressEntity(
            target, Map.of(), progressStatus, new AuditInformation(userId));

    saveProgressRepository.save(draft);
  }
}
