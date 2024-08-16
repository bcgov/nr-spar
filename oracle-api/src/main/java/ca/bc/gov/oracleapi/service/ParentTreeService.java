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

  private static final Integer MAX_LEVELS = 5;

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
    Map<Long, ParentTreeNodeDto> parentTreeRootMap;

    // If there's one or more null elevation, go up on the hierarchy
    boolean isAnyMissing = parentTreeListHasAnyElevationMissing(ptEntityList);
    if (isAnyMissing) {
      parentTreeRootMap = checkParentTreeHierarchy(ptEntityList);
    } else {
      parentTreeRootMap = new HashMap<>();
      ptEntityList.forEach((pt) -> parentTreeRootMap.put(pt.getId(), new ParentTreeNodeDto(pt)));
    }

    List<GeospatialRespondDto> resultList = new ArrayList<>();
    for (Map.Entry<Long, ParentTreeNodeDto> rootEntry : parentTreeRootMap.entrySet()) {
      Long parentTreeId = rootEntry.getKey();

      // navigate the tree here!
      ParentTreeNodeDto root = rootEntry.getValue();
      SparLog.debug(root.printLevel(0));

      ParentTreeGeoNodeDto elevation = root.getParentTreeElevation();
      if (elevation == null) {
        SparLog.error("No elevation for Parent tree ID {}", parentTreeId);
        continue;
      }

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
    // Map to store a combination of a ParentTree ID and it's parents in the tree architecture.
    Map<Long, ParentTreeNodeDto> resultMap = new HashMap<>();

    // Map to store a combination of a ParentTree ID and it's direct parents, for easily access
    Map<Long, List<Long>> parentTreeRelationMap = new HashMap<>();

    // Create root level
    for (ParentTreeEntity ptEntity : ptEntityList) {
      resultMap.putIfAbsent(ptEntity.getId(), new ParentTreeNodeDto(ptEntity));
    }

    for (int i = 0; i < MAX_LEVELS; i++) {
      SparLog.debug("Hierarchy level {}", i);

      List<Long> testList = new ArrayList<>();
      
      // Loop through all ParentTree records, getting their female and male parents for the ones
      // that has no elevation data
      for (ParentTreeEntity ptEntity : ptEntityList) {
        if (ptEntity.getElevation() == null) {
          parentTreeRelationMap.put(ptEntity.getId(), new ArrayList<>(2));

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

      // Query from the DB all female and male parents (gathered from the loop above)
      List<ParentTreeEntity> nextLevelList = parentTreeRepository.findAllByIdIn(testList);

      // Loop through the relation of ParentTree ids and its parents
      for (Map.Entry<Long, List<Long>> entry : parentTreeRelationMap.entrySet()) {
        // The 'sonParentTreeId' represents the parent tree without elevation data
        Long sonParentTreeId = entry.getKey();

        // The 'femaleAndMaleParentsIds' represents their parents ids
        List<Long> femaleAndMaleParentsIds = entry.getValue();

        // Loop through the list of parent tree from DB, aiming to connect them with their sons
        for (ParentTreeEntity ptEntity : nextLevelList) {

          // If 'femaleAndMaleParentsIds' contains the current parent tree id, it means that the
          // current parent tree id is one of the parents, it could be either the female or male.
          if (femaleAndMaleParentsIds.contains(ptEntity.getId())) {
            
            // If resultMap doesn't have 'sonParentTreeId' key, it means this is not the first level
            // and it should look at the 'parentTreeRelationMap' who has ALL the parent tree
            // 'son-parents' relation
            if (resultMap.get(sonParentTreeId) == null) {
              SparLog.debug("Key (sonParentTreeId) not found for PT id {}", sonParentTreeId);
              for (Map.Entry<Long, List<Long>> entryTwo : parentTreeRelationMap.entrySet()) {
                if (entryTwo.getValue().contains(sonParentTreeId)) {
                  sonParentTreeId = entryTwo.getKey();
                  break;
                }
              }
            }
            
            // Get female parent tree data and connect with son. Female is always the first
            Long femaleParentTreeId = femaleAndMaleParentsIds.get(0);
            if (femaleParentTreeId.equals(ptEntity.getId())) {
              SparLog.debug("{} is female parent of {}", ptEntity.getId(), sonParentTreeId);
              resultMap.get(sonParentTreeId).add(femaleParentTreeId, ptEntity);
            }

            // Get male parent tree data and connect with son. Male is optional
            if (femaleAndMaleParentsIds.size() > 1) {
              Long maleParentTreeId = entry.getValue().get(1);
              if (maleParentTreeId.equals(ptEntity.getId())) {
                SparLog.debug("{} is male parent of {}", ptEntity.getId(), sonParentTreeId);
                resultMap.get(sonParentTreeId).add(maleParentTreeId, ptEntity);
              }
            }
          }
        }
      }

      // After loop through all records, check if all parents now has elevation data
      // If yes, leave. If not, keep going up looking for the parent's parent
      boolean isAnyMissing = parentTreeListHasAnyElevationMissing(nextLevelList);
      if (!isAnyMissing) {
        SparLog.debug("All elevations has been found. Leaving!");
        break;
      } else {
        SparLog.debug("Not all elevations has been found. Going up on the hierarchy!");
        ptEntityList = new ArrayList<>(nextLevelList);
      }
    }

    return resultMap;
  }

  private boolean parentTreeListHasAnyElevationMissing(List<ParentTreeEntity> list) {
    return list.stream().filter(tree -> tree.getElevation() == null).count() > 0;
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
