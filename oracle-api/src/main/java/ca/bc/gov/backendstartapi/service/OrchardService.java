package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.AreaOfUseSpuGeoDto;
import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.Orchard;
import ca.bc.gov.backendstartapi.entity.OrchardLotTypeCode;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.entity.ParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.ParentTreeOrchard;
import ca.bc.gov.backendstartapi.entity.SeedPlanUnit;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUse;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpu;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpz;
import ca.bc.gov.backendstartapi.entity.VegetationCode;
import ca.bc.gov.backendstartapi.entity.projection.ParentTreeProj;
import ca.bc.gov.backendstartapi.exception.TestedAreaOfUseNotFound;
import ca.bc.gov.backendstartapi.repository.OrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeOrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanUnitRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpuRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpzRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaofUseRepository;
import ca.bc.gov.backendstartapi.util.ModelMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
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

  private TestedPtAreaOfUseSpzRepository testedPtAreaOfUseSpzRepository;

  private SeedPlanUnitRepository seedPlanUnitRepository;

  private TestedPtAreaOfUseSpuRepository testedPtAreaOfUseSpuRepository;

  OrchardService(
      OrchardRepository orchardRepository,
      ParentTreeOrchardRepository parentTreeOrchardRepository,
      ParentTreeRepository parentTreeRepository,
      ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository,
      TestedPtAreaofUseRepository testedPtAreaofUseRepository,
      TestedPtAreaOfUseSpzRepository testedPtAreaOfUseSpzRepository,
      SeedPlanUnitRepository seedPlanUnitRepository,
      TestedPtAreaOfUseSpuRepository testedPtAreaOfUseSpuRepository,
      SeedPlanZoneRepository seedPlanZoneRepository) {
    this.orchardRepository = orchardRepository;
    this.parentTreeOrchardRepository = parentTreeOrchardRepository;
    this.parentTreeRepository = parentTreeRepository;
    this.parentTreeGeneticQualityRepository = parentTreeGeneticQualityRepository;
    this.testedPtAreaofUseRepository = testedPtAreaofUseRepository;
    this.testedPtAreaOfUseSpzRepository = testedPtAreaOfUseSpzRepository;
    this.seedPlanUnitRepository = seedPlanUnitRepository;
    this.testedPtAreaOfUseSpuRepository = testedPtAreaOfUseSpuRepository;
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
   * Get SPZ and SPU geographical information given a SPU id.
   *
   * @param spuId A SPU id.
   * @return A {@link SpzSpuGeoDto}
   */
  public AreaOfUseDto calcAreaOfUseData(Integer spuId) {
    SparLog.info("Getting area of use data for SPU ID {}", spuId);

    AreaOfUseDto result = new AreaOfUseDto();

    // Step 1: Get tested_pt_area_of_use_id by spuId
    Integer testedPtAreaOfUseId = getTestedPtAreaOfUseId(spuId);
    SparLog.info(
        "Tested parent tree area of used ID {} found with spu ID {}", testedPtAreaOfUseId, spuId);

    // Step 2: Get additional SPUs using the tested_pt_area_of_use_id from the
    // tested_pt_area_of_use_spu table
    List<Integer> spuList =
        testedPtAreaOfUseSpuRepository.findByTestedPtAreaOfUseId(testedPtAreaOfUseId).stream()
            .map(TestedPtAreaOfUseSpu::getSeedPlanUnitId)
            .toList();
    SparLog.info(
        "{} spu found with tested parent tree area of used ID {}",
        spuList.size(),
        testedPtAreaOfUseId);

    // Step 3: Get area of use spu geo data
    result.setAreaOfUseSpuGeoDto(setCalculatedSpuGeoData(spuList));
    SparLog.info("SPU min/max data calculated and set");

    // Step 4: Get SPZs under a testedPtAreaOfUseId
    List<TestedPtAreaOfUseSpz> testedPtAoUspzs =
        testedPtAreaOfUseSpzRepository.findAllByTestedPtAreaOfUse_testedPtAreaOfUseId(
            testedPtAreaOfUseId);
    SparLog.info(
        "{} spz found under tested parent tree area of use id {}",
        testedPtAoUspzs.size(),
        testedPtAreaOfUseId);

    List<SpzDto> spzList =
        testedPtAoUspzs.stream()
            .map(
                testedPtSpz -> {
                  SpzDto spzToAdd = new SpzDto();
                  spzToAdd.setCode(testedPtSpz.getSeedPlanZoneCode().getSpzCode());
                  spzToAdd.setDescription(testedPtSpz.getSeedPlanZoneCode().getSpzDescription());
                  spzToAdd.setIsPrimary(testedPtSpz.getIsPrimary());
                  return spzToAdd;
                })
            .toList();

    result.setSpzList(spzList);
    SparLog.info("SPZ list set in area of use DTO.");

    return result;
  }

  private Integer getTestedPtAreaOfUseId(Integer spuId) {
    List<TestedPtAreaOfUse> testedAoU = testedPtAreaofUseRepository.findAllBySeedPlanUnitId(spuId);
    if (testedAoU.isEmpty()) {
      throw new TestedAreaOfUseNotFound();
    }
    // Assuming 1-to-1 relation ship between TestedPtAreaOfUseId and SpuId
    return testedAoU.get(0).getTestedPtAreaOfUseId();
  }

  private AreaOfUseSpuGeoDto setCalculatedSpuGeoData(List<Integer> spuIds) {
    List<SeedPlanUnit> spuEntityList = seedPlanUnitRepository.findBySeedPlanUnitIdIn(spuIds);

    AreaOfUseSpuGeoDto areaOfUseSpuGeoDto = new AreaOfUseSpuGeoDto();

    // Max Elevation
    // Filter out null values first so it can be used with the Stream.max()
    List<SeedPlanUnit> filteredMaxElevSpu =
        spuEntityList.stream().filter(spu -> spu.getElevationMax() != null).toList();
    Integer maxElevation =
        filteredMaxElevSpu.size() > 0
            ? filteredMaxElevSpu.stream()
                .max(Comparator.comparing(SeedPlanUnit::getElevationMax))
                .get()
                .getElevationMax()
            : null;
    areaOfUseSpuGeoDto.setElevationMax(maxElevation);

    // Min Elevation
    List<SeedPlanUnit> filteredMinElevSpu =
        spuEntityList.stream().filter(spu -> spu.getElevationMin() != null).toList();
    Integer minElevation =
        filteredMinElevSpu.size() > 0
            ? filteredMinElevSpu.stream()
                .min(Comparator.comparing(SeedPlanUnit::getElevationMin))
                .get()
                .getElevationMin()
            : null;
    areaOfUseSpuGeoDto.setElevationMin(minElevation);

    // Max Lat Degree
    List<SeedPlanUnit> filteredMaxLatDegSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeDegreesMax() != null).toList();
    Integer maxLatDeg =
        filteredMaxLatDegSpu.size() > 0
            ? filteredMaxLatDegSpu.stream()
                .max(Comparator.comparing(SeedPlanUnit::getLatitudeDegreesMax))
                .get()
                .getLatitudeDegreesMax()
            : null;
    areaOfUseSpuGeoDto.setLatitudeDegreesMax(maxLatDeg);

    // Min Lat Degree
    List<SeedPlanUnit> filteredMinLatDegSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeDegreesMin() != null).toList();
    Integer minLatDeg =
        filteredMinLatDegSpu.size() > 0
            ? filteredMinLatDegSpu.stream()
                .min(Comparator.comparing(SeedPlanUnit::getLatitudeDegreesMin))
                .get()
                .getLatitudeDegreesMin()
            : null;
    areaOfUseSpuGeoDto.setLatitudeDegreesMin(minLatDeg);

    // Max Lat Minute
    List<SeedPlanUnit> filteredMaxLatMinuteSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeMinutesMax() != null).toList();
    Integer maxLatMinute =
        filteredMaxLatMinuteSpu.size() > 0
            ? filteredMaxLatMinuteSpu.stream()
                .max(Comparator.comparing(SeedPlanUnit::getLatitudeMinutesMax))
                .get()
                .getLatitudeMinutesMax()
            : null;
    areaOfUseSpuGeoDto.setLatitudeMinutesMax(maxLatMinute);

    // Min Lat Minute
    List<SeedPlanUnit> filteredMinLatMiunteSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeMinutesMin() != null).toList();
    Integer minLatMinute =
        filteredMinLatMiunteSpu.size() > 0
            ? filteredMinLatMiunteSpu.stream()
                .min(Comparator.comparing(SeedPlanUnit::getLatitudeMinutesMin))
                .get()
                .getLatitudeMinutesMin()
            : null;
    areaOfUseSpuGeoDto.setLatitudeMinutesMin(minLatMinute);

    return areaOfUseSpuGeoDto;
  }
}
