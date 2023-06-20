package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSeedPlanningUnit;
import ca.bc.gov.backendstartapi.exception.NoParentTreeDataException;
import ca.bc.gov.backendstartapi.exception.NoSpuForOrchardException;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import ca.bc.gov.backendstartapi.repository.ActiveOrchardSeedPlanningUnitRepository;
import java.util.List;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** This class contains methods to handle Orchards requests. */
@Service
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class OrchardService {

  private ActiveOrchardSeedPlanningUnitRepository activeOrchardSeedPlanningUnitRepository;

  private OracleApiProvider oracleApiProvider;

  @Autowired
  OrchardService(
      ActiveOrchardSeedPlanningUnitRepository activeOrchardSeedPlanningUnitRepository,
      OracleApiProvider oracleApiProvider) {
    this.activeOrchardSeedPlanningUnitRepository = activeOrchardSeedPlanningUnitRepository;
    this.oracleApiProvider = oracleApiProvider;
  }

  /**
   * Find an active SPU ID given an Orchard ID.
   *
   * @param orchardId Orchard's identification.
   * @return A {@link List} of {@link ActiveOrchardSeedPlanningUnit} or an empty list.
   */
  public List<ActiveOrchardSeedPlanningUnit> findSpuIdByOrchard(String orchardId) {
    return findSpuIdByOrchard(orchardId, true);
  }

  /**
   * Find a SPU ID given an Orchard ID. It can be active or not.
   *
   * @param orchardId Orchard's identification.
   * @param active determine if the SPU should be active or not.
   * @return A {@link List} of {@link ActiveOrchardSeedPlanningUnit} or an empty list.
   */
  public List<ActiveOrchardSeedPlanningUnit> findSpuIdByOrchard(String orchardId, boolean active) {
    return activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, active);
  }

  /**
   * Finds all Parent Tree and Genetic Quality to an Orchard.
   *
   * @param orchardId Orchard's identification.
   * @return An {@link Optional} of {@link OrchardParentTreeDto}
   */
  public OrchardParentTreeDto findParentTreeGeneticQualityData(String orchardId) {
    log.info("Fetching Parent Tree data for Orchard ID: {}", orchardId);

    List<ActiveOrchardSeedPlanningUnit> spuList = findSpuIdByOrchard(orchardId);
    if (spuList.isEmpty()) {
      throw new NoSpuForOrchardException();
    }

    int spuId = spuList.get(0).getSeedPlanningUnitId();
    log.info("Found SPU Id {} for Orchard Id {}", spuId, orchardId);

    log.info("Fetching Parent Tree and Genetic Quality from Oracle API Provider...");
    Optional<OrchardParentTreeDto> parentTreeDto =
        oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId);

    log.info("Finished fetching Parent Tree and Genetic Quality from Oracle API Provider!");

    return parentTreeDto.orElseThrow(NoParentTreeDataException::new);
  }
}
