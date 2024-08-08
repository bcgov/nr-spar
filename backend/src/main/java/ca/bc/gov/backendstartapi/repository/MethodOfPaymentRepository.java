package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link MethodOfPaymentEntity}. */
public interface MethodOfPaymentRepository extends JpaRepository<MethodOfPaymentEntity, String> {

  List<MethodOfPaymentEntity> findAllByMethodOfPaymentCodeIn(List<String> methods);
}
