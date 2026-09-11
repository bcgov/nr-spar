package ca.bc.gov.oracleapi.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountSlotDto;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

class GermCountMapperTest {

  private GermCountMapper mapper;

  @BeforeEach
  void setUp() {
    mapper = Mappers.getMapper(GermCountMapper.class);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Builds an entity with all 13 slots fully populated. */
  private GermCountEntity fullEntity() {
    GermCountEntity e = new GermCountEntity();
    e.setRiaSkey(new BigDecimal("881191"));
    e.setEntryUserid("USER1");
    e.setEntryTimestamp(LocalDateTime.of(2026, 1, 1, 0, 0));
    e.setUpdateUserid("USER2");
    e.setUpdateTimestamp(LocalDateTime.of(2026, 6, 1, 0, 0));

    for (int i = 1; i <= 13; i++) {
      setSlotOnEntity(e, i);
    }
    return e;
  }

  /** Populates all fields for slot {@code idx} on the entity. */
  private void setSlotOnEntity(GermCountEntity e, int idx) {
    BigDecimal skey = BigDecimal.valueOf(1000L + idx);
    LocalDate dt = LocalDate.of(2026, 4, idx);
    int day = idx;
    int r1 = idx * 10;
    int r2 = idx * 10 + 1;
    int r3 = idx * 10 + 2;
    int r4 = idx * 10 + 3;
    BigDecimal cum = new BigDecimal("0.1000").add(BigDecimal.valueOf(idx * 0.01));

    switch (idx) {
      case 1  -> { e.setDailyGermSkey1(skey);  e.setCountDt1(dt);  e.setDayNoOfTest1(day);  e.setRep1NoSeedsGerm1(r1);  e.setRep2NoSeedsGerm1(r2);  e.setRep3NoSeedsGerm1(r3);  e.setRep4NoSeedsGerm1(r4);  e.setCumulativeGerm1(cum); }
      case 2  -> { e.setDailyGermSkey2(skey);  e.setCountDt2(dt);  e.setDayNoOfTest2(day);  e.setRep1NoSeedsGerm2(r1);  e.setRep2NoSeedsGerm2(r2);  e.setRep3NoSeedsGerm2(r3);  e.setRep4NoSeedsGerm2(r4);  e.setCumulativeGerm2(cum); }
      case 3  -> { e.setDailyGermSkey3(skey);  e.setCountDt3(dt);  e.setDayNoOfTest3(day);  e.setRep1NoSeedsGerm3(r1);  e.setRep2NoSeedsGerm3(r2);  e.setRep3NoSeedsGerm3(r3);  e.setRep4NoSeedsGerm3(r4);  e.setCumulativeGerm3(cum); }
      case 4  -> { e.setDailyGermSkey4(skey);  e.setCountDt4(dt);  e.setDayNoOfTest4(day);  e.setRep1NoSeedsGerm4(r1);  e.setRep2NoSeedsGerm4(r2);  e.setRep3NoSeedsGerm4(r3);  e.setRep4NoSeedsGerm4(r4);  e.setCumulativeGerm4(cum); }
      case 5  -> { e.setDailyGermSkey5(skey);  e.setCountDt5(dt);  e.setDayNoOfTest5(day);  e.setRep1NoSeedsGerm5(r1);  e.setRep2NoSeedsGerm5(r2);  e.setRep3NoSeedsGerm5(r3);  e.setRep4NoSeedsGerm5(r4);  e.setCumulativeGerm5(cum); }
      case 6  -> { e.setDailyGermSkey6(skey);  e.setCountDt6(dt);  e.setDayNoOfTest6(day);  e.setRep1NoSeedsGerm6(r1);  e.setRep2NoSeedsGerm6(r2);  e.setRep3NoSeedsGerm6(r3);  e.setRep4NoSeedsGerm6(r4);  e.setCumulativeGerm6(cum); }
      case 7  -> { e.setDailyGermSkey7(skey);  e.setCountDt7(dt);  e.setDayNoOfTest7(day);  e.setRep1NoSeedsGerm7(r1);  e.setRep2NoSeedsGerm7(r2);  e.setRep3NoSeedsGerm7(r3);  e.setRep4NoSeedsGerm7(r4);  e.setCumulativeGerm7(cum); }
      case 8  -> { e.setDailyGermSkey8(skey);  e.setCountDt8(dt);  e.setDayNoOfTest8(day);  e.setRep1NoSeedsGerm8(r1);  e.setRep2NoSeedsGerm8(r2);  e.setRep3NoSeedsGerm8(r3);  e.setRep4NoSeedsGerm8(r4);  e.setCumulativeGerm8(cum); }
      case 9  -> { e.setDailyGermSkey9(skey);  e.setCountDt9(dt);  e.setDayNoOfTest9(day);  e.setRep1NoSeedsGerm9(r1);  e.setRep2NoSeedsGerm9(r2);  e.setRep3NoSeedsGerm9(r3);  e.setRep4NoSeedsGerm9(r4);  e.setCumulativeGerm9(cum); }
      case 10 -> { e.setDailyGermSkey10(skey); e.setCountDt10(dt); e.setDayNoOfTest10(day); e.setRep1NoSeedsGerm10(r1); e.setRep2NoSeedsGerm10(r2); e.setRep3NoSeedsGerm10(r3); e.setRep4NoSeedsGerm10(r4); e.setCumulativeGerm10(cum); }
      case 11 -> { e.setDailyGermSkey11(skey); e.setCountDt11(dt); e.setDayNoOfTest11(day); e.setRep1NoSeedsGerm11(r1); e.setRep2NoSeedsGerm11(r2); e.setRep3NoSeedsGerm11(r3); e.setRep4NoSeedsGerm11(r4); e.setCumulativeGerm11(cum); }
      case 12 -> { e.setDailyGermSkey12(skey); e.setCountDt12(dt); e.setDayNoOfTest12(day); e.setRep1NoSeedsGerm12(r1); e.setRep2NoSeedsGerm12(r2); e.setRep3NoSeedsGerm12(r3); e.setRep4NoSeedsGerm12(r4); e.setCumulativeGerm12(cum); }
      case 13 -> { e.setDailyGermSkey13(skey); e.setCountDt13(dt); e.setDayNoOfTest13(day); e.setRep1NoSeedsGerm13(r1); e.setRep2NoSeedsGerm13(r2); e.setRep3NoSeedsGerm13(r3); e.setRep4NoSeedsGerm13(r4); e.setCumulativeGerm13(cum); }
      default -> throw new IllegalArgumentException("idx out of range: " + idx);
    }
  }

  /** Reads a named field from the entity reflectively for the given slot index. */
  private <T> T getEntitySlotField(GermCountEntity e, int idx, String field) throws Exception {
    String methodName = "get" + Character.toUpperCase(field.charAt(0)) + field.substring(1) + idx;
    @SuppressWarnings("unchecked")
    T result = (T) GermCountEntity.class.getMethod(methodName).invoke(e);
    return result;
  }

  // ── toDto: buildSlots ────────────────────────────────────────────────────

  @Test
  @DisplayName("toDto with no slots populated returns empty list")
  void toDto_noSlotsPopulated_returnsEmptySlotList() {
    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(new BigDecimal("100"));

    GermCountDto dto = mapper.toDto(entity);

    assertThat(dto.slots()).isEmpty();
  }

  @Test
  @DisplayName("toDto with all 13 slots populated returns list of 13")
  void toDto_allSlotsPopulated_returns13Slots() {
    GermCountDto dto = mapper.toDto(fullEntity());

    assertThat(dto.slots()).hasSize(13);
  }

  @Test
  @DisplayName("toDto slot indices match their position values 1-13")
  void toDto_allSlotsPopulated_slotIndicesAreCorrect() {
    GermCountDto dto = mapper.toDto(fullEntity());

    List<Integer> indices = dto.slots().stream().map(GermCountSlotDto::slotIndex).toList();
    assertThat(indices).containsExactly(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
  }

  @Test
  @DisplayName("toDto only includes slots whose dailyGermSkey is non-null")
  void toDto_partialSlots_onlyPopulatedSlotsIncluded() {
    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(new BigDecimal("200"));
    setSlotOnEntity(entity, 1);
    setSlotOnEntity(entity, 7);
    setSlotOnEntity(entity, 13);

    GermCountDto dto = mapper.toDto(entity);

    assertThat(dto.slots()).hasSize(3);
    assertThat(dto.slots().stream().map(GermCountSlotDto::slotIndex).toList())
        .containsExactly(1, 7, 13);
  }

  @Test
  @DisplayName("toDto keeps a dated slot that has no abnormal row, so no key")
  void toDto_datedSlotWithoutSkey_isStillReturned() {
    // DAILY_GERM_SKEY is only minted for a day that has abnormals to point at,
    // so a plain day saved through the germination screen has none. Keying
    // presence off it dropped that day from every later read.
    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(new BigDecimal("300"));
    entity.setCountDt2(LocalDate.of(2026, 4, 2));
    entity.setDayNoOfTest2(2);
    entity.setRep1NoSeedsGerm2(7);

    GermCountDto dto = mapper.toDto(entity);

    assertThat(dto.slots()).hasSize(1);
    assertEquals(2, dto.slots().get(0).slotIndex());
    assertNull(dto.slots().get(0).dailyGermSkey());
    assertEquals(7, dto.slots().get(0).rep1NoSeedsGerm());
  }

  @Test
  @DisplayName("toDto still returns a legacy slot that carries a key but no date")
  void toDto_slotWithSkeyButNoDate_isStillReturned() {
    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(new BigDecimal("301"));
    entity.setDailyGermSkey3(new BigDecimal("9001"));

    GermCountDto dto = mapper.toDto(entity);

    assertThat(dto.slots()).hasSize(1);
    assertEquals(3, dto.slots().get(0).slotIndex());
  }

  @Test
  @DisplayName("toDto maps slot fields correctly for each of the 13 slots")
  void toDto_allSlotsPopulated_slotFieldsAreCorrect() {
    GermCountEntity entity = fullEntity();
    GermCountDto dto = mapper.toDto(entity);

    for (int i = 1; i <= 13; i++) {
      GermCountSlotDto slot = dto.slots().get(i - 1);
      assertThat(slot.slotIndex()).as("slotIndex for slot %d", i).isEqualTo(i);
      assertThat(slot.dailyGermSkey()).as("dailyGermSkey for slot %d", i)
          .isEqualByComparingTo(BigDecimal.valueOf(1000L + i));
      assertThat(slot.countDt()).as("countDt for slot %d", i)
          .isEqualTo(LocalDate.of(2026, 4, i));
      assertThat(slot.dayNoOfTest()).as("dayNoOfTest for slot %d", i).isEqualTo(i);
      assertThat(slot.rep1NoSeedsGerm()).as("rep1 for slot %d", i).isEqualTo(i * 10);
      assertThat(slot.rep2NoSeedsGerm()).as("rep2 for slot %d", i).isEqualTo(i * 10 + 1);
      assertThat(slot.rep3NoSeedsGerm()).as("rep3 for slot %d", i).isEqualTo(i * 10 + 2);
      assertThat(slot.rep4NoSeedsGerm()).as("rep4 for slot %d", i).isEqualTo(i * 10 + 3);
    }
  }

  @Test
  @DisplayName("toDto maps riaSkey and all audit fields from entity")
  void toDto_mapsHeaderAndAuditFields() {
    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(new BigDecimal("999"));
    entity.setEntryUserid("ENTRY_U");
    entity.setEntryTimestamp(LocalDateTime.of(2025, 3, 15, 8, 30));
    entity.setUpdateUserid("UPDATE_U");
    entity.setUpdateTimestamp(LocalDateTime.of(2026, 1, 20, 12, 0));

    GermCountDto dto = mapper.toDto(entity);

    assertThat(dto.riaSkey()).isEqualByComparingTo(new BigDecimal("999"));
    assertThat(dto.entryUserid()).isEqualTo("ENTRY_U");
    assertThat(dto.entryTimestamp()).isEqualTo(LocalDateTime.of(2025, 3, 15, 8, 30));
    assertThat(dto.updateUserid()).isEqualTo("UPDATE_U");
    assertThat(dto.updateTimestamp()).isEqualTo(LocalDateTime.of(2026, 1, 20, 12, 0));
  }

  // ── toEntity: applySlots ─────────────────────────────────────────────────

  @Test
  @DisplayName("toEntity with null slots list leaves entity slot columns null")
  void toEntity_nullSlots_entitySlotColumnsRemainNull() {
    GermCountDto dto = new GermCountDto(new BigDecimal("300"), null, null, null, null, null);

    GermCountEntity entity = mapper.toEntity(dto);

    assertThat(entity.getDailyGermSkey1()).isNull();
    assertThat(entity.getDailyGermSkey13()).isNull();
  }

  @Test
  @DisplayName("toEntity maps riaSkey and audit fields from DTO")
  void toEntity_mapsHeaderAndAuditFields() {
    LocalDateTime entryTs = LocalDateTime.of(2025, 5, 10, 9, 0);
    LocalDateTime updateTs = LocalDateTime.of(2026, 2, 28, 17, 45);
    GermCountDto dto = new GermCountDto(
        new BigDecimal("42"),
        List.of(),
        "E_USER",
        entryTs,
        "U_USER",
        updateTs);

    GermCountEntity entity = mapper.toEntity(dto);

    assertThat(entity.getRiaSkey()).isEqualByComparingTo(new BigDecimal("42"));
    assertThat(entity.getEntryUserid()).isEqualTo("E_USER");
    assertThat(entity.getEntryTimestamp()).isEqualTo(entryTs);
    assertThat(entity.getUpdateUserid()).isEqualTo("U_USER");
    assertThat(entity.getUpdateTimestamp()).isEqualTo(updateTs);
  }

  @Test
  @DisplayName("toEntity applies all 13 slot DTOs to the correct entity columns")
  void toEntity_allSlots_populatesAllEntityColumns() throws Exception {
    List<GermCountSlotDto> slots = buildAllSlotDtos();
    GermCountDto dto = new GermCountDto(new BigDecimal("881191"), slots, null, null, null, null);

    GermCountEntity entity = mapper.toEntity(dto);

    for (int i = 1; i <= 13; i++) {
      BigDecimal expectedSkey = BigDecimal.valueOf(1000L + i);
      LocalDate expectedDt = LocalDate.of(2026, 4, i);

      assertThat((BigDecimal) getEntitySlotField(entity, i, "dailyGermSkey"))
          .as("dailyGermSkey%d", i).isEqualByComparingTo(expectedSkey);
      assertThat((LocalDate) getEntitySlotField(entity, i, "countDt"))
          .as("countDt%d", i).isEqualTo(expectedDt);
      assertThat((Integer) getEntitySlotField(entity, i, "dayNoOfTest"))
          .as("dayNoOfTest%d", i).isEqualTo(i);
      assertThat((Integer) getEntitySlotField(entity, i, "rep1NoSeedsGerm"))
          .as("rep1NoSeedsGerm%d", i).isEqualTo(i * 10);
      assertThat((Integer) getEntitySlotField(entity, i, "rep2NoSeedsGerm"))
          .as("rep2NoSeedsGerm%d", i).isEqualTo(i * 10 + 1);
      assertThat((Integer) getEntitySlotField(entity, i, "rep3NoSeedsGerm"))
          .as("rep3NoSeedsGerm%d", i).isEqualTo(i * 10 + 2);
      assertThat((Integer) getEntitySlotField(entity, i, "rep4NoSeedsGerm"))
          .as("rep4NoSeedsGerm%d", i).isEqualTo(i * 10 + 3);
    }
  }

  @Test
  @DisplayName("toEntity with invalid slot index throws IllegalArgumentException")
  void toEntity_invalidSlotIndex_throwsIllegalArgumentException() {
    GermCountSlotDto badSlot = new GermCountSlotDto(
        99, new BigDecimal("9999"), LocalDate.now(), 1, 1, 1, 1, 1, BigDecimal.ONE);
    GermCountDto dto = new GermCountDto(
        new BigDecimal("1"), List.of(badSlot), null, null, null, null);

    assertThatThrownBy(() -> mapper.toEntity(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("99");
  }

  // ── applySlots(List<GermCountSlotDto>, GermCountEntity) ─────────────────────

  @Test
  void applySlots_setsNumberedColumns_forGivenSlots() {
    GermCountEntity e = new GermCountEntity();

    mapper.applySlots(
        List.of(
            new GermCountSlotDto(1, new BigDecimal("1001"), LocalDate.of(2026, 4, 1), 1, 10, 12, 11, 9, new BigDecimal("42.0000")),
            new GermCountSlotDto(3, new BigDecimal("1003"), LocalDate.of(2026, 4, 3), 3, 5, 6, 7, 8, new BigDecimal("100.0000"))),
        e);

    assertEquals(new BigDecimal("1001"), e.getDailyGermSkey1());
    assertEquals(LocalDate.of(2026, 4, 1), e.getCountDt1());
    assertEquals(10, e.getRep1NoSeedsGerm1());
    assertEquals(new BigDecimal("42.0000"), e.getCumulativeGerm1());
    assertEquals(new BigDecimal("1003"), e.getDailyGermSkey3());
    assertEquals(8, e.getRep4NoSeedsGerm3());
    assertNull(e.getDailyGermSkey2());
  }

  @Test
  void applySlots_throws_forInvalidIndex() {
    GermCountEntity e = new GermCountEntity();
    List<GermCountSlotDto> bad =
        List.of(new GermCountSlotDto(14, null, null, null, 0, 0, 0, 0, null));
    assertThrows(IllegalArgumentException.class, () -> mapper.applySlots(bad, e));
  }

  // ── Roundtrip ────────────────────────────────────────────────────────────

  @Test
  @DisplayName("Entity → DTO → Entity roundtrip preserves all 13 slot values")
  void roundtrip_allSlots_preservesAllValues() {
    GermCountEntity original = fullEntity();

    GermCountDto dto = mapper.toDto(original);
    GermCountEntity restored = mapper.toEntity(dto);

    assertThat(restored.getRiaSkey()).isEqualByComparingTo(original.getRiaSkey());

    for (int i = 1; i <= 13; i++) {
      BigDecimal expectedSkey = BigDecimal.valueOf(1000L + i);
      assertThat(restored.getDailyGermSkey1()).isNotNull();
      try {
        assertThat((BigDecimal) getEntitySlotField(restored, i, "dailyGermSkey"))
            .as("roundtrip dailyGermSkey%d", i).isEqualByComparingTo(expectedSkey);
        assertThat((LocalDate) getEntitySlotField(restored, i, "countDt"))
            .as("roundtrip countDt%d", i).isEqualTo(LocalDate.of(2026, 4, i));
      } catch (Exception ex) {
        throw new RuntimeException(ex);
      }
    }
  }

  @Test
  @DisplayName("Roundtrip preserves non-contiguous sparse slot set")
  void roundtrip_sparseSlots_preservesSparseSet() {
    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(new BigDecimal("500"));
    setSlotOnEntity(entity, 3);
    setSlotOnEntity(entity, 9);

    GermCountDto dto = mapper.toDto(entity);
    GermCountEntity restored = mapper.toEntity(dto);

    assertThat(restored.getDailyGermSkey3()).isEqualByComparingTo(BigDecimal.valueOf(1003));
    assertThat(restored.getDailyGermSkey9()).isEqualByComparingTo(BigDecimal.valueOf(1009));
    assertThat(restored.getDailyGermSkey1()).isNull();
    assertThat(restored.getDailyGermSkey13()).isNull();
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private List<GermCountSlotDto> buildAllSlotDtos() {
    return java.util.stream.IntStream.rangeClosed(1, 13)
        .mapToObj(i -> new GermCountSlotDto(
            i,
            BigDecimal.valueOf(1000L + i),
            LocalDate.of(2026, 4, i),
            i,
            i * 10,
            i * 10 + 1,
            i * 10 + 2,
            i * 10 + 3,
            new BigDecimal("0.1000").add(BigDecimal.valueOf(i * 0.01))))
        .toList();
  }
}
