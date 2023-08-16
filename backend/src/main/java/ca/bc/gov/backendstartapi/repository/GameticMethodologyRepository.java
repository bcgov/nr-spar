package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.GameticMethodologyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link GameticMethodologyEntity}. */
public interface GameticMethodologyRepository
    extends JpaRepository<GameticMethodologyEntity, String> {}
