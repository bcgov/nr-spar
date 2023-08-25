package ca.bc.gov.backendstartapi.util;

import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ModelMapperTest {

  @Test
  @DisplayName("conertEntityToDtoTest")
  void conertEntityToDtoTest() {
    ParentTreeEntity parentTreeEntity =
        new ParentTreeEntity(
            Long.valueOf(123456),
            "123",
            "PORK",
            "OINK",
            "101",
            true,
            true,
            true,
            Long.valueOf(123),
            Long.valueOf(456));

    ParentTreeDto parentTreeDto = ModelMapper.convert(parentTreeEntity, ParentTreeDto.class);

    Assertions.assertNotEquals(parentTreeEntity.getId(), parentTreeDto.getParentTreeId());

    parentTreeDto.setParentTreeId(parentTreeEntity.getId());

    Assertions.assertEquals(parentTreeEntity.getId(), parentTreeDto.getParentTreeId());

    Assertions.assertEquals(
        parentTreeEntity.getParentTreeNumber(), parentTreeDto.getParentTreeNumber());

    Assertions.assertEquals(
        parentTreeEntity.getParentTreeRegStatusCode(), parentTreeDto.getParentTreeRegStatusCode());

    Assertions.assertEquals(parentTreeEntity.getLocalNumber(), parentTreeDto.getLocalNumber());

    Assertions.assertEquals(parentTreeEntity.getActive(), parentTreeDto.getActive());

    Assertions.assertEquals(parentTreeEntity.getTested(), parentTreeDto.getTested());

    Assertions.assertEquals(
        parentTreeEntity.getBreedingProgram(), parentTreeDto.getBreedingProgram());

    Assertions.assertEquals(
        parentTreeEntity.getFemaleParentTreeId(), parentTreeDto.getFemaleParentTreeId());

    Assertions.assertEquals(
        parentTreeEntity.getMaleParentTreeId(), parentTreeDto.getMaleParentTreeId());
  }
}
