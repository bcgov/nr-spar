package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.PurityDebrisDto;
import ca.bc.gov.oracleapi.dto.consep.PurityDebrisFormDto;
import ca.bc.gov.oracleapi.dto.consep.PurityReplicateDto;
import ca.bc.gov.oracleapi.dto.consep.PurityReplicateFormDto;
import ca.bc.gov.oracleapi.dto.consep.PurityTestDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.PurityDebrisEntity;
import ca.bc.gov.oracleapi.entity.consep.PurityReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.DebrisId;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.exception.InvalidTestActivityKeyException;
import ca.bc.gov.oracleapi.mapper.PurityDebrisMapper;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.PurityDebrisRepository;
import ca.bc.gov.oracleapi.repository.consep.PurityReplicateRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Purity Tests Service. */
@Service
@RequiredArgsConstructor
public class PurityTestService {

  private final ActivityRepository activityRepository;

  private final TestResultRepository testResultRepository;

  private final PurityReplicateRepository replicateRepository;

  private final PurityDebrisRepository debrisRepository;

  // The maximum number of replicates is 8 and the entries are sequencial,
  // so we can use a fixed list to fetch the data for the replicates.
  private final List<Integer> replicateIds =
      IntStream.rangeClosed(1, 8).boxed().collect(Collectors.toList());


  /**
   * Get information for purity tests.
   */
  public Optional<PurityTestDto> getPurityTestData(BigDecimal riaKey) {
    SparLog.info("Begin to query necessary tables for purity tests");

    Optional<ActivityEntity> activityData = activityRepository.findById(riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findById(riaKey);

    List<PurityReplicateEntity> replicates =
        replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds);

    List<PurityDebrisEntity> debris =
        debrisRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds);

    if (activityData.isEmpty() || testResultData.isEmpty()) {
      SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for given RIA_SKEY");
    }

    List<PurityReplicateDto> replicatesList = replicates.stream().map(
        (curReplicate) -> new PurityReplicateDto(
            curReplicate.getId().getRiaKey(),
            curReplicate.getId().getReplicateNumber(),
            curReplicate.getPureSeedWeight(),
            curReplicate.getOtherSeedWeight(),
            curReplicate.getInertMttrWeight(),
            curReplicate.getReplicateAccInd(),
            curReplicate.getOverrideReason()))
        .collect(Collectors.toList());

    List<PurityDebrisDto> debrisList = debris.stream().map(
        (curDebris) -> new PurityDebrisDto(
            curDebris.getId().getRiaKey(),
            curDebris.getId().getReplicateNumber(),
            curDebris.getDebrisSeqNumber(),
            curDebris.getId().getDebrisRank(),
            curDebris.getDebrisTypeCode()))
        .collect(Collectors.toList());

    PurityTestDto purityContent =
        new PurityTestDto(
            testResultData.get().getTestCompleteInd(),
            testResultData.get().getSampleDesc(),
            testResultData.get().getMoistureStatus(),
            testResultData.get().getMoisturePct(),
            testResultData.get().getAcceptResult(),
            activityData.get().getRequestId(),
            activityData.get().getSeedlotNumber(),
            activityData.get().getActivityTypeCode(),
            activityData.get().getTestCategoryCode(),
            activityData.get().getRiaComment(),
            activityData.get().getActualBeginDateTime(),
            activityData.get().getActualEndDateTime(),
            replicatesList,
            debrisList);

