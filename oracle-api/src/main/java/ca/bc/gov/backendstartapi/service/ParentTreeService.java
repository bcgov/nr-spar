package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLatLongDto;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
import java.util.ArrayList;
import java.util.List;
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
   * @return A List of {@link ParentTreeLatLongDto} containing the result rows.
   */
  public List<ParentTreeLatLongDto> getLatLongParentTreeData(List<LatLongRequestDto> ptIds) {
    SparLog.info("Getting lat long elevation data for {} parent tree id(s)", ptIds);
    List<Long> idList = ptIds.stream().map(LatLongRequestDto::parentTreeId).toList();

    List<ParentTreeEntity> ptEntityList = parentTreeRepository.findAllIn(idList);

    List<ParentTreeLatLongDto> resultList = new ArrayList<>();

    ptEntityList.forEach(
        (pt) -> {
          ParentTreeLatLongDto dto = new ParentTreeLatLongDto();
          dto.setParentTreeId(pt.getId());
          dto.setLatitudeDegrees(pt.getLatitudeDegrees());
          dto.setLatitudeMinutes(pt.getLatitudeMinutes());
          dto.setLatitudeSeconds(pt.getLatitudeSeconds());
          dto.setLongitudeDegrees(pt.getLongitudeDegrees());
          dto.setLongitudeMinutes(pt.getLongitudeMinutes());
          dto.setLongitudeSeconds(pt.getLongitudeSeconds());
          dto.setElevation(pt.getElevation());

          resultList.add(dto);
        });

    SparLog.info("{} records found for lat long data", resultList.size());
    return resultList;
  }
}
