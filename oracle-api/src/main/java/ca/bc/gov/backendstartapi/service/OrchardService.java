package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.entity.Orchard;
import ca.bc.gov.backendstartapi.entity.OrchardLotTypeCode;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.entity.ParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.ParentTreeOrchard;
import ca.bc.gov.backendstartapi.entity.SeedPlanUnit;
import ca.bc.gov.backendstartapi.entity.SeedPlanZone;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUse;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpu;
import ca.bc.gov.backendstartapi.entity.VegetationCode;
import ca.bc.gov.backendstartapi.entity.projection.ParentTreeProj;
import ca.bc.gov.backendstartapi.exception.TestedPtAreaOfUseException;
import ca.bc.gov.backendstartapi.repository.OrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeOrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanUnitRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpuRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaofUseRepository;
import ca.bc.gov.backendstartapi.util.ModelMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** This class contains methods to handle orchards. */
@Service
public class OrchardService {

  private OrchardRepository orchardRepository;

  private ParentTreeOrchardRepository parentTreeOrchardRepository;

  private ParentTreeRepository parentTreeRepository;

  private ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository;

  private TestedPtAreaofUseRepository testedPtAreaofUseRepository;

  private TestedPtAreaOfUseSpuRepository testedPtAreaOfUseSpuRepository;

  private SeedPlanUnitRepository seedPlanUnitRepository;

  private SeedPlanZoneRepository seedPlanZoneRepository;

  OrchardService(
      OrchardRepository orchardRepository,
      ParentTreeOrchardRepository parentTreeOrchardRepository,
      ParentTreeRepository parentTreeRepository,
      ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository,
      TestedPtAreaofUseRepository testedPtAreaofUseRepository,
      TestedPtAreaOfUseSpuRepository testedPtAreaOfUseSpuRepository,
      SeedPlanUnitRepository seedPlanUnitRepository,
      SeedPlanZoneRepository seedPlanZoneRepository) {
    this.orchardRepository = orchardRepository;
    this.parentTreeOrchardRepository = parentTreeOrchardRepository;
    this.parentTreeRepository = parentTreeRepository;
    this.parentTreeGeneticQualityRepository = parentTreeGeneticQualityRepository;
    this.testedPtAreaofUseRepository = testedPtAreaofUseRepository;
    this.testedPtAreaOfUseSpuRepository = testedPtAreaOfUseSpuRepository;
    this.seedPlanUnitRepository = seedPlanUnitRepository;
    this.seedPlanZoneRepository = seedPlanZoneRepository;
  }

  /**
   * Find a not retired {@link Orchard} with a valid {@link OrchardLotTypeCode} by Orchard's ID.
   *
   * @param id The Orchard's identification
   * @return Optional of {@link OrchardLotTypeDescriptionDto}
   */
  public Optional<OrchardLotTypeDescriptionDto> findNotRetiredOrchardValidLotType(String id) {
    SparLog.info("Finding valid not retired Orchard by id: {}", id);
    Optional<Orchard> orchard = orchardRepository.findNotRetiredById(id);

    if (orchard.isPresent()) {
      OrchardLotTypeCode orchardLotTypeCode = orchard.get().getOrchardLotTypeCode();
      if (Objects.isNull(orchardLotTypeCode) || !orchardLotTypeCode.isValid()) {
        SparLog.warn("Orchard lot type is not valid!");
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

      SparLog.info("Valid not retired Orchard found for id: {}", id);
      return Optional.of(descriptionDto);
    }

    SparLog.info("Valid not retired Orchard not found for id: {}", id);
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
    SparLog.info(
        "Finding Orchard Parent Tree and Genetic Quality data for orchard: {} and spuId: {}",
        orchardId,
        spuId);

    long starting = Instant.now().toEpochMilli();
    Optional<Orchard> orchard = orchardRepository.findById(orchardId);
    long endingOne = Instant.now().toEpochMilli();
    SparLog.debug("Time elapsed querying orchard by id: {}", endingOne - starting);

    if (orchard.isEmpty()) {
      SparLog.info("Orchard not found for id {}", orchardId);
      return Optional.empty();
    }

    SparLog.info("Orchard found for id {}, fetching orchard parent tree data", orchardId);

    // Orchard
    OrchardParentTreeDto orchardParentTreeDto = new OrchardParentTreeDto();
    orchardParentTreeDto.setOrchardId(orchard.get().getId());
    orchardParentTreeDto.setVegetationCode(orchard.get().getVegetationCode());
    orchardParentTreeDto.setSeedPlanningUnitId(spuId);

    long endingTwo = Instant.now().toEpochMilli();
    SparLog.debug("Time elapsed creating basic OrchardParentTreeDto: {}", endingTwo - endingOne);

    // Orchard x Parent Tree
    orchardParentTreeDto.setParentTrees(findAllParentTree(orchard.get().getId(), spuId, endingTwo));

    long ending = Instant.now().toEpochMilli();
    SparLog.debug("Time elapsed final: {}", ending - starting);
    SparLog.info("Orchard parent tree data fetched successfully");
    return Optional.of(orchardParentTreeDto);
  }

  /**
   * Finds an Orchard parent tree contribution data given an orchard id and an SPU ID.
   *
   * @param vegCode {@link VegetationCode} identification
   * @return {@link Optional} of a {@link List} of {@link OrchardParentTreeDto}
   */
  public Optional<List<OrchardLotTypeDescriptionDto>> findNotRetOrchardsByVegCode(String vegCode) {
    SparLog.info("Finding not retired Orchard by VegCode: {}", vegCode);

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
      SparLog.info("No records for not retired Orchard for VegCode: {}", vegCode);
      return Optional.empty();
    }

    SparLog.info("{} records for not retired Orchard for VegCode: {}", resultList.size(), vegCode);
    return Optional.of(resultList);
  }