    SparLog.info("Purity data correctly fetched");
    return Optional.of(purityContent);
  }

  /**
   * This function updates the purity replicates, either by changing the existing ones
   * or adding new replicates requested by the user.
   *
   * @param riaKey the identifier key for all table related to test activities
   * @param replicateFormDtos an object with the values to be updated
   */
  @Transactional
  public List<PurityReplicateEntity> updateReplicateField(
      @NonNull BigDecimal riaKey,
      @NonNull List<PurityReplicateFormDto> replicateFormDtos
  ) {
    SparLog.info("Updating purity replicates with the riaKey: {}", riaKey);

    List<Integer> replicateNumbers = replicateFormDtos.stream()
        .map(PurityReplicateFormDto::replicateNumber)
        .collect(Collectors.toList());

    List<PurityReplicateEntity> existingReplicates =
        replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);

    Map<Integer, PurityReplicateEntity> replicateMap = existingReplicates.stream()
        .collect(Collectors.toMap(rep -> rep.getId().getReplicateNumber(), Function.identity()));

    List<PurityReplicateEntity> updatedReplicates = new ArrayList<>();

    for (PurityReplicateFormDto dto : replicateFormDtos) {
      int replicateNumber = dto.replicateNumber();

      PurityReplicateEntity repEntity = replicateMap.getOrDefault(
          replicateNumber, new PurityReplicateEntity());

      if (repEntity.getId() == null) {
        repEntity.setId(new ReplicateId(riaKey, replicateNumber));
        SparLog.info("Replicate number {} not found for riaKey {}. Creating new replicate.",
            replicateNumber, riaKey);
      }

      repEntity.setPureSeedWeight(dto.pureSeedWeight());;
      repEntity.setOtherSeedWeight(dto.otherSeedWeight());
      repEntity.setInertMttrWeight(dto.inertMttrWeight());
      repEntity.setReplicateAccInd(dto.replicateAccInd());
      repEntity.setOverrideReason(dto.overrideReason());

      updatedReplicates.add(repEntity);
    }

    List<PurityReplicateEntity> savedReplicates = replicateRepository.saveAll(updatedReplicates);
    SparLog.info("Updated {} purity replicates for riaKey: {}", savedReplicates.size(), riaKey);

    return savedReplicates;
  }

  /**
   * This function updates the purity debris, either by changing the existing ones
   * or adding new debris requested by the user.
   *
   * @param riaKey the identifier key for all table related to test activities
   * @param debrisFormDtos an object with the values to be updated
   */
  @Transactional
  public List<PurityDebrisDto> updateDebris(
      @NonNull BigDecimal riaKey,
      @NonNull List<PurityDebrisFormDto> debrisFormDtos
  ) {
    SparLog.info("Updating purity debris with the riaKey: {}", riaKey);

    List<PurityDebrisEntity> debrisToSave = new ArrayList<>();

    for (PurityDebrisFormDto dto : debrisFormDtos) {
      Integer replicateNumber = dto.replicateNumber();
      Integer debrisRank = dto.debrisRank();
      String newTypeCode = dto.debrisTypeCode();

      Optional<PurityDebrisEntity> optionalDebris =
          debrisRepository.findByIdRiaKeyAndIdReplicateNumberAndIdDebrisRank(
              riaKey, replicateNumber, debrisRank
          );

      if (optionalDebris.isPresent()) {
        PurityDebrisEntity debris = optionalDebris.get();
        SparLog.info("Updating debris for replicate {}, rank {}: setting type from {} to {}",
            replicateNumber, debrisRank, debris.getDebrisTypeCode(), newTypeCode);

        DebrisId newId = new DebrisId(
            riaKey,
            replicateNumber,
            debrisRank
        );

        debris.setId(newId);
        debris.setDebrisTypeCode(newTypeCode);
        debrisToSave.add(debris);

      } else {
        DebrisId newId = new DebrisId(
            riaKey,
            replicateNumber,
            debrisRank
        );

        PurityDebrisEntity newDebris = new PurityDebrisEntity();
        newDebris.setId(newId);
        newDebris.setDebrisTypeCode(newTypeCode);

        SparLog.info("Creating new debris for replicate {}, rank {}, type {}",
            replicateNumber, debrisRank, newTypeCode);

        debrisToSave.add(newDebris);
      }
    }

    List<PurityDebrisEntity> saved = debrisRepository.saveAll(debrisToSave);

    SparLog.info("Saved {} purity debris records for riaKey: {}", saved.size(), riaKey);
    return saved.stream()
        .map(PurityDebrisMapper::convertToDto)
        .collect(Collectors.toList());
  }

  /**
   * This function validates the replicates data to be submitted for purity tests.
   * Throws exception if validation fails
   *
   * @param purityReplicates a list of replicates to validate
   * @throws ResponseStatusException if any validation fails
   */
  public void validatePurityReplicateData(List<PurityReplicateDto> purityReplicates) {
    SparLog.info("Validating purity replicates data");

    for (PurityReplicateDto replicate : purityReplicates) {

      if (replicate.riaKey() == null) {
        SparLog.error("Purity test data validation failed: RIA key is missing");
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RIA key is missing");
      }

      if (replicate.replicateNumber() == null) {
        SparLog.error("Purity test data validation failed: Replicate number is missing");
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Replicate number is missing");
      }

      if (replicate.pureSeedWeight() == null
          || replicate.pureSeedWeight().compareTo(BigDecimal.ZERO) < 0
          || replicate.pureSeedWeight().compareTo(BigDecimal.valueOf(999.999)) > 0) {
        SparLog.error("Purity test data validation failed: "
            + "Pure seed weight is missing or invalid");
        throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Pure seed weight is missing or invalid");
      }

      if (replicate.otherSeedWeight() == null
          || replicate.otherSeedWeight().compareTo(BigDecimal.ZERO) < 0
          || replicate.otherSeedWeight().compareTo(BigDecimal.valueOf(999.999)) > 0) {
        SparLog.error("Purity test data validation failed: "
            + "Other seed weight is missing or invalid");
        throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Other seed weight is missing or invalid");
      }

      if (replicate.inertMttrWeight() == null
          || replicate.inertMttrWeight().compareTo(BigDecimal.ZERO) < 0
          || replicate.inertMttrWeight().compareTo(BigDecimal.valueOf(999.999)) > 0) {
        SparLog.error("Purity test data validation failed: "
            + "Container weight is missing or invalid");
        throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Container weight is missing or invalid");
      }
    }
  }

  /**
   * Deletes multiple purity replicates.
   *
   * @param riaKey           the identifier key for all table related to tests activities
   * @param replicateNumbers the replicate numbers to be deleted
   */
  @Transactional
  public void deletePurityReplicates(
      @NonNull BigDecimal riaKey,
      @NonNull List<Integer> replicateNumbers
  ) {
    SparLog.info("Deleting purity replicates with the riaKey: {} and replicateNumbers: {}",
        riaKey, replicateNumbers);

    List<PurityReplicateEntity> replicates = replicateRepository.findByRiaKeyAndReplicateNumbers(
        riaKey,
        replicateNumbers
    );

    if (replicates.isEmpty()) {
      throw new InvalidTestActivityKeyException();
    }

    replicateRepository.deleteByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);

    SparLog.info("Purity replicates with riaKey {} ", riaKey + "deleted!");
  }

  /**
   * Deletes a single purity replicate.
   *
   * @param riaKey          the identifier key for all table related to tests activities
   * @param replicateNumber the replicate number to be deleted
   */
  @Transactional
  public void deleteSinglePurityReplicate(
      @NonNull BigDecimal riaKey,
      @NonNull Integer replicateNumber
  ) {
    SparLog.info("Deleting single purity replicate with the "
        + "riaKey: {} and replicateNumber: {}", riaKey, replicateNumber);

    Optional<PurityReplicateEntity> replicates = replicateRepository.findSingleReplicate(
        riaKey,
        replicateNumber
    );

    if (replicates.isEmpty()) {
      throw new InvalidTestActivityKeyException();
    }

    replicateRepository.deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);

    SparLog.info("Purity replicate {} with riaKey {} ",
        replicateNumber, riaKey + "deleted!");
  }

  /**
   * Deletes a single debris entry given an id and rank.
   *
   * @param riaKey          the identifier key for all table related to tests activities
   * @param replicateNumber the replicate number of the debris to be deleted
   * @param debrisRank      the rank of the debris to be deleted
   */
  @Transactional
  public List<PurityDebrisDto> deletePurityDebris(
      @NonNull BigDecimal riaKey,
      @NonNull Integer replicateNumber,
      @NonNull Integer debrisRank
  ) {
    SparLog.info("Deleting single debris with the "
        + "riaKey: {}, replicateNumber: {} and rank: {}", riaKey, replicateNumber, debrisRank);

    Optional<PurityDebrisEntity> debrisToDelete =
        debrisRepository.findByIdRiaKeyAndIdReplicateNumberAndIdDebrisRank(
          riaKey,
          replicateNumber,
          debrisRank
        );

    if (debrisToDelete.isEmpty()) {
      throw new InvalidTestActivityKeyException();
    }

    debrisRepository.deleteByRank(riaKey, replicateNumber, debrisRank);
    SparLog.info("Debris {} with riaKey {} and rank {}",
        replicateNumber, riaKey, debrisRank + " deleted!");

    debrisRepository.shiftRanksDown(riaKey, replicateNumber, debrisRank);
    SparLog.info("Updated all debris below the removed rank {}", debrisRank);

    List<PurityDebrisEntity> updatedDebrisList =
        debrisRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds);

    return updatedDebrisList.stream()
        .map(PurityDebrisMapper::convertToDto)
        .collect(Collectors.toList());
  }
}
