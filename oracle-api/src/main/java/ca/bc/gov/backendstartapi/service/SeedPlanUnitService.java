package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SpuDto;
import ca.bc.gov.backendstartapi.entity.SeedPlanUnit;
import ca.bc.gov.backendstartapi.entity.SeedPlanZone;
import ca.bc.gov.backendstartapi.exception.SpuNotFoundException;
import ca.bc.gov.backendstartapi.exception.SpzNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedPlanUnitRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for BEC Zone Code Service. */
@Service
@RequiredArgsConstructor
public class SeedPlanUnitService {

  private final SeedPlanUnitRepository seedPlanUnitRepository;

  private final SeedPlanZoneRepository seedPlanZoneRepository;

  /**
   * Get the description of a Seed Plan Unit by an ID
   *
   * @return a {@link SpuDto} if found
   * @throws {@link SpuNotFoundException} or {@link SpzNotFoundException}
   */
  public SpuDto getSpuById(String spuId) {
    SparLog.info("Finding SPU with id {}", spuId);

    SeedPlanUnit spu =
        seedPlanUnitRepository
            .findById(Integer.parseInt(spuId))
            .orElseThrow(SpuNotFoundException::new);

    SparLog.info("SPU found with id {}", spuId);

    SpuDto spuDto = ModelMapper.convert(spu, SpuDto.class);

    SparLog.info("Finding SPZ with id {}", spuDto.getSeedPlanZoneId());

    SeedPlanZone spz =
        seedPlanZoneRepository
            .findById(spuDto.getSeedPlanZoneId())
            .orElseThrow(SpzNotFoundException::new);

    SparLog.info("SPZ found with id {}", spuDto.getSeedPlanZoneId());

    spuDto.setSeedPlanZoneCode(spz.getSeedPlanZoneCode().getSpzCode());

    return spuDto;
  }
}
