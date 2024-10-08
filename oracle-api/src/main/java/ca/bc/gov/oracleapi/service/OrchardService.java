package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.OrchardDto;
import ca.bc.gov.oracleapi.dto.OrchardParentTreeDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.oracleapi.entity.OrchardEntity;
import ca.bc.gov.oracleapi.entity.OrchardLotTypeCode;
import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import ca.bc.gov.oracleapi.entity.ParentTreeGeneticQuality;
import ca.bc.gov.oracleapi.entity.ParentTreeOrchard;
import ca.bc.gov.oracleapi.entity.VegetationCode;
import ca.bc.gov.oracleapi.repository.OrchardRepository;
import ca.bc.gov.oracleapi.repository.ParentTreeGeneticQualityRepository;
import ca.bc.gov.oracleapi.repository.ParentTreeOrchardRepository;
import ca.bc.gov.oracleapi.repository.ParentTreeRepository;
import ca.bc.gov.oracleapi.util.ModelMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class contains methods to handle orchards. */
@Service
@RequiredArgsConstructor
public class OrchardService {

  private final OrchardRepository orchardRepository;

  private final ParentTreeOrchardRepository parentTreeOrchardRepository;

  private final ParentTreeRepository parentTreeRepository;

  private final ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository;

  private final SparBecCatalogueService sparBecCatalogueService;

  /**
   * Find a not retired {@link Orchard} with a valid {@link OrchardLotTypeCode} by Orchard's ID.
   *
   * @param id The Orchard's identification
   * @return Optional of {@link OrchardDto}
   */
  public Optional<OrchardDto> findNotRetiredOrchardValidLotType(String id) {
    SparLog.info("Finding valid not retired Orchard by id: {}", id);
    Optional<OrchardEntity> orchard = orchardRepository.findNotRetiredById(id);

    if (orchard.isPresent()) {
      OrchardEntity orchardEntity = orchard.get();

      OrchardLotTypeCode orchardLotTypeCode = orchardEntity.getOrchardLotTypeCode();
      if (Objects.isNull(orchardLotTypeCode) || !orchardLotTypeCode.isValid()) {
        SparLog.warn("Orchard lot type is not valid!");
        return Optional.empty();
      }

      List<String> bacZones = new ArrayList<>(1);
      if (orchardEntity.getBecZoneCode() != null) {
        bacZones.add(orchardEntity.getBecZoneCode());
      }

      Map<String, String> becZoneDescMap =
          sparBecCatalogueService.getBecDescriptionsByCode(bacZones);

      String becZoneDescription =
          becZoneDescMap.isEmpty() ? null : becZoneDescMap.get(orchardEntity.getBecZoneCode());

      OrchardDto orchardDto =
          new OrchardDto(
              orchardEntity.getId(),
              orchardEntity.getName(),
              orchardEntity.getVegetationCode(),
              orchardLotTypeCode.getCode(),
              orchardLotTypeCode.getDescription(),
              orchardEntity.getStageCode(),
              orchardEntity.getBecZoneCode(),
              becZoneDescription,
              orchardEntity.getBecSubzoneCode(),
              orchardEntity.getVariant(),
              orchardEntity.getBecVersionId());

      SparLog.info("Valid not retired Orchard found for id: {}", id);
      return Optional.of(orchardDto);
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
    Optional<OrchardEntity> orchard = orchardRepository.findById(orchardId);
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
  public Optional<List<OrchardDto>> findNotRetOrchardsByVegCode(String vegCode) {
    SparLog.info("Finding all Orchards by VegCode: {}", vegCode);

    List<OrchardDto> resultList = new ArrayList<>();

    List<OrchardEntity> orchardList =
        orchardRepository.findAllByVegetationCode(vegCode.toUpperCase());

    List<String> bacZones = new ArrayList<>();
    for (OrchardEntity orchard : orchardList) {
      if (!bacZones.contains(orchard.getBecZoneCode())) {
        bacZones.add(orchard.getBecZoneCode());
      }
    }

    Map<String, String> becZoneDescMap = sparBecCatalogueService.getBecDescriptionsByCode(bacZones);

    orchardList.forEach(
        orchard -> {
          OrchardLotTypeCode orchardLotTypeCode = orchard.getOrchardLotTypeCode();
          if (orchardLotTypeCode.isValid()) {
            OrchardDto objToAdd =
                new OrchardDto(
                    orchard.getId(),
                    orchard.getName(),
                    orchard.getVegetationCode(),
                    orchardLotTypeCode.getCode(),
                    orchardLotTypeCode.getDescription(),
                    orchard.getStageCode(),
                    orchard.getBecZoneCode(),
                    becZoneDescMap.get(orchard.getBecZoneCode()),
                    orchard.getBecSubzoneCode(),
                    orchard.getVariant(),
                    orchard.getBecVersionId());
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

    List<ParentTreeEntity> parentTreeList = parentTreeRepository.findAllByIdIn(parentTreeIdList);

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
}
