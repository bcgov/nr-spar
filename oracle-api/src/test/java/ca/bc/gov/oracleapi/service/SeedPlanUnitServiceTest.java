package ca.bc.gov.oracleapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.SpuDto;
import ca.bc.gov.oracleapi.entity.SeedPlanUnit;
import ca.bc.gov.oracleapi.entity.SeedPlanZone;
import ca.bc.gov.oracleapi.entity.SeedPlanZoneCode;
import ca.bc.gov.oracleapi.exception.SpuNotFoundException;
import ca.bc.gov.oracleapi.exception.SpzNotFoundException;
import ca.bc.gov.oracleapi.repository.SeedPlanUnitRepository;
import ca.bc.gov.oracleapi.repository.SeedPlanZoneRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

/** The test class for Area of Use Service. */
@ExtendWith(MockitoExtension.class)
public class SeedPlanUnitServiceTest {

  @Mock SeedPlanUnitRepository seedPlanUnitRepository;
  @Mock SeedPlanZoneRepository seedPlanZoneRepository;

  @Autowired @InjectMocks private SeedPlanUnitService seedPlanUnitService;

  @Test
  @DisplayName("Get a SpuDto by id should succeed")
  void getSpuDtoById__shouldSucceed() {
    Integer spuId = 5000;
    Integer spzId = 7000;

    SeedPlanUnit spu = new SeedPlanUnit();
    spu.setSeedPlanUnitId(spuId);
    spu.setSeedPlanZoneId(spzId);

    when(seedPlanUnitRepository.findById(spuId)).thenReturn(Optional.of(spu));

    SeedPlanZone spz = new SeedPlanZone();
    spz.setSeedPlanZoneId(spzId);
    SeedPlanZoneCode spzCodeEntity = new SeedPlanZoneCode();

    String spzCode = "M";
    spzCodeEntity.setSpzCode(spzCode);
    spz.setSeedPlanZoneCode(spzCodeEntity);

    when(seedPlanZoneRepository.findById(spzId)).thenReturn(Optional.of(spz));

    SpuDto spuDto = seedPlanUnitService.getSpuById(spuId.toString());

    assertEquals(spuId, spuDto.getSeedPlanUnitId());
    assertEquals(spzId, spuDto.getSeedPlanZoneId());
    assertEquals(spzCode, spuDto.getSeedPlanZoneCode());
  }

  @Test
  @DisplayName("Get SpuDto by id should be able to throw encountered exception")
  void getSpuById_canThrowException() {
    when(seedPlanUnitRepository.findById(any())).thenThrow(new SpuNotFoundException());

    assertThrows(SpuNotFoundException.class, () -> seedPlanUnitService.getSpuById("001"));
  }

  @Test
  @DisplayName("Get SpuDto by id should throw error if a dependency query fails.")
  void getSpuById_errorOnDependencyException() {
    Integer spuId = 5000;
    Integer spzId = 7000;

    SeedPlanUnit spu = new SeedPlanUnit();
    spu.setSeedPlanUnitId(spuId);
    spu.setSeedPlanZoneId(spzId);

    when(seedPlanUnitRepository.findById(spuId)).thenReturn(Optional.of(spu));

    when(seedPlanZoneRepository.findById(spzId)).thenThrow(new SpzNotFoundException());

    assertThrows(
        SpzNotFoundException.class, () -> seedPlanUnitService.getSpuById(spuId.toString()));
  }
}
