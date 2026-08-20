package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountSlotDto;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.util.ArrayList;
import java.util.List;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/** Maps between {@link GermCountEntity} and {@link GermCountDto}. */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GermCountMapper {

  // ── Entity → DTO ──────────────────────────────────────────────────────────
  // riaSkey and all audit fields are auto-wired by name; slots come from the helper.

  @Mapping(target = "slots", expression = "java(buildSlots(entity))")
  GermCountDto toDto(GermCountEntity entity);

  default List<GermCountSlotDto> buildSlots(GermCountEntity e) {
    List<GermCountSlotDto> result = new ArrayList<>(13);
    if (e.getDailyGermSkey1()  != null) result.add(slot(1,  e.getDailyGermSkey1(),  e.getCountDt1(),  e.getDayNoOfTest1(),  e.getRep1NoSeedsGerm1(),  e.getRep2NoSeedsGerm1(),  e.getRep3NoSeedsGerm1(),  e.getRep4NoSeedsGerm1(),  e.getCumulativeGerm1()));
    if (e.getDailyGermSkey2()  != null) result.add(slot(2,  e.getDailyGermSkey2(),  e.getCountDt2(),  e.getDayNoOfTest2(),  e.getRep1NoSeedsGerm2(),  e.getRep2NoSeedsGerm2(),  e.getRep3NoSeedsGerm2(),  e.getRep4NoSeedsGerm2(),  e.getCumulativeGerm2()));
    if (e.getDailyGermSkey3()  != null) result.add(slot(3,  e.getDailyGermSkey3(),  e.getCountDt3(),  e.getDayNoOfTest3(),  e.getRep1NoSeedsGerm3(),  e.getRep2NoSeedsGerm3(),  e.getRep3NoSeedsGerm3(),  e.getRep4NoSeedsGerm3(),  e.getCumulativeGerm3()));
    if (e.getDailyGermSkey4()  != null) result.add(slot(4,  e.getDailyGermSkey4(),  e.getCountDt4(),  e.getDayNoOfTest4(),  e.getRep1NoSeedsGerm4(),  e.getRep2NoSeedsGerm4(),  e.getRep3NoSeedsGerm4(),  e.getRep4NoSeedsGerm4(),  e.getCumulativeGerm4()));
    if (e.getDailyGermSkey5()  != null) result.add(slot(5,  e.getDailyGermSkey5(),  e.getCountDt5(),  e.getDayNoOfTest5(),  e.getRep1NoSeedsGerm5(),  e.getRep2NoSeedsGerm5(),  e.getRep3NoSeedsGerm5(),  e.getRep4NoSeedsGerm5(),  e.getCumulativeGerm5()));
    if (e.getDailyGermSkey6()  != null) result.add(slot(6,  e.getDailyGermSkey6(),  e.getCountDt6(),  e.getDayNoOfTest6(),  e.getRep1NoSeedsGerm6(),  e.getRep2NoSeedsGerm6(),  e.getRep3NoSeedsGerm6(),  e.getRep4NoSeedsGerm6(),  e.getCumulativeGerm6()));
    if (e.getDailyGermSkey7()  != null) result.add(slot(7,  e.getDailyGermSkey7(),  e.getCountDt7(),  e.getDayNoOfTest7(),  e.getRep1NoSeedsGerm7(),  e.getRep2NoSeedsGerm7(),  e.getRep3NoSeedsGerm7(),  e.getRep4NoSeedsGerm7(),  e.getCumulativeGerm7()));
    if (e.getDailyGermSkey8()  != null) result.add(slot(8,  e.getDailyGermSkey8(),  e.getCountDt8(),  e.getDayNoOfTest8(),  e.getRep1NoSeedsGerm8(),  e.getRep2NoSeedsGerm8(),  e.getRep3NoSeedsGerm8(),  e.getRep4NoSeedsGerm8(),  e.getCumulativeGerm8()));
    if (e.getDailyGermSkey9()  != null) result.add(slot(9,  e.getDailyGermSkey9(),  e.getCountDt9(),  e.getDayNoOfTest9(),  e.getRep1NoSeedsGerm9(),  e.getRep2NoSeedsGerm9(),  e.getRep3NoSeedsGerm9(),  e.getRep4NoSeedsGerm9(),  e.getCumulativeGerm9()));
    if (e.getDailyGermSkey10() != null) result.add(slot(10, e.getDailyGermSkey10(), e.getCountDt10(), e.getDayNoOfTest10(), e.getRep1NoSeedsGerm10(), e.getRep2NoSeedsGerm10(), e.getRep3NoSeedsGerm10(), e.getRep4NoSeedsGerm10(), e.getCumulativeGerm10()));
    if (e.getDailyGermSkey11() != null) result.add(slot(11, e.getDailyGermSkey11(), e.getCountDt11(), e.getDayNoOfTest11(), e.getRep1NoSeedsGerm11(), e.getRep2NoSeedsGerm11(), e.getRep3NoSeedsGerm11(), e.getRep4NoSeedsGerm11(), e.getCumulativeGerm11()));
    if (e.getDailyGermSkey12() != null) result.add(slot(12, e.getDailyGermSkey12(), e.getCountDt12(), e.getDayNoOfTest12(), e.getRep1NoSeedsGerm12(), e.getRep2NoSeedsGerm12(), e.getRep3NoSeedsGerm12(), e.getRep4NoSeedsGerm12(), e.getCumulativeGerm12()));
    if (e.getDailyGermSkey13() != null) result.add(slot(13, e.getDailyGermSkey13(), e.getCountDt13(), e.getDayNoOfTest13(), e.getRep1NoSeedsGerm13(), e.getRep2NoSeedsGerm13(), e.getRep3NoSeedsGerm13(), e.getRep4NoSeedsGerm13(), e.getCumulativeGerm13()));
    return result;
  }

  private static GermCountSlotDto slot(
      int idx,
      java.math.BigDecimal skey,
      java.time.LocalDate dt,
      Integer day,
      Integer r1, Integer r2, Integer r3, Integer r4,
      java.math.BigDecimal cum) {
    return new GermCountSlotDto(idx, skey, dt, day, r1, r2, r3, r4, cum);
  }

  // ── DTO → Entity ──────────────────────────────────────────────────────────
  // riaSkey and all audit fields are auto-wired by name.
  // The numbered slot columns are populated by @AfterMapping.

  GermCountEntity toEntity(GermCountDto dto);

  @AfterMapping
  default void applySlots(GermCountDto dto, @MappingTarget GermCountEntity e) {
    if (dto.slots() == null) {
      return;
    }
    applySlots(dto.slots(), e);
  }

  /**
   * Writes the numbered slot columns on {@code e} for each slot, keyed by its slotIndex.
   *
   * @param slots the slot observations to write (each slotIndex must be 1-13)
   * @param e     the entity to populate
   */
  default void applySlots(List<GermCountSlotDto> slots, @MappingTarget GermCountEntity e) {
    if (slots == null) {
      return;
    }
    for (GermCountSlotDto s : slots) {
      switch (s.slotIndex()) {
        case 1  -> { e.setDailyGermSkey1(s.dailyGermSkey());  e.setCountDt1(s.countDt());  e.setDayNoOfTest1(s.dayNoOfTest());  e.setRep1NoSeedsGerm1(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm1(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm1(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm1(s.rep4NoSeedsGerm());  e.setCumulativeGerm1(s.cumulativeGerm()); }
        case 2  -> { e.setDailyGermSkey2(s.dailyGermSkey());  e.setCountDt2(s.countDt());  e.setDayNoOfTest2(s.dayNoOfTest());  e.setRep1NoSeedsGerm2(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm2(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm2(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm2(s.rep4NoSeedsGerm());  e.setCumulativeGerm2(s.cumulativeGerm()); }
        case 3  -> { e.setDailyGermSkey3(s.dailyGermSkey());  e.setCountDt3(s.countDt());  e.setDayNoOfTest3(s.dayNoOfTest());  e.setRep1NoSeedsGerm3(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm3(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm3(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm3(s.rep4NoSeedsGerm());  e.setCumulativeGerm3(s.cumulativeGerm()); }
        case 4  -> { e.setDailyGermSkey4(s.dailyGermSkey());  e.setCountDt4(s.countDt());  e.setDayNoOfTest4(s.dayNoOfTest());  e.setRep1NoSeedsGerm4(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm4(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm4(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm4(s.rep4NoSeedsGerm());  e.setCumulativeGerm4(s.cumulativeGerm()); }
        case 5  -> { e.setDailyGermSkey5(s.dailyGermSkey());  e.setCountDt5(s.countDt());  e.setDayNoOfTest5(s.dayNoOfTest());  e.setRep1NoSeedsGerm5(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm5(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm5(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm5(s.rep4NoSeedsGerm());  e.setCumulativeGerm5(s.cumulativeGerm()); }
        case 6  -> { e.setDailyGermSkey6(s.dailyGermSkey());  e.setCountDt6(s.countDt());  e.setDayNoOfTest6(s.dayNoOfTest());  e.setRep1NoSeedsGerm6(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm6(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm6(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm6(s.rep4NoSeedsGerm());  e.setCumulativeGerm6(s.cumulativeGerm()); }
        case 7  -> { e.setDailyGermSkey7(s.dailyGermSkey());  e.setCountDt7(s.countDt());  e.setDayNoOfTest7(s.dayNoOfTest());  e.setRep1NoSeedsGerm7(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm7(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm7(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm7(s.rep4NoSeedsGerm());  e.setCumulativeGerm7(s.cumulativeGerm()); }
        case 8  -> { e.setDailyGermSkey8(s.dailyGermSkey());  e.setCountDt8(s.countDt());  e.setDayNoOfTest8(s.dayNoOfTest());  e.setRep1NoSeedsGerm8(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm8(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm8(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm8(s.rep4NoSeedsGerm());  e.setCumulativeGerm8(s.cumulativeGerm()); }
        case 9  -> { e.setDailyGermSkey9(s.dailyGermSkey());  e.setCountDt9(s.countDt());  e.setDayNoOfTest9(s.dayNoOfTest());  e.setRep1NoSeedsGerm9(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm9(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm9(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm9(s.rep4NoSeedsGerm());  e.setCumulativeGerm9(s.cumulativeGerm()); }
        case 10 -> { e.setDailyGermSkey10(s.dailyGermSkey()); e.setCountDt10(s.countDt()); e.setDayNoOfTest10(s.dayNoOfTest()); e.setRep1NoSeedsGerm10(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm10(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm10(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm10(s.rep4NoSeedsGerm()); e.setCumulativeGerm10(s.cumulativeGerm()); }
        case 11 -> { e.setDailyGermSkey11(s.dailyGermSkey()); e.setCountDt11(s.countDt()); e.setDayNoOfTest11(s.dayNoOfTest()); e.setRep1NoSeedsGerm11(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm11(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm11(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm11(s.rep4NoSeedsGerm()); e.setCumulativeGerm11(s.cumulativeGerm()); }
        case 12 -> { e.setDailyGermSkey12(s.dailyGermSkey()); e.setCountDt12(s.countDt()); e.setDayNoOfTest12(s.dayNoOfTest()); e.setRep1NoSeedsGerm12(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm12(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm12(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm12(s.rep4NoSeedsGerm()); e.setCumulativeGerm12(s.cumulativeGerm()); }
        case 13 -> { e.setDailyGermSkey13(s.dailyGermSkey()); e.setCountDt13(s.countDt()); e.setDayNoOfTest13(s.dayNoOfTest()); e.setRep1NoSeedsGerm13(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm13(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm13(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm13(s.rep4NoSeedsGerm()); e.setCumulativeGerm13(s.cumulativeGerm()); }
        default -> throw new IllegalArgumentException("Invalid slot index: " + s.slotIndex());
      }
    }
  }
}
