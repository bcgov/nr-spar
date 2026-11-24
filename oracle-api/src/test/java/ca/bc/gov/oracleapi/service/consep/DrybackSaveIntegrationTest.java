package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ca.bc.gov.oracleapi.dto.consep.DrybackSaveDto;
import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.server.ResponseStatusException;

/** Runs the dryback save against H2 (Oracle mode): locked update, dependency walk, shift. */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:drybacksavetestdb;MODE=Oracle;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=always",
    "spring.sql.init.schema-locations=classpath:schema-consep-only.sql"
})
@Import(DrybackScreenService.class)
class DrybackSaveIntegrationTest {

  private static final LocalDateTime TS = LocalDateTime.of(2026, 3, 1, 8, 0, 0);

  @Autowired
  private DrybackScreenService service;

  @Autowired
  private TestEntityManager em;

  private ActivityEntity persist(String type, LocalDate plannedStart, LocalDate plannedEnd) {
    ActivityEntity a = new ActivityEntity();
    a.setActivityTypeCode(type);
    a.setSeedlotNumber("00777");
    a.setPlannedStartDate(plannedStart);
    a.setPlannedEndDate(plannedEnd);
    a.setRevisedStartDate(plannedStart);
    a.setRevisedEndDate(plannedEnd);
    a.setUpdateTimestamp(TS);
    return em.persist(a);
  }

  private void dependency(ActivityEntity prereq, ActivityEntity dependant) {
    em.getEntityManager()
        .createNativeQuery("INSERT INTO CONSEP.CNS_T_RIA_DEPENDANCY VALUES (?, ?)")
        .setParameter(1, prereq.getRiaKey())
        .setParameter(2, dependant.getRiaKey())
        .executeUpdate();
  }

  private static DrybackSaveDto dto(LocalDateTime begin, LocalDateTime timestamp) {
    return new DrybackSaveDto(begin, null, new BigDecimal("34.4"), new BigDecimal("26.438"),
        new BigDecimal("25.080"), new BigDecimal("17.812"), 65, new BigDecimal("23.512"),
        new BigDecimal("25.320"), new BigDecimal("24.100"), "saved", timestamp);
  }

  @Test
  void save_persistsValues_andShiftsDependencyChain() {
    ActivityEntity dryback = persist("G64", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 10));
    ActivityEntity child = persist("G10", LocalDate.of(2026, 3, 11), LocalDate.of(2026, 3, 20));
    ActivityEntity grandChild = persist("G10", null, LocalDate.of(2026, 3, 25));
    ActivityEntity unrelated = persist("G10", LocalDate.of(2026, 3, 11), LocalDate.of(2026, 3, 20));
    em.flush();
    dependency(dryback, child);
    dependency(child, grandChild);
    em.clear();

    DrybackScreenDto result =
        service.saveDryback(dryback.getRiaKey(), dto(LocalDateTime.of(2026, 3, 4, 9, 0), TS));
    em.flush();
    em.clear();

    assertThat(result.getDrybackWeight()).isEqualByComparingTo("25.080");
    assertThat(result.getRiaComment()).isEqualTo("saved");
    assertThat(result.getUpdateTimestamp()).isNotEqualTo(TS);

    ActivityEntity savedDryback = em.find(ActivityEntity.class, dryback.getRiaKey());
    assertThat(savedDryback.getRevisedStartDate()).isEqualTo(LocalDate.of(2026, 3, 4));
    assertThat(savedDryback.getRevisedEndDate()).isEqualTo(LocalDate.of(2026, 3, 13));
    assertThat(savedDryback.getStratEndWeight()).isEqualByComparingTo("24.100");

    ActivityEntity savedChild = em.find(ActivityEntity.class, child.getRiaKey());
    assertThat(savedChild.getRevisedStartDate()).isEqualTo(LocalDate.of(2026, 3, 14));
    assertThat(savedChild.getRevisedEndDate()).isEqualTo(LocalDate.of(2026, 3, 23));
    assertThat(savedChild.getUpdateTimestamp()).isNotEqualTo(TS);

    ActivityEntity savedGrandChild = em.find(ActivityEntity.class, grandChild.getRiaKey());
    assertThat(savedGrandChild.getRevisedStartDate()).isNull();
    assertThat(savedGrandChild.getRevisedEndDate()).isEqualTo(LocalDate.of(2026, 3, 28));

    ActivityEntity savedUnrelated = em.find(ActivityEntity.class, unrelated.getRiaKey());
    assertThat(savedUnrelated.getRevisedStartDate()).isEqualTo(LocalDate.of(2026, 3, 11));
    assertThat(savedUnrelated.getUpdateTimestamp()).isEqualTo(TS);
  }

  @Test
  void save_correctingBackToPlanned_movesDependantsBack() {
    ActivityEntity dryback = persist("G64", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 10));
    ActivityEntity child = persist("G10", LocalDate.of(2026, 3, 11), LocalDate.of(2026, 3, 20));
    em.flush();
    dependency(dryback, child);
    em.clear();

    DrybackScreenDto first =
        service.saveDryback(dryback.getRiaKey(), dto(LocalDateTime.of(2026, 3, 4, 9, 0), TS));
    em.flush();
    em.clear();
    service.saveDryback(dryback.getRiaKey(),
        dto(LocalDateTime.of(2026, 3, 1, 9, 0), first.getUpdateTimestamp()));
    em.flush();
    em.clear();

    ActivityEntity savedChild = em.find(ActivityEntity.class, child.getRiaKey());
    assertThat(savedChild.getRevisedStartDate()).isEqualTo(LocalDate.of(2026, 3, 11));
    assertThat(savedChild.getRevisedEndDate()).isEqualTo(LocalDate.of(2026, 3, 20));
  }

  @Test
  void save_staleTimestamp_conflicts_andChangesNothing() {
    ActivityEntity dryback = persist("G64", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 10));
    em.flush();
    em.clear();

    assertThatThrownBy(() -> service.saveDryback(
        dryback.getRiaKey(), dto(LocalDateTime.of(2026, 3, 4, 9, 0), TS.minusSeconds(1))))
        .isInstanceOfSatisfying(ResponseStatusException.class,
            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

    em.clear();
    ActivityEntity unchanged = em.find(ActivityEntity.class, dryback.getRiaKey());
    assertThat(unchanged.getRevisedStartDate()).isEqualTo(LocalDate.of(2026, 3, 1));
    assertThat(unchanged.getDrybackWeight()).isNull();
  }
}
