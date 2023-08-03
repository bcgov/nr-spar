package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of method of payment. */
@Slf4j
@Service
public class MethodOfPaymentService {
  private MethodOfPaymentRepository methodOfPaymentRepository;

  public MethodOfPaymentService(MethodOfPaymentRepository methodOfPaymentRepository) {
    this.methodOfPaymentRepository = methodOfPaymentRepository;
  }

  public List<CodeDescriptionDto> getAllMethodOfPayment() {
    log.info("Fetching all method of payment");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    methodOfPaymentRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getMethodOfPaymentCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }
}
