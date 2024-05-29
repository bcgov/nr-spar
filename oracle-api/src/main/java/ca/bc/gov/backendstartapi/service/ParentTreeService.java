package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
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
}
