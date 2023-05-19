package ca.bc.gov.backendstartapi.vo;

import ca.bc.gov.backendstartapi.dto.orchard.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.orchard.ParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import java.math.BigDecimal;
import java.math.MathContext;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ParentTreeDataTest {

  private static final MathContext mathContext = new MathContext(15);

  private List<ParentTreeData> parentTreeData;
  private BigDecimal totalPollen;
  private BigDecimal totalCones;

  @BeforeEach
  void setup() {

    var seedlot = new Seedlot("00000000", SeedlotStatusEnum.INC);
    var parentTrees =
        List.of(
            new SeedlotParentTree(
                seedlot,
                1,
                BigDecimal.valueOf(22.2),
                BigDecimal.valueOf(45.3),
                new AuditInformation("0")),
            new SeedlotParentTree(
                seedlot,
                2,
                BigDecimal.valueOf(83.2),
                BigDecimal.valueOf(20),
                new AuditInformation("0")),
            new SeedlotParentTree(
                seedlot, 3, BigDecimal.valueOf(6.2), BigDecimal.ZERO, new AuditInformation("0")),
            new SeedlotParentTree(
                seedlot,
                4,
                BigDecimal.valueOf(86.1),
                BigDecimal.valueOf(93.21),
                new AuditInformation("0")));

    var pollenContamination = List.of(30, 0, 0, 56);
    IntStream.range(0, parentTrees.size())
        .boxed()
        .forEach(
            i ->
                parentTrees
                    .get(i)
                    .setNonOrchardPollenContaminationCount(pollenContamination.get(i)));

    var parentTreeDtos =
        List.of(
            new ParentTreeDto(
                1,
                null,
                null,
                null,
                true,
                true,
                false,
                0,
                0,
                List.of(new ParentTreeGeneticQuality("A", "A", 25))),
            new ParentTreeDto(
                2,
                null,
                null,
                null,
                true,
                true,
                false,
                0,
                0,
                List.of(new ParentTreeGeneticQuality("A", "A", -1))),
            new ParentTreeDto(
                3,
                null,
                null,
                null,
                true,
                true,
                false,
                0,
                0,
                List.of(new ParentTreeGeneticQuality("A", "A", 7))),
            new ParentTreeDto(
                4,
                null,
                null,
                null,
                true,
                true,
                false,
                0,
                0,
                List.of(new ParentTreeGeneticQuality("A", "A", 4))));

    parentTreeData =
        IntStream.range(0, parentTrees.size())
            .boxed()
            .map(i -> new ParentTreeData(parentTrees.get(i), parentTrees, parentTreeDtos.get(i)))
            .toList();

    totalPollen =
        parentTreeData.stream()
            .reduce(
                BigDecimal.ZERO,
                (sum, data) -> sum.add(data.parentTree().getPollenCount()),
                BigDecimal::add);

    totalCones =
        parentTreeData.stream()
            .reduce(
                BigDecimal.ZERO,
                (sum, data) -> sum.add(data.parentTree().getConeCount()),
                BigDecimal::add);
  }

  @Test
  void testMaleContribution() {
    var maleContributions = parentTreeData.stream().map(ParentTreeData::maleContribution).toList();

    var expectedMaleContributions = calculateExpectedMaleContribution();

    assertValues(expectedMaleContributions, maleContributions);
    assertSum(1d, maleContributions);
  }

  @Test
  void testFemaleContribution() {
    var femaleContributions =
        parentTreeData.stream().map(ParentTreeData::femaleContribution).toList();

    var expectedFemaleContributions = calculateExpectedFemaleContribution();

    assertValues(expectedFemaleContributions, femaleContributions);
    assertSum(1d, femaleContributions);
  }

  @Test
  void testIndividualContribution() {
    var expectedIndividualContributions = calculateExpectedIndividualContribution();

    var individualContributions =
        parentTreeData.stream().map(ParentTreeData::individualContribution).toList();

    assertValues(expectedIndividualContributions, individualContributions);
  }

  @Test
  void testGeneticWorth() {
    var expectedIndividualContributions = calculateExpectedIndividualContribution();

    var expectedGeneticWorth =
        IntStream.range(0, parentTreeData.size())
            .boxed()
            .map(
                i ->
                    expectedIndividualContributions.get(i)
                        * parentTreeData
                            .get(i)
                            .parentTreeDto()
                            .parentTreeGeneticQualities()
                            .get(0)
                            .geneticQualityValue())
            .toList();

    var geneticWorth = parentTreeData.stream().map(ParentTreeData::geneticWorth).toList();

    assertValues(expectedGeneticWorth, geneticWorth);
  }

  private List<Double> calculateExpectedMaleContribution() {
    return parentTreeData.stream()
        .map(d -> d.parentTree().getPollenCount().doubleValue() / totalPollen.doubleValue())
        .toList();
  }

  private List<Double> calculateExpectedFemaleContribution() {
    return parentTreeData.stream()
        .map(d -> d.parentTree().getConeCount().doubleValue() / totalCones.doubleValue())
        .toList();
  }

  private List<Double> calculateExpectedIndividualContribution() {
    var expectedMaleContributions = calculateExpectedMaleContribution();
    var expectedFemaleContributions = calculateExpectedFemaleContribution();

    return IntStream.range(0, parentTreeData.size())
        .boxed()
        .map(
            i ->
                (expectedMaleContributions.get(i)
                            * (100
                                - parentTreeData
                                    .get(i)
                                    .parentTree()
                                    .getNonOrchardPollenContaminationCount())
                            / 100.0
                        + expectedFemaleContributions.get(i))
                    / 2)
        .toList();
  }

  private static void assertValues(List<Double> expected, List<Double> actual) {
    Assertions.assertEquals(expected.size(), actual.size());

    IntStream.range(0, actual.size())
        .forEach(
            i ->
                Assertions.assertEquals(
                    BigDecimal.valueOf(expected.get(i)).round(mathContext),
                    BigDecimal.valueOf(actual.get(i)).round(mathContext)));
  }

  private static void assertSum(double expected, List<Double> numbers) {
    Assertions.assertEquals(
        BigDecimal.valueOf(expected).round(mathContext),
        BigDecimal.valueOf(numbers.stream().reduce(0d, Double::sum, Double::sum))
            .round(mathContext));
  }
}
