package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanUnitDto;
import ca.bc.gov.backendstartapi.entity.Orchard;
import ca.bc.gov.backendstartapi.entity.OrchardLotTypeCode;
import ca.bc.gov.backendstartapi.entity.ParentTree;
import ca.bc.gov.backendstartapi.entity.ParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.ParentTreeOrchard;
import ca.bc.gov.backendstartapi.entity.ParentTreeSpuEntity;
import ca.bc.gov.backendstartapi.entity.VegetationCode;
import ca.bc.gov.backendstartapi.repository.OrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeOrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeSpuRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains methods to handle orchards. */
@Service
@Slf4j
public class OrchardService {

  private OrchardRepository orchardRepository;

  private ParentTreeOrchardRepository parentTreeOrchardRepository;

  private ParentTreeRepository parentTreeRepository;

  private ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository;

  private ParentTreeSpuRepository parentTreeSpuRepository;

  OrchardService(
      OrchardRepository orchardRepository,
      ParentTreeOrchardRepository parentTreeOrchardRepository,
      ParentTreeRepository parentTreeRepository,
      ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository,
      ParentTreeSpuRepository parentTreeSpuRepository) {
    this.orchardRepository = orchardRepository;
    this.parentTreeOrchardRepository = parentTreeOrchardRepository;
    this.parentTreeRepository = parentTreeRepository;
    this.parentTreeGeneticQualityRepository = parentTreeGeneticQualityRepository;
    this.parentTreeSpuRepository = parentTreeSpuRepository;
  }

  /**
   * Find a not retired {@link Orchard} with a valid {@link OrchardLotTypeCode} by Orchard's ID.
   *
   * @param id The Orchard's identification
   * @return Optional of {@link OrchardLotTypeDescriptionDto}
   */
  public Optional<OrchardLotTypeDescriptionDto> findNotRetiredOrchardValidLotType(String id) {
    log.info("Find valid not retired Orchard by id: {}", id);
    Optional<Orchard> orchard = orchardRepository.findNotRetiredById(id);

    if (orchard.isPresent()) {
      OrchardLotTypeCode orchardLotTypeCode = orchard.get().getOrchardLotTypeCode();
      if (Objects.isNull(orchardLotTypeCode) || !orchardLotTypeCode.isValid()) {
        log.info("Orchard lot type is not valid!");
        return Optional.empty();
      }

      OrchardLotTypeDescriptionDto descriptionDto =
          new OrchardLotTypeDescriptionDto(
              orchard.get().getId(),
              orchard.get().getName(),
              orchard.get().getVegetationCode(),
              orchardLotTypeCode.getCode(),
              orchardLotTypeCode.getDescription(),
              orchard.get().getStageCode());
      return Optional.of(descriptionDto);
    }

    return Optional.empty();
  }

  /**
   * Finds an Orchard parent tree contribution data given an orchard id and an SPU ID.
   *
   * @param orchardId {@link Orchard} identification
   * @param spuId SPU identification
   * @return Optional of {@link OrchardParentTreeDto}
   */
  public Optional<OrchardParentTreeDto> findParentTreeGeneticQualityData(
      String orchardId, Long spuId) {

    long starting = Instant.now().toEpochMilli();
    Optional<Orchard> orchard = orchardRepository.findById(orchardId);
    long endingOne = Instant.now().toEpochMilli();
    log.info("Time elapsed querying orchard by id: {}", endingOne - starting);

    if (orchard.isEmpty()) {
      return Optional.empty();
    }

    // Orchard
    OrchardParentTreeDto orchardParentTreeDto = new OrchardParentTreeDto();
    orchardParentTreeDto.setOrchardId(orchard.get().getId());
    orchardParentTreeDto.setVegetationCode(orchard.get().getVegetationCode());
    orchardParentTreeDto.setSeedPlanningUnitId(spuId);

    long endingTwo = Instant.now().toEpochMilli();
    log.info("Time elapsed creating basic OrchardParentTreeDto: {}", endingTwo - endingOne);

    // Orchard x Parent Tree
    orchardParentTreeDto.setParentTrees(findAllParentTree(orchard.get().getId(), spuId, endingTwo));

    long ending = Instant.now().toEpochMilli();
    log.info("Time elapsed final: {}", ending - starting);
    return Optional.of(orchardParentTreeDto);
  }

  /**
   * Finds an Orchard parent tree contribution data given an orchard id and an SPU ID.
   *
   * @param vegCode {@link VegetationCode} identification
   * @return {@link Optional} of a {@link List} of {@link OrchardParentTreeDto}
   */
  public Optional<List<OrchardLotTypeDescriptionDto>> findNotRetOrchardsByVegCode(String vegCode) {

    List<OrchardLotTypeDescriptionDto> resultList = new ArrayList<>();

    List<Orchard> orchardList =
        orchardRepository.findAllByVegetationCodeAndStageCodeNot(vegCode.toUpperCase(), "RET");

    orchardList.forEach(
        orchard -> {
          OrchardLotTypeCode orchardLotTypeCode = orchard.getOrchardLotTypeCode();
          if (orchardLotTypeCode.isValid()) {
            OrchardLotTypeDescriptionDto objToAdd =
                new OrchardLotTypeDescriptionDto(
                    orchard.getId(),
                    orchard.getName(),
                    orchard.getVegetationCode(),
                    orchardLotTypeCode.getCode(),
                    orchardLotTypeCode.getDescription(),
                    orchard.getStageCode());
            resultList.add(objToAdd);
          }
        });

    if (resultList.isEmpty()) {
      return Optional.empty();
    }
    return Optional.of(resultList);
  }

