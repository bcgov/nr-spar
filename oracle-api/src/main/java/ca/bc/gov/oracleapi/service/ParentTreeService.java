package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.GeospatialRequestDto;
import ca.bc.gov.oracleapi.dto.GeospatialRespondDto;
import ca.bc.gov.oracleapi.dto.ParentTreeByVegCodeDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeoNodeDto;
import ca.bc.gov.oracleapi.dto.ParentTreeNodeDto;
import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import ca.bc.gov.oracleapi.entity.projection.ParentTreeProj;
import ca.bc.gov.oracleapi.repository.ParentTreeRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.hibernate.type.YesNoConverter;
import org.springframework.stereotype.Service;

/** This class holds methods for handling {@link ParentTreeEntity} records. */
@Service
@RequiredArgsConstructor
public class ParentTreeService {

  private final ParentTreeRepository parentTreeRepository;

  /**
   * Gets latitude, longite and elevation data for each parent tree given a list of Parent Tree ids.
   *
   * @param ptIds The {@link ParentTreeEntity} identification list.
   * @return A List of {@link GeospatialRespondDto} containing the result rows.
   */
  public List<GeospatialRespondDto> getPtGeoSpatialData(List<GeospatialRequestDto> ptIds) {
    SparLog.info("Getting lat long elevation data for {} parent tree id(s)", ptIds);
    List<Long> idList = ptIds.stream().map(GeospatialRequestDto::parentTreeId).toList();

    List<ParentTreeEntity> ptEntityList = parentTreeRepository.findAllByIdIn(idList);

    Optional<ParentTreeEntity> hasAnyNullElevation =
        ptEntityList.stream().filter(tree -> tree.getElevation() == null).findAny();

    Map<Long, ParentTreeNodeDto> map;

    // If there's one or more null elevation, go up on the hierarchy
    if (hasAnyNullElevation.isPresent()) {
      map = checkParentTreeHierarchy(ptEntityList);
      // SparLog.info("final map list = {}", map.values());
    } else {
      map = new HashMap<>();
      ptEntityList.forEach((pt) -> map.put(pt.getId(), new ParentTreeNodeDto(pt)));
    }

    List<GeospatialRespondDto> resultList = new ArrayList<>();
    for (Map.Entry<Long, ParentTreeNodeDto> entry : map.entrySet()) {
      Long parentTreeId = entry.getKey();

      // navigate the tree here!
      ParentTreeNodeDto root = entry.getValue();
      root.print(0);
      ParentTreeGeoNodeDto elevation = root.getParentTreeElevation();
      if (elevation == null) {
        SparLog.error("No elevation for Parent tree ID {}", parentTreeId);
        continue;
      }
      SparLog.info("meanElevation {}", elevation.getElevation());

      GeospatialRespondDto dto =
          new GeospatialRespondDto(
              parentTreeId,
              elevation.getLatitudeDegreesIntVal(),
              elevation.getLatitudeMinutesIntVal(),
              elevation.getLatitudeSecondsIntVal(),
              elevation.getLongitudeDegreesIntVal(),
              elevation.getLongitudeMinutesIntVal(),
              elevation.getLongitudeSecondsIntVal(),
              elevation.getElevation());

      resultList.add(dto);
    }

    SparLog.info("{} records found for lat long data", resultList.size());
    return resultList;
  }

