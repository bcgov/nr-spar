package ca.bc.gov.oracleapi.repository.consep;

import org.springframework.data.jpa.repository.JpaRepository;

import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;

public interface TestResultRepository extends JpaRepository<TestResultEntity, String> {}
