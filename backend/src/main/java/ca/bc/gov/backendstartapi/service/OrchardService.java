package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.exception.NoParentTreeDataException;
import ca.bc.gov.backendstartapi.exception.NoSpuForOrchardException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.ActiveOrchardSeedPlanningUnitRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/** This class contains methods to handle Orchards requests. */
@Service
public class OrchardService {

  private ActiveOrchardSeedPlanningUnitRepository activeOrchardSeedPlanningUnitRepository;

  @Qualifier("oracleApi")
  private Provider oracleApiProvider;

  OrchardService(
      ActiveOrchardSeedPlanningUnitRepository activeOrchardSeedPlanningUnitRepository,
      Provider oracleApiProvider) {
    this.activeOrchardSeedPlanningUnitRepository = activeOrchardSeedPlanningUnitRepository;
    this.oracleApiProvider = oracleApiProvider;
  }

  /**
   * Find an active SPU ID given an Orchard ID.
   *
   * @param orchardId Orchard's identification.
   * @return An Optional of {@link ActiveOrchardSpuEntity} or an empty list.
   */
  public Optional<ActiveOrchardSpuEntity> findSpuIdByOrchard(String orchardId) {
    SparLog.info("Finding SPU id for orchard id {}", orchardId);
    return findSpuIdByOrchardWithActive(orchardId, true);
  }

  /**
   * Find all SPU IDs. It can be active or not.
   *
   * @param active determine if the SPU should be active or not.
   * @return A {@link List} of {@link ActiveOrchardSpuEntity} or an empty list.
   */
  public List<ActiveOrchardSpuEntity> findAllSpu(Boolean active) {
    String activeState = active == null ? "All" : active.toString();

    SparLog.info("Finding all orchard seed planning unit by active state {}", activeState);

    List<ActiveOrchardSpuEntity> list = new ArrayList<>();

    if (active == null) {
      list = activeOrchardSeedPlanningUnitRepository.findAll();
    } else {
      list = activeOrchardSeedPlanningUnitRepository.findAllByActive(active);
    }
    SparLog.info(
        "{} orchard seed planning unit by active state {} found", list.size(), activeState);

    return list;
  }

  /**
   * Find a SPU ID given an Orchard ID. It can be active or not.
   *
   * @param orchardId Orchard's identification.
   * @param active determine if the SPU should be active or not.
   * @return An Optional of {@link ActiveOrchardSpuEntity}.
   */
  public Optional<ActiveOrchardSpuEntity> findSpuIdByOrchardWithActive(
      String orchardId, boolean active) {
    SparLog.info("Finding SPU id for orchard id {} and active {}", orchardId, active);

    List<ActiveOrchardSpuEntity> list =
        activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, active);
    SparLog.info("{} Orchards for this spu id found.", list.size());

    if (list.size() > 1) {
      SparLog.warn(
          "More than one records found for the Active SPU x Orchard relationship for"
              + " orchard {}",
          orchardId);
    }

    return list.stream().findFirst();
  }

  /**
   * Finds all Parent Tree and Genetic Quality to an Orchard.
   *
   * @param orchardId Orchard's identification.
   * @return An {@link Optional} of {@link OrchardSpuDto}
   */
  public OrchardSpuDto findParentTreeGeneticQualityData(String orchardId) {
    SparLog.info("Fetching Parent Tree data for Orchard ID: {}", orchardId);

    Optional<ActiveOrchardSpuEntity> spuList = findSpuIdByOrchard(orchardId);
    if (spuList.isEmpty()) {
      throw new NoSpuForOrchardException();
    }

    int spuId = spuList.get().getSeedPlanningUnitId();
    SparLog.info("Found SPU Id {} for Orchard Id {}", spuId, orchardId);

    Optional<OrchardSpuDto> parentTreeDto =
        oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId);

    SparLog.info("Finished fetching Parent Tree data for Orchard ID: {}", orchardId);

    return parentTreeDto.orElseThrow(NoParentTreeDataException::new);
  }

  /**
   * Finds all orchards with the provided vegCode from Oracle API.
   *
   * @param vegCode Orchard's identification.
   * @return An {@link List} of {@link OrchardDto} from oracle-api + spuID.
   */
  public List<OrchardDto> findAllOrchardsByVegCode(String vegCode) {
    SparLog.info("Finding parent trees by veg code with code {}", vegCode);
    List<ActiveOrchardSpuEntity> spuList = findAllSpu(null);
    Map<String, Integer> orchardSpuMap = new HashMap<>();

    spuList.stream()
        .forEach(
            spuObj -> orchardSpuMap.put(spuObj.getOrchardId(), spuObj.getSeedPlanningUnitId()));

    List<OrchardDto> orchardList = oracleApiProvider.findOrchardsByVegCode(vegCode);

    orchardList.forEach(
        orchardDto -> orchardDto.setSpuId(orchardSpuMap.getOrDefault(orchardDto.getId(), null)));

    SparLog.info("{} orchards by veg code found.", orchardList.size());
    return orchardList;
  }
}
