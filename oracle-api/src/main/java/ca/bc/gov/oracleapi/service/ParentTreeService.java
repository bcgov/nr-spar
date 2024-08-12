package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.GeospatialRequestDto;
import ca.bc.gov.oracleapi.dto.GeospatialRespondDto;
import ca.bc.gov.oracleapi.dto.ParentTreeByVegCodeDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticQualityDto;
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

    List<ParentTreeEntity> ptEntityList = parentTreeRepository.findAllIn(idList);

    List<GeospatialRespondDto> resultList = new ArrayList<>();

    ptEntityList.forEach(
        (pt) -> {
          GeospatialRespondDto dto =
              new GeospatialRespondDto(
                  pt.getId(),
                  Optional.ofNullable(pt.getLatitudeDegrees()).orElse(0),
                  Optional.ofNullable(pt.getLatitudeMinutes()).orElse(0),
                  Optional.ofNullable(pt.getLatitudeSeconds()).orElse(0),
                  Optional.ofNullable(pt.getLongitudeDegrees()).orElse(0),
                  Optional.ofNullable(pt.getLongitudeMinutes()).orElse(0),
                  Optional.ofNullable(pt.getLongitudeSeconds()).orElse(0),
                  Optional.ofNullable(pt.getElevation()).orElse(0));

          resultList.add(dto);
        });

    SparLog.info("{} records found for lat long data", resultList.size());
    return resultList;
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
