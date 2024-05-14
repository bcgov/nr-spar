package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.MethodOfPaymentDto;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class MethodOfPaymentServiceTest {

  @Mock MethodOfPaymentRepository methodOfPaymentRepository;
  private MethodOfPaymentService methodOfPaymentService;

  @BeforeEach
  void setup() {
    methodOfPaymentService = new MethodOfPaymentService(methodOfPaymentRepository);
  }

  @Test
  @DisplayName("getAllMethodOfPaymentServiceTest")
  void getAllMethodOfPaymentServiceTest() {
    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var expiredDate = now.minusDays(1);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);
    var expiredDateRange = new EffectiveDateRange(effectiveDate, expiredDate);

    MethodOfPaymentEntity firstEntity =
        new MethodOfPaymentEntity("CLA", "Invoice to MOF Client Account", effectiveDateRange);
    methodOfPaymentRepository.saveAndFlush(firstEntity);
    MethodOfPaymentEntity secondEntity =
        new MethodOfPaymentEntity("CSH", "Cash Sale", effectiveDateRange);
    methodOfPaymentRepository.saveAndFlush(secondEntity);

    // This entity should not appear in the result list
    MethodOfPaymentEntity expiredEntity =
        new MethodOfPaymentEntity("V", "V for Vendetta", expiredDateRange);
    methodOfPaymentRepository.saveAndFlush(expiredEntity);

    List<MethodOfPaymentEntity> testEntityList =
        new ArrayList<>() {
          {
            add(firstEntity);
            add(secondEntity);
            add(expiredEntity);
          }
        };

    when(methodOfPaymentRepository.findAll()).thenReturn(testEntityList);

    MethodOfPaymentDto firstMethod =
        new MethodOfPaymentDto(
            firstEntity.getMethodOfPaymentCode(),
            firstEntity.getDescription(),
            firstEntity.getIsDefault());
    MethodOfPaymentDto secondMethod =
        new MethodOfPaymentDto(
            secondEntity.getMethodOfPaymentCode(),
            secondEntity.getDescription(),
            secondEntity.getIsDefault());

    List<MethodOfPaymentDto> testDtoList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
          }
        };

    List<MethodOfPaymentDto> resultList = methodOfPaymentService.getAllMethodOfPayment();

    Assertions.assertEquals(testEntityList.size() - 1, resultList.size());
    Assertions.assertEquals(testDtoList.size(), resultList.size());
    Assertions.assertEquals(testDtoList.get(0).code(), resultList.get(0).code());
    Assertions.assertEquals(testDtoList.get(0).description(), resultList.get(0).description());
    Assertions.assertEquals(testDtoList.get(1).code(), resultList.get(1).code());
    Assertions.assertEquals(testDtoList.get(1).description(), resultList.get(1).description());
  }
}
