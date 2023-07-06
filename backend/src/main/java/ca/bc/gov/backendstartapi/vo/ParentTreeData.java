package ca.bc.gov.backendstartapi.vo;

import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import java.util.List;

/** This class holds all Parent Tree data for the GW calculations. */
public record ParentTreeData(
    SeedlotParentTree parentTree,
    List<SeedlotParentTree> parentTrees,
    ParentTreeDto parentTreeDto) {

  /**
   * Do the maleContribution calculation.
   *
   * @return A double representing the value.
   */
  public double maleContribution() {
    return parentTree.getPollenCount().doubleValue()
        / parentTrees.stream()
            .map(pt -> pt.getPollenCount().doubleValue())
            .reduce(0d, Double::sum, Double::sum);
  }

  /**
   * Do the maleContribution calculation.
   *
   * @return A double representing the value.
   */
  public double femaleContribution() {
    return parentTree.getConeCount().doubleValue()
        / parentTrees.stream()
            .map(pt -> pt.getConeCount().doubleValue())
            .reduce(0d, Double::sum, Double::sum);
  }

  /**
   * Do the individualContribution calculation.
   *
   * @return A double representing the value.
   */
  public double individualContribution() {
    return (maleContribution() * (100 - parentTree.getNonOrchardPollenContaminationCount()) / 100.0
            + femaleContribution())
        / 2;
  }

  /**
   * Do the geneticWorth calculation.
   *
   * @return A double representing the value.
   */
  public double geneticWorth() {
    assert parentTreeDto.parentTreeGeneticQualities().size() == 1;
    ParentTreeGeneticQualityDto geneticQualityDto =
        parentTreeDto.parentTreeGeneticQualities().get(0);
    return individualContribution() * geneticQualityDto.geneticQualityValue().doubleValue();
  }
}
