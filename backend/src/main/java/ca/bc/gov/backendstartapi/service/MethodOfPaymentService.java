package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.MethodOfPaymentDto;
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

  /** Fetch all valid method of payment from the repository. */
  public List<MethodOfPaymentDto> getAllMethodOfPayment() {
    log.info("Fetching all method of payment");
    List<MethodOfPaymentDto> resultList = new ArrayList<>();
    methodOfPaymentRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              MethodOfPaymentDto methodToAdd =
                  new MethodOfPaymentDto(
                      method.getMethodOfPaymentCode(),
                      method.getDescription(),
                      method.getIsDefault());
              resultList.add(methodToAdd);
            });

    return resultList;
  }
}
