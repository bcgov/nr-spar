package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.orchard.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.orchard.ParentTreeDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSeedPlanningUnit;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.repository.ActiveOrchardSeedPlanningUnitRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.vo.ParentTreeData;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeneticWorthCalculator {

  private final SeedlotRepository seedlotRepository;
  private final SeedlotOrchardRepository seedlotOrchardRepository;
  private final ActiveOrchardSeedPlanningUnitRepository activeOrchardSeedPlanningUnitRepository;
  private final SeedlotParentTreeRepository seedlotParentTreeRepository;
  private final SpuOrchardProvider spuOrchardProvider;

  public BigDecimal calculate(String seedlotId) {
    var seedlot = seedlotRepository.findById(seedlotId);

    // Identify orchards
    var orchards = seedlotOrchardRepository.findBySeedlot(seedlot.orElseThrow());

    // Fetch SPU data from Oracle API
    var activeSpus =
        orchards.stream()
            .flatMap(
                o ->
                    activeOrchardSeedPlanningUnitRepository
                        .findByOrchardIdAndActive(o.getOrchard(), true)
                        .stream())
            .toList();
    var spuParentTrees = fetchSpuOrchards(activeSpus);

    // Select the trees to be used in the calculation according to the SPU data
    var parentTreeDtos = spuParentTrees.stream().flatMap(pt -> pt.parentTrees().stream()).toList();
    assert parentTreeDtos.size() == new HashSet<>(parentTreeDtos).size();

    var parentTreeIds =
        parentTreeDtos.stream()
            .map(ParentTreeDto::parentTreeId)
            .map(id -> new SeedlotParentTreeId(seedlotId, id))
            .toList();
    assert parentTreeIds.size() == new HashSet<>(parentTreeIds).size();

    var parentTrees = seedlotParentTreeRepository.findAllById(parentTreeIds);
    assert parentTrees.size() == parentTreeDtos.size();

    // Calculate the contribution of each parent tree
    var treeData = calculateParentTreeContributions(parentTrees, parentTreeDtos);

    // Consolidate the contribution of all parent trees in the seedlot GW
    return BigDecimal.valueOf(
        treeData.stream().map(ParentTreeData::geneticWorth).reduce(0d, Double::sum, Double::sum));
  }

  private List<ParentTreeData> calculateParentTreeContributions(
      List<SeedlotParentTree> parentTrees, List<ParentTreeDto> parentTreeDtos) {
    return IntStream.range(0, parentTrees.size())
        .boxed()
        .map(i -> new ParentTreeData(parentTrees.get(i), parentTrees, parentTreeDtos.get(i)))
        .toList();
  }

  private List<OrchardSpuDto> fetchSpuOrchards(List<ActiveOrchardSeedPlanningUnit> orchardsSpus) {
    // TODO
    return spuOrchardProvider.fetchOrchardSpus();
  }
}
