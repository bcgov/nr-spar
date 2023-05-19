package ca.bc.gov.backendstartapi.vo;

import ca.bc.gov.backendstartapi.dto.orchard.ParentTreeDto;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import java.util.List;

public record ParentTreeData(
    SeedlotParentTree parentTree,
    List<SeedlotParentTree> parentTrees,
    ParentTreeDto parentTreeDto) {

  public double maleContribution() {
    return parentTree.getPollenCount().doubleValue()
        / parentTrees.stream()
            .map(pt -> pt.getPollenCount().doubleValue())
            .reduce(0d, Double::sum, Double::sum);
  }

  public double femaleContribution() {
    return parentTree.getConeCount().doubleValue()
        / parentTrees.stream()
            .map(pt -> pt.getConeCount().doubleValue())
            .reduce(0d, Double::sum, Double::sum);
  }

  public double individualContribution() {
    return (maleContribution() * (100 - parentTree.getNonOrchardPollenContaminationCount()) / 100.0
            + femaleContribution())
        / 2;
  }

  public double geneticWorth() {
    assert parentTreeDto.parentTreeGeneticQualities().size()==1;
    return individualContribution()
        * parentTreeDto.parentTreeGeneticQualities().get(0).geneticQualityValue();
  }
}