  /** Find all parent trees under a vegCode. */
  public List<SameSpeciesTreeDto> findParentTreesWithVegCode(
      String vegCode, Map<String, String> orchardSpuMap) {
    SparLog.info("Finding all parent trees under VegCode: {}", vegCode);

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

    SparLog.info("{} parent trees found under VegCode: {}", resultList.size(), vegCode);
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
    SparLog.debug("Time elapsed querying all parent tree to the orchard: {}", endingThree - milli);

    List<Long> parentTreeIdList = new ArrayList<>();
    parentTreeOrchards.forEach(pto -> parentTreeIdList.add(pto.getId().getParentTreeId()));

    long endingFour = Instant.now().toEpochMilli();
    SparLog.debug("Time elapsed mapping all parent tree orchard ids: {}", endingFour - endingThree);

    List<ParentTreeEntity> parentTreeList = parentTreeRepository.findAllIn(parentTreeIdList);

    long endingFive = Instant.now().toEpochMilli();
    SparLog.debug("Time elapsed finding all parent tree (select in): {}", endingFive - endingFour);

    List<ParentTreeGeneticQualityDto> qualityDtoList =
        findAllParentTreeGeneticQualities(spuId, parentTreeIdList);
    long endingSeven = Instant.now().toEpochMilli();
    SparLog.debug(
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
    SparLog.debug("Time elapsed creating ParentTreeDto list: {}", endingEight - endingSeven);
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

  /**
   * Get SPZ information given a list of SPU Ids.
   *
   * @param spuIds A list of SPU ID to be fetched.
   * @return A List of {@link SeedPlanZoneDto}
   */
  public List<SeedPlanZoneDto> getSpzInformationBySpu(List<Integer> spuIds) {
    SparLog.info("Getting SPZ information for SPU IDs {}", spuIds);

    List<TestedPtAreaOfUse> testedList =
        testedPtAreaofUseRepository.findAllBySeedPlanUnitIdIn(spuIds);

    if (testedList.isEmpty()) {
      SparLog.info("No testes parent tree area of use found!");
      return List.of();
    }

    List<SeedPlanZoneDto> seedPlanZoneDtoList = new ArrayList<>();
    for (TestedPtAreaOfUse testedEntity : testedList) {
      final Integer spuId = testedEntity.getSeedPlanUnitId();
      final Integer testedPtAreaId = testedEntity.getTestedPtAreaOfUseId();

      SparLog.info("Tested PT area of use id {} found for spu id {}", testedPtAreaId, spuId);

      Optional<TestedPtAreaOfUseSpu> testedSpu =
          testedPtAreaOfUseSpuRepository.findByTestedPtAreaOfUseIdAndSeedPlanUnitId(
              testedPtAreaId, spuId);

      if (testedSpu.isEmpty()) {
        SparLog.warn(
            "Broken relationship between TESTED_PT_AREA_OF_USE_SPU and TESTED_PT_AREA_OF_USE for"
                + " SPU id {}",
            spuId);
        throw new TestedPtAreaOfUseException();
      }

      SeedPlanZoneDto responseDto = new SeedPlanZoneDto();
      responseDto.setSeedPlanUnitId(spuId);

      Optional<SeedPlanUnit> seedPlanUnitOp = seedPlanUnitRepository.findById(spuId);
      if (seedPlanUnitOp.isEmpty()) {
        SparLog.warn("No Seed Plan Unit record found for spu id {}", spuId);
      } else {
        SparLog.info("Seed Plan Unit record found for SPU id {}", spuId);

        responseDto.setSeedPlanZoneId(seedPlanUnitOp.get().getSeedPlanZoneId());
        responseDto.setElevationMin(seedPlanUnitOp.get().getElevationMin());
        responseDto.setElevationMax(seedPlanUnitOp.get().getElevationMax());

        final Integer spzId = seedPlanUnitOp.get().getSeedPlanZoneId();

        Optional<SeedPlanZone> seedPlanZoneOp = seedPlanZoneRepository.findById(spzId);
        if (seedPlanZoneOp.isEmpty()) {
          SparLog.warn("No Seed Plan Zone record found for SPZ id {}", spzId);
        } else {
          SparLog.info("Seed Plan Zone record found for SPZ id {}", spzId);

          responseDto.setGeneticClassCode(seedPlanZoneOp.get().getGeneticClassCode());
          responseDto.setSeedPlanZoneCode(seedPlanZoneOp.get().getSeedPlanZoneCode());
          responseDto.setVegetationCode(seedPlanZoneOp.get().getVegetationCode());
        }
      }

      seedPlanZoneDtoList.add(responseDto);
    }

    return seedPlanZoneDtoList;
  }
}
