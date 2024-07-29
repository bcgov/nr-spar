package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.MethodOfPaymentDto;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of method of payment. */
@Service
@RequiredArgsConstructor
public class MethodOfPaymentService {

  private final MethodOfPaymentRepository methodOfPaymentRepository;

  /** Fetch all valid method of payment from the repository. */
  public List<MethodOfPaymentDto> getAllMethodOfPayment() {
    SparLog.info("Fetching all method of payment for MethodOfPaymentDto");
    List<MethodOfPaymentDto> resultList = new ArrayList<>();
    getAllValidMethodOfPayments()
        .forEach(
            method -> {
              MethodOfPaymentDto methodToAdd =
                  new MethodOfPaymentDto(
                      method.getMethodOfPaymentCode(),
                      method.getDescription(),
                      method.getIsDefault());
              resultList.add(methodToAdd);
            });

    SparLog.info("{} valid payment method found for MethodOfPaymentDto.", resultList.size());
    return resultList;
  }

  /**
   * Fetches all valid Method of Payments from the database.
   *
   * @return A List of {@link MethodOfPaymentEntity}
   */
  public List<MethodOfPaymentEntity> getAllValidMethodOfPayments() {
    SparLog.info("Fetching all method of payment for MethodOfPaymentEntity");

    List<MethodOfPaymentEntity> list =
        methodOfPaymentRepository.findAll().stream().filter(x -> x.isValid()).toList();
    SparLog.info("{} valid payment method found for MethodOfPaymentEntity.", list.size());

    return list;
  }

  /**
   * Get all methods of payments given its codes.
   *
   * @param methods All the method of payment codes.
   * @return List of the method of payment entity.
   */
  public List<MethodOfPaymentEntity> getAllMethodsByCodeList(List<String> methods) {
    SparLog.info("Fetching list of payment methods with methods {}", methods);
    List<MethodOfPaymentEntity> list =
        methodOfPaymentRepository.findAllByMethodOfPaymentCodeIn(methods);
    SparLog.info("{} payment methods found", list.size());
    return list;
  }
}
