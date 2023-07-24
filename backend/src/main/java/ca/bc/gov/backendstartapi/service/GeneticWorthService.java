package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.GeneticWorthSummaryDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsRequestDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsResponseDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorth;
import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GeneticWorthService {

  private final GeneticWorthRepository geneticWorthRepository;

  public GeneticWorthService(GeneticWorthRepository geneticWorthRepository) {
    this.geneticWorthRepository = geneticWorthRepository;
  }

  /**
   * Calculate all genetic worth for the traits received in the request.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @return A {@link GeneticWorthSummaryDto} containing all calculated values
   */
  public GeneticWorthSummaryDto calculateGeneticWorth(
      List<GeneticWorthTraitsRequestDto> traitsDto) {

    BigDecimal effectivePopulationSizeNe = calculateEffectivePopulationSizeNe(traitsDto);
    BigDecimal coancestry = BigDecimal.ZERO;
    int numberOfSmpParentFromOutside = 0;

    List<GeneticWorthTraitsResponseDto> traits = calculateTraits(traitsDto);

    return new GeneticWorthSummaryDto(
        effectivePopulationSizeNe, coancestry, numberOfSmpParentFromOutside, traits);
  }

  /**
   * Does the calculation for each genetic trait. PS: if the treshold of 70% of contribution
   *     from the parent tree is not met, the trait will respond with zero as value growth.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @return A {@link List} of {@link GeneticWorthTraitsResponseDto} containing the trait code
   *     , its value growth and the percentage of contribution
   */
  private List<GeneticWorthTraitsResponseDto> calculateTraits(
      List<GeneticWorthTraitsRequestDto> traitsDto) {
    List<GeneticWorthTraitsResponseDto> traits = new ArrayList<>();
    BigDecimal minimumTreshold = new BigDecimal("0.7");

    // Iterate over all traits
    List<GeneticWorth> geneticWorths = geneticWorthRepository.findAll();

    for (GeneticWorth trait : geneticWorths) {
      BigDecimal volumeGrowth = null;
      BigDecimal percentage = checkGeneticTraitTreshold(traitsDto, trait);

      if (percentage.compareTo(minimumTreshold) >= 0) {
        volumeGrowth = calculateGeneticWorth(traitsDto, trait);
      }

      GeneticWorthTraitsResponseDto traitResponse =
          new GeneticWorthTraitsResponseDto(
              GeneticWorthEnum.GVO.name().toLowerCase(), volumeGrowth, percentage);
      traits.add(traitResponse);
    }

    return traits;
  }

  /**
   * Do the calculations for the Effective Population Size (Ne). Note that in the case the parent
   * tree does not attend the 70% treshold weight, the value for this trait will be zero;
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @return A {@link BigDecimal} representing the value.
   */
  private BigDecimal calculateEffectivePopulationSizeNe(
      List<GeneticWorthTraitsRequestDto> traitsDto) {
    // Not implemented yet
    return BigDecimal.ZERO;
  }

  /**
   * Do the calculations for the Volume Growth (GVO). Note that in the case the parent tree does not
   * attend the 70% treshold weight, the value for this trait will be zero;
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values
   * @return A {@link BigDecimal} representing the value.
   */
  private BigDecimal calculateGeneticWorth(
      List<GeneticWorthTraitsRequestDto> traitsDto, GeneticWorth trait) {
    BigDecimal malePollenSum = reducePollenCount(traitsDto);
    BigDecimal femaleConeSum = reduceConeCount(traitsDto);
    BigDecimal sumGw = BigDecimal.ZERO;

    for (GeneticWorthTraitsRequestDto dto : traitsDto) {
      BigDecimal traitBreedingValue = getTraitValue(dto, trait);
      if (!Objects.isNull(traitBreedingValue) && traitBreedingValue.floatValue() != 0) {
        BigDecimal pi =
            calculatePi(dto.pollenCount(), dto.coneCount(), malePollenSum, femaleConeSum);
        BigDecimal gwValue = traitBreedingValue.multiply(pi);
        sumGw = sumGw.add(gwValue);
      }
    }

    return sumGw;
  }

  private BigDecimal checkGeneticTraitTreshold(
      List<GeneticWorthTraitsRequestDto> traitsDto, GeneticWorth trait) {
    log.debug("Checking genetic trait treshold for {} trait", trait);

    BigDecimal malePollenSum = reducePollenCount(traitsDto);
    BigDecimal femaleConeSum = reduceConeCount(traitsDto);
    BigDecimal sumPi = BigDecimal.ZERO;

    log.debug("femaleConeSum {}", femaleConeSum);
    log.debug("malePollenSum {}", malePollenSum);

    for (GeneticWorthTraitsRequestDto traitFor : traitsDto) {
      BigDecimal traitBreedingValue = getTraitValue(traitFor, trait);
      if (!Objects.isNull(traitBreedingValue) && traitBreedingValue.floatValue() != 0) {
        BigDecimal pi =
            calculatePi(traitFor.pollenCount(), traitFor.coneCount(), malePollenSum, femaleConeSum);
        sumPi = sumPi.add(pi);
      }
    }

    return sumPi;
  }

  private BigDecimal getTraitValue(GeneticWorthTraitsRequestDto dto, GeneticWorth trait) {
    switch (trait.getId()) {
      case "AD":
        return dto.ad();
      case "DFS":
        return dto.dfs();
      case "DFU":
        return dto.dfu();
      case "DFW":
        return dto.dfw();
      case "DSB":
        return dto.dsb();
      case "DSC":
        return dto.dsc();
      case "DSG":
        return dto.dsg();
      case "GVO":
        return dto.gvo();
      case "IWS":
        return dto.iws();
      case "WDU":
        return dto.wdu();
      case "WVE":
        return dto.wve();
      case "WWD":
        return dto.wwd();
      default:
        return BigDecimal.ZERO;
    }
  }

  private BigDecimal calculatePi(
      BigDecimal pollenCount, BigDecimal coneCount, BigDecimal pollenSum, BigDecimal coneSum) {
    BigDecimal mi = pollenCount.divide(pollenSum, 10, RoundingMode.HALF_UP);
    BigDecimal fi = coneCount.divide(coneSum, 10, RoundingMode.HALF_UP);
    return mi.add(fi).divide(new BigDecimal("2"), 10, RoundingMode.HALF_UP);
  }

  private BigDecimal reducePollenCount(List<GeneticWorthTraitsRequestDto> traitsDto) {
    return traitsDto.stream().map(x -> x.pollenCount()).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private BigDecimal reduceConeCount(List<GeneticWorthTraitsRequestDto> traitsDto) {
    return traitsDto.stream().map(x -> x.coneCount()).reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