  private List<ParentTreeGeneticInfoDto> findAllParentTree(
      String orchardId, Long spuId, long milli) {
    List<ParentTreeGeneticInfoDto> parentTreeDtoList = new ArrayList<>();
    List<ParentTreeOrchard> parentTreeOrchards =
        parentTreeOrchardRepository.findByIdOrchardId(orchardId);
    long endingThree = Instant.now().toEpochMilli();
    log.info("Time elapsed querying all parent tree to the orchard: {}", endingThree - milli);

    List<Long> parentTreeIdList = new ArrayList<>();
    parentTreeOrchards.forEach(pto -> parentTreeIdList.add(pto.getId().getParentTreeId()));

    long endingFour = Instant.now().toEpochMilli();
    log.info("Time elapsed mapping all parent tree orchard ids: {}", endingFour - endingThree);

    List<ParentTree> parentTreeList = parentTreeRepository.findAllIn(parentTreeIdList);

    long endingFive = Instant.now().toEpochMilli();
    log.info("Time elapsed finding all parent tree (select in): {}", endingFive - endingFour);

    List<ParentTreeGeneticQualityDto> qualityDtoList =
        findAllParentTreeGeneticQualities(spuId, parentTreeIdList);
    long endingSeven = Instant.now().toEpochMilli();
    log.info("Time elapsed querying all parent tree genetic quality: {}", endingSeven - endingFive);

    for (ParentTree parentTree : parentTreeList) {
      ParentTreeGeneticInfoDto parentTreeDto = new ParentTreeGeneticInfoDto();
      parentTreeDto.setParentTreeId(parentTree.getId());
      parentTreeDto.setParentTreeNumber(parentTree.getParentTreeNumber());
      parentTreeDto.setParentTreeRegStatusCode(parentTree.getParentTreeRegStatusCode());
      parentTreeDto.setLocalNumber(parentTree.getLocalNumber());
      parentTreeDto.setActive(parentTree.getActive());
      parentTreeDto.setTested(parentTree.getTested());
      parentTreeDto.setBreedingProgram(parentTree.getBreedingProgram());
      parentTreeDto.setFemaleParentTreeId(parentTree.getFemaleParentParentTreeId());
      parentTreeDto.setMaleParentTreeId(parentTree.getMaleParentParentTreeId());

      parentTreeDto.setParentTreeGeneticQualities(
          qualityDtoList.stream()
              .filter(x -> x.getParentTreeId().equals(parentTree.getId()))
              .toList());

      parentTreeDtoList.add(parentTreeDto);
    }

    long endingEight = Instant.now().toEpochMilli();
    log.info("Time elapsed creating ParentTreeDto list: {}", endingEight - endingSeven);
    return parentTreeDtoList;
  }

  private List<ParentTreeGeneticQualityDto> findAllParentTreeGeneticQualities(
      Long spuId, List<Long> parentTreeIdList) {
    List<ParentTreeGeneticQualityDto> list = new ArrayList<>();

    boolean geneticWorthCalcInd = true;
    String geneticType = "BV";

    List<ParentTreeGeneticQuality> ptgqList =
        parentTreeGeneticQualityRepository.findAllBySpuGeneticWorthTypeParentTreeId(
            spuId, geneticWorthCalcInd, geneticType, parentTreeIdList);

    for (ParentTreeGeneticQuality parentTreeGen : ptgqList) {
      ParentTreeGeneticQualityDto geneticQualityDto = new ParentTreeGeneticQualityDto();
      geneticQualityDto.setParentTreeId(parentTreeGen.getParentTreeId());
      geneticQualityDto.setGeneticTypeCode(parentTreeGen.getGeneticTypeCode());
      geneticQualityDto.setGeneticWorthCode(parentTreeGen.getGeneticWorthCode());
      geneticQualityDto.setGeneticQualityValue(parentTreeGen.getGeneticQualityValue());

      list.add(geneticQualityDto);
    }
    return list;
  }

  /**
   * Find all parent trees under a vegCode.
   *
   * <p>Step 1: Convert an array of spu object to map, assuming 1 orchardId to 1 spu relationship.
   *
   * <p>Step 2: Find all non-retired orchards under a vegCode.
   *
   * <p>Step 3: Contruct a list of spuId with orchard ids from Step 2
   *
   * <p>Step 4: Query for parent tree ids with spuIds in parent_tree_seed_plan_unit table
   *
   * <p>Step 5: Query for parent tree dtos with parent tree ids @Return the value of resultMap.
   */
  public List<ParentTreeDto> findParentTreesWithVegCode(
      String vegCode, List<SeedPlanUnitDto> spuList) {

    // Key is orchard Id, Value is Spu
    Map<String, Integer> orchardSpuMap = new HashMap<>();

    // Step 1
    spuList.forEach(
        spuObj -> {
          orchardSpuMap.put(spuObj.orchardId(), spuObj.seedPlanningUnitId());
        });

    // Step 2
    List<Orchard> orchardList =
        orchardRepository.findAllByVegetationCodeAndStageCodeNot(vegCode, "RET");

    // Step 3, using a set
    Set<Integer> spuIdSet = new HashSet<>();

    orchardList.forEach(
        orchard -> {
          Integer spuId = orchardSpuMap.get(orchard.getId());
          spuIdSet.add(spuId);
        });

    List<Integer> list = new ArrayList<Integer>(spuIdSet);
    List<ParentTreeSpuEntity> test = parentTreeSpuRepository.findByIdSpuIdIn(list);

    log.info("KKKKKK " + Integer.toString(test.size()));

    // Key is parent tree id, Value is parent tree dto
    Map<String, ParentTreeDto> resultMap = new HashMap<>();

    return new ArrayList<>(resultMap.values());
  }
}