  private Map<Long, ParentTreeNodeDto> checkParentTreeHierarchy(
      List<ParentTreeEntity> ptEntityList) {
    int maxLevel = 5;

    Map<Long, ParentTreeNodeDto> resultMap = new HashMap<>();
    Map<Long, List<Long>> parentTreeRelationMap = new HashMap<>();

    // Create root level
    for (ParentTreeEntity ptEntity : ptEntityList) {
      resultMap.putIfAbsent(ptEntity.getId(), new ParentTreeNodeDto(ptEntity));
    }

    for (int i = 0; i < maxLevel; i++) {
      SparLog.info("hierarchy level {}", i);

      List<Long> testList = new ArrayList<>();
      for (ParentTreeEntity ptEntity : ptEntityList) {
        if (ptEntity.getElevation() == null) {
          parentTreeRelationMap.put(ptEntity.getId(), new ArrayList<>());

          if (ptEntity.getFemaleParentTreeId() != null) {
            testList.add(ptEntity.getFemaleParentTreeId());
            parentTreeRelationMap.get(ptEntity.getId()).add(ptEntity.getFemaleParentTreeId());
          }
          if (ptEntity.getMaleParentTreeId() != null) {
            testList.add(ptEntity.getMaleParentTreeId());
            parentTreeRelationMap.get(ptEntity.getId()).add(ptEntity.getMaleParentTreeId());
          }
        }
      }

      List<ParentTreeEntity> nextLevelList = parentTreeRepository.findAllByIdIn(testList);
      // SparLog.info("nextLevelList list = {}", nextLevelList);

      for (Map.Entry<Long, List<Long>> entry : parentTreeRelationMap.entrySet()) {
        Long sonPtId = entry.getKey();
        List<Long> femaleAndMaleParentsIds = entry.getValue();

        for (ParentTreeEntity ptEntity : nextLevelList) {
          if (femaleAndMaleParentsIds.contains(ptEntity.getId())) {
            if (resultMap.get(sonPtId) == null) {
              for (Map.Entry<Long, List<Long>> entryTwo : parentTreeRelationMap.entrySet()) {
                if (entryTwo.getValue().contains(sonPtId)) {
                  // SparLog.info("Maybe this is the root!? {}", entryTwo.getKey());
                  sonPtId = entryTwo.getKey();
                  break;
                }
              }
            }
            // female is always the first
            if (entry.getValue().size() > 0) {
              Long female = entry.getValue().get(0);
              if (female.equals(ptEntity.getId())) {
                // SparLog.info("{} is female!", ptEntity.getId());
                resultMap.get(sonPtId).add(female, ptEntity);
              }
            }
            // male is optional
            if (entry.getValue().size() > 1) {
              Long male = entry.getValue().get(1);
              if (male.equals(ptEntity.getId())) {
                // SparLog.info("{} is male!", ptEntity.getId());
                resultMap.get(sonPtId).add(male, ptEntity);
              }
            }
          }
        }
      }

      /*
      for (ParentTreeEntity ptEntity : nextLevelList) {
        // SparLog.info("Looking for root node id {}", ptEntity.getId());
        Long keyToRemove = null;
        for (Map.Entry<Long, List<Long>> entry : parentTreeRelationMap.entrySet()) {
          Long originalPtId = entry.getKey();
          SparLog.info("Son id: {}", originalPtId);
          List<Long> femaleAndMaleIds = entry.getValue();

          if (femaleAndMaleIds.contains(ptEntity.getId())) {
            keyToRemove = originalPtId;
            if (resultMap.get(originalPtId) == null) {
              for (Map.Entry<Long, List<Long>> entryTwo : parentTreeRelationMap.entrySet()) {
                if (entryTwo.getValue().contains(originalPtId)) {
                  // SparLog.info("Maybe this is the root!? {}", entryTwo.getKey());
                  originalPtId = entryTwo.getKey();
                  break;
                }
              }
            }
            // female is always the first
            if (entry.getValue().size() > 0) {
              Long female = entry.getValue().get(0);
              if (female.equals(ptEntity.getId())) {
                // SparLog.info("{} is female!", ptEntity.getId());
                resultMap.get(originalPtId).add(female, ptEntity);
              }
            }
            // male is optional
            if (entry.getValue().size() > 1) {
              Long male = entry.getValue().get(1);
              if (male.equals(ptEntity.getId())) {
                // SparLog.info("{} is male!", ptEntity.getId());
                resultMap.get(originalPtId).add(male, ptEntity);
              }
            }
            break;
          }
        }

        // remove key
        if (keyToRemove != null) {
          parentTreeRelationMap.remove(keyToRemove);
        }
      }
      */

      boolean allElevationFound =
          nextLevelList.stream().filter(tree -> tree.getElevation() == null).count() == 0;
      if (allElevationFound) {
        // SparLog.info("All elevations has been found. Leaving!");
        break;
      } else {
        // SparLog.info("Not all elevations has been found. Going up on the hierarchy!");
        ptEntityList = new ArrayList<>(nextLevelList);
      }
    }

    return resultMap;
  }

