package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.entity.Orchard;
import ca.bc.gov.backendstartapi.entity.OrchardLotTypeCode;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.entity.ParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.ParentTreeOrchard;
import ca.bc.gov.backendstartapi.entity.VegetationCode;
import ca.bc.gov.backendstartapi.entity.projection.ParentTreeProj;
import ca.bc.gov.backendstartapi.repository.OrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeOrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
import ca.bc.gov.backendstartapi.util.ModelMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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

  OrchardService(
      OrchardRepository orchardRepository,
      ParentTreeOrchardRepository parentTreeOrchardRepository,
      ParentTreeRepository parentTreeRepository,
      ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository) {
    this.orchardRepository = orchardRepository;
    this.parentTreeOrchardRepository = parentTreeOrchardRepository;
    this.parentTreeRepository = parentTreeRepository;
    this.parentTreeGeneticQualityRepository = parentTreeGeneticQualityRepository;
  }

  /**
   * Find a not retired {@link Orchard} with a valid {@link OrchardLotTypeCode} by Orchard's ID.
   *
   * @param id The Orchard's identification
   * @return Optional of {@link OrchardLotTypeDescriptionDto}
   */
  public Optional<OrchardLotTypeDescriptionDto> findNotRetiredOrchardValidLotType(String id) {
    log.info("Finding valid not retired Orchard by id: {}", id);
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
    log.info(
        "Finding Orchard Parent Tree and Genetic Quality data for orchard: {} and spuId: {}",
        orchardId,
        spuId);

    long starting = Instant.now().toEpochMilli();
    Optional<Orchard> orchard = orchardRepository.findById(orchardId);
    long endingOne = Instant.now().toEpochMilli();
    log.debug("Time elapsed querying orchard by id: {}", endingOne - starting);

    if (orchard.isEmpty()) {
      return Optional.empty();
    }

    // Orchard
    OrchardParentTreeDto orchardParentTreeDto = new OrchardParentTreeDto();
    orchardParentTreeDto.setOrchardId(orchard.get().getId());
    orchardParentTreeDto.setVegetationCode(orchard.get().getVegetationCode());
    orchardParentTreeDto.setSeedPlanningUnitId(spuId);

    long endingTwo = Instant.now().toEpochMilli();
    log.debug("Time elapsed creating basic OrchardParentTreeDto: {}", endingTwo - endingOne);

    // Orchard x Parent Tree
    orchardParentTreeDto.setParentTrees(findAllParentTree(orchard.get().getId(), spuId, endingTwo));

    long ending = Instant.now().toEpochMilli();
    log.debug("Time elapsed final: {}", ending - starting);
    return Optional.of(orchardParentTreeDto);
  }

  /**
   * Finds an Orchard parent tree contribution data given an orchard id and an SPU ID.
   *
   * @param vegCode {@link VegetationCode} identification
   * @return {@link Optional} of a {@link List} of {@link OrchardParentTreeDto}
   */
  public Optional<List<OrchardLotTypeDescriptionDto>> findNotRetOrchardsByVegCode(String vegCode) {
    log.info("Finding not retired Orchard by VegCode: {}", vegCode);

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

  /** Find all parent trees under a vegCode. */
  public List<SameSpeciesTreeDto> findParentTreesWithVegCode(
      String vegCode, Map<String, String> orchardSpuMap) {
    log.info("Finding all parent trees under VegCode: {}", vegCode);

    // Step 1: Get all the parent trees under a species
    List<ParentTreeProj> parentTrees = parentTreeRepository.findAllParentTreeWithVegCode(vegCode);

    // Step 2: Convert projections to Dto
    List<SameSpeciesTreeDto> resultList =
        parentTrees.stream()
            .map(
                parentTree -> {
                  SameSpeciesTreeDto treeDto = new SameSpeciesTreeDto();
                  treeDto.setOrchardId(parentTree.getOrchardId());
                  treeDto.setParentTreeId(parentTree.getParentTreeId());
                  treeDto.setParentTreeNumber(parentTree.getParentTreeNumber());
                  treeDto.setSpu(parentTree.getSpu());
                  return treeDto;
                })
            .toList();

    // Step 3 fill gen worth values
    fillGenInfoForEachTree(resultList);

    // Step 4 filter with orchard spu map
    // The first filter makes sure that the tree has a valid orchard id that exist in the
    // orchard-spu table
    resultList =
        resultList.stream()
            .filter(treeDto -> orchardSpuMap.containsKey(treeDto.getOrchardId()))
            .filter(
                treeDto ->
                    treeDto
                        .getSpu()
                        .equals(Long.valueOf(orchardSpuMap.get(treeDto.getOrchardId()))))
            .toList();

    return resultList;
  }

  private void fillGenInfoForEachTree(List<SameSpeciesTreeDto> resultList) {
    List<Long> parentTreeIds =
        resultList.stream()
            .map(
                (treeDto) -> {
                  return treeDto.getParentTreeId();
                })
            .toList();

    List<Long> spuList =
        resultList.stream()
            .map(
                (treeDto) -> {
                  return treeDto.getSpu();
                })
            .toList();

    List<ParentTreeGeneticQuality> ptgqList =
        parentTreeGeneticQualityRepository.findAllByListOfSpuAndId(
            true, "BV", spuList, parentTreeIds);

    resultList.stream()
        .forEach(
            (treeDto) -> {
              List<ParentTreeGeneticQualityDto> matchedPtgqs =
                  ptgqList.stream()
                      .filter(
                          ptgq ->
                              ptgq.getParentTreeId().equals(treeDto.getParentTreeId())
                                  && ptgq.getSeedPlanningUnitId().equals(treeDto.getSpu()))
                      .map(ptgq -> ModelMapper.convert(ptgq, ParentTreeGeneticQualityDto.class))
                      .toList();
              treeDto.setParentTreeGeneticQualities(matchedPtgqs);
            });
  }

  private List<ParentTreeGeneticInfoDto> findAllParentTree(
      String orchardId, Long spuId, long milli) {

    List<ParentTreeOrchard> parentTreeOrchards =
        parentTreeOrchardRepository.findByIdOrchardId(orchardId);
    long endingThree = Instant.now().toEpochMilli();
    log.debug("Time elapsed querying all parent tree to the orchard: {}", endingThree - milli);

    List<Long> parentTreeIdList = new ArrayList<>();
    parentTreeOrchards.forEach(pto -> parentTreeIdList.add(pto.getId().getParentTreeId()));

    long endingFour = Instant.now().toEpochMilli();
    log.debug("Time elapsed mapping all parent tree orchard ids: {}", endingFour - endingThree);

    List<ParentTreeEntity> parentTreeList = parentTreeRepository.findAllIn(parentTreeIdList);

    long endingFive = Instant.now().toEpochMilli();
    log.debug("Time elapsed finding all parent tree (select in): {}", endingFive - endingFour);

    List<ParentTreeGeneticQualityDto> qualityDtoList =
        findAllParentTreeGeneticQualities(spuId, parentTreeIdList);
    long endingSeven = Instant.now().toEpochMilli();
    log.debug(
        "Time elapsed querying all parent tree genetic quality: {}", endingSeven - endingFive);

    List<ParentTreeGeneticInfoDto> parentTreeDtoList =
        parentTreeList.stream()
            .map(
                parentTree -> {
                  ParentTreeGeneticInfoDto converted = convertToParentTreeGenInfoDto(parentTree);
                  converted.setParentTreeGeneticQualities(
                      qualityDtoList.stream()
                          .filter(x -> x.getParentTreeId().equals(parentTree.getId()))
                          .toList());
                  return converted;
                })
            .toList();

    long endingEight = Instant.now().toEpochMilli();
    log.debug("Time elapsed creating ParentTreeDto list: {}", endingEight - endingSeven);
    return parentTreeDtoList;
  }

  private List<ParentTreeGeneticQualityDto> findAllParentTreeGeneticQualities(
      Long spuId, List<Long> parentTreeIdList) {

    boolean geneticWorthCalcInd = true;
    String geneticType = "BV";

    List<ParentTreeGeneticQuality> ptgqList =
        parentTreeGeneticQualityRepository.findAllBySpuGeneticWorthTypeParentTreeId(
            spuId, geneticWorthCalcInd, geneticType, parentTreeIdList);

    return ptgqList.stream()
        .map(parentTreeGen -> ModelMapper.convert(parentTreeGen, ParentTreeGeneticQualityDto.class))
        .toList();
  }

  private ParentTreeGeneticInfoDto convertToParentTreeGenInfoDto(ParentTreeEntity parentTree) {
    ParentTreeGeneticInfoDto parentTreeGenInfoDto =
        ModelMapper.convert(parentTree, ParentTreeGeneticInfoDto.class);
    parentTreeGenInfoDto.setParentTreeId(parentTree.getId());
    return parentTreeGenInfoDto;
  }
}
