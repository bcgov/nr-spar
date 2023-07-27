package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ConeCollectionMethodServiceTest {

  private ConeCollectionMethodService coneCollectionMethodService;
  private ConeCollectionMethodRepository collectionMethodRepository;

  @Test
  @DisplayName("getAllCollectionMethod")
  void getAllCollectionMethod() {

    CodeDescriptionDto firstMethod = new CodeDescriptionDto("1", "Aerial raking");
    CodeDescriptionDto secondMethod = new CodeDescriptionDto("2", "Aerial clipping/topping");
    CodeDescriptionDto thirdMethod = new CodeDescriptionDto("3", "Felled trees");

    List<CodeDescriptionDto> testList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
            add(thirdMethod);
          }
        };

    when(collectionMethodRepository.findAll()).thenReturn(testList);

    Optional<CodeDescriptionDto> resultList = coneCollectionMethodService.getAllConeCollectionMethods();

    Assertions.assertTrue(optionalDto.isEmpty());
  }
}