  /**
   * Find all parent trees under a vegCode.
   *
   * @param vegCode the vegetation code to search on.
   * @return A {@link Map} where Key = Parent Tree Number, Value = {@link ParentTreeByVegCodeDto}.
   */
  public Map<String, ParentTreeByVegCodeDto> findParentTreesWithVegCode(String vegCode) {
    SparLog.info("Finding all parent trees under VegCode: {}", vegCode);

    Map<String, ParentTreeByVegCodeDto> ptMap = new HashMap<>();

    // Step 1: Get all the parent trees under a species
    List<ParentTreeProj> parentTreesProjList =
        parentTreeRepository.findAllParentTreeWithVegCode(vegCode);

    YesNoConverter yesNoConverter = new YesNoConverter();

    // Step 2: Aggregate by parent tree number
    for (ParentTreeProj ptProj : parentTreesProjList) {
      String ptNumber = ptProj.getParentTreeNumber();
      // No key (pt number) exist
      if (!ptMap.containsKey(ptNumber)) {

        ParentTreeByVegCodeDto ptByVegCode = new ParentTreeByVegCodeDto();

        ptByVegCode.setParentTreeId(ptProj.getParentTreeId());

        ptByVegCode.setTestedInd(yesNoConverter.toDomainValue(ptProj.getTested()));

        ptByVegCode.setOrchardIds(new ArrayList<>(List.of(ptProj.getOrchardId())));

        Optional<ParentTreeGeneticQualityDto> optPtGenQualDto = getPtGenQualDtoFromProj(ptProj);

        Long spukey = ptProj.getSpu();

        // Ignore gen worth with no spu
        if (ptProj.getSpu() != null && optPtGenQualDto.isPresent()) {
          ParentTreeGeneticQualityDto ptGenQualDto = optPtGenQualDto.get();
          ptByVegCode.setGeneticQualitiesBySpu(
              new HashMap<>(Map.of(spukey, new ArrayList<>(List.of(ptGenQualDto)))));
        } else {
          ptByVegCode.setGeneticQualitiesBySpu(new HashMap<>());
        }

        ptMap.put(ptNumber, ptByVegCode);
      } else {
        // Key already exists
        ParentTreeByVegCodeDto ptByVegCode = ptMap.get(ptNumber);

        insertOrchardId(ptByVegCode, ptProj.getOrchardId());

        insertGenQualObj(ptByVegCode, ptProj);
      }
    }

    return ptMap;
  }

  private Optional<ParentTreeGeneticQualityDto> getPtGenQualDtoFromProj(ParentTreeProj ptProj) {

    if (ptProj.getGeneticTypeCode() == null || ptProj.getGeneticWorthCode() == null) {
      return Optional.empty();
    }

    ParentTreeGeneticQualityDto ptGenQualDto = new ParentTreeGeneticQualityDto();

    ptGenQualDto.setGeneticTypeCode(ptProj.getGeneticTypeCode());
    ptGenQualDto.setGeneticWorthCode(ptProj.getGeneticWorthCode());
    ptGenQualDto.setGeneticQualityValue(ptProj.getGeneticQualityValue());

    return Optional.of(ptGenQualDto);
  }

  /**
   * Insert orchard id if it does not exist.
   *
   * @param ptByVegCode the object {@link ParentTreeByVegCodeDto} to modify with
   * @param orchardId the orchard id to be inserted
   */
  private void insertOrchardId(ParentTreeByVegCodeDto ptByVegCode, String orchardId) {
    List<String> orchardIdList = ptByVegCode.getOrchardIds();
    if (!orchardIdList.contains(orchardId)) {
      orchardIdList.add(orchardId);
      ptByVegCode.setOrchardIds(orchardIdList);
    }
  }

  private void insertGenQualObj(ParentTreeByVegCodeDto ptByVegCode, ParentTreeProj ptProj) {
    Long spukey = ptProj.getSpu();

    Map<Long, List<ParentTreeGeneticQualityDto>> genQualMap =
        ptByVegCode.getGeneticQualitiesBySpu();

    Optional<ParentTreeGeneticQualityDto> optPtGenQualToInsert = getPtGenQualDtoFromProj(ptProj);

    if (spukey != null && optPtGenQualToInsert.isPresent()) {

      ParentTreeGeneticQualityDto ptGenQualToInsert = optPtGenQualToInsert.get();

      List<ParentTreeGeneticQualityDto> listToInsert = new ArrayList<>(List.of(ptGenQualToInsert));

      // Add to existing list
      if (genQualMap.containsKey(spukey)) {
        List<ParentTreeGeneticQualityDto> existingList = genQualMap.get(spukey);

        // Make sure not to insert the same gen worth more than once
        List<ParentTreeGeneticQualityDto> dupList =
            existingList.stream()
                .filter(
                    ptGenQualDto ->
                        ptGenQualDto
                                .getGeneticTypeCode()
                                .equals(ptGenQualToInsert.getGeneticTypeCode())
                            && ptGenQualDto
                                .getGeneticWorthCode()
                                .equals(ptGenQualToInsert.getGeneticWorthCode()))
                .toList();

        if (dupList.size() > 0) {
          listToInsert = existingList;
        } else {
          listToInsert = Stream.concat(existingList.stream(), listToInsert.stream()).toList();
        }
      }

      genQualMap.put(spukey, listToInsert);

      ptByVegCode.setGeneticQualitiesBySpu(genQualMap);
    }
  }
}
