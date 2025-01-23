package ca.bc.gov.oracleapi.repository.consep;

import org.springframework.data.jpa.repository.JpaRepository;

import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;

public interface ReplicateRepository extends JpaRepository<ReplicateEntity, String> {}
