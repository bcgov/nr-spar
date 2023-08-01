package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.GameticMethodologyEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link GameticMethodologyEntity}. */
public interface GameticMethodologyRepository
    extends JpaRepository<GameticMethodologyEntity, String> {
  List<GameticMethodologyEntity> findAll();
}
