package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthSummaryDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsRequestDto;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of genetic worth. */
@Slf4j
@Service
public class GeneticWorthService {
  private GeneticWorthRepository geneticWorthRepository;

  public GeneticWorthService(GeneticWorthRepository geneticWorthRepository) {
    this.geneticWorthRepository = geneticWorthRepository;
  }

  /** Fetch all valid genetic worth from the repository. */
  public List<CodeDescriptionDto> getAllGeneticWorth() {
    log.info("Fetching all genetic worth");
    List<CodeDescriptionDto> resultList = new ArrayList<>();

    geneticWorthRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getGeneticWorthCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }

  /** Fetch a genetic worth from the repository by code. */
  public CodeDescriptionDto getGeneticWorthByCode(String code) {
    log.info("Fetching genetic worth with code %s", code);

    return geneticWorthRepository
        .findById(code)
        .map(
            entity -> new CodeDescriptionDto(entity.getGeneticWorthCode(), entity.getDescription()))
        .orElseThrow(NoGeneticWorthException::new);
  }

  /**
   * Does the calculation for each genetic trait. PS: if the treshold of 70% of contribution from
   * the parent tree is not met, the trait value will not be shown.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @return A {@link GeneticWorthSummaryDto} containing all calculated values
   */
  public GeneticWorthSummaryDto calculateGeneticWorth(
      List<GeneticWorthTraitsRequestDto> traitsDto) {
    BigDecimal minimumTreshold = new BigDecimal("0.7");
    BigDecimal neValue = calculateNe(traitsDto);

    GeneticWorthSummaryDto summaryDto =
        new GeneticWorthSummaryDto(new ArrayList<>(), neValue);

    // Iterate over all traits
    List<CodeDescriptionDto> geneticWorths = getAllGeneticWorth();

    for (CodeDescriptionDto trait : geneticWorths) {
      BigDecimal calculatedValue = null;
      BigDecimal percentage = checkGeneticTraitTreshold(traitsDto, trait);

      if (percentage.compareTo(minimumTreshold) >= 0) {
        log.info("Calculating Genetic Worth for {} trait", trait.code());
        calculatedValue = calculateTraitGeneticWorth(traitsDto, trait);
      }

      GeneticWorthTraitsDto traitResponse =
          new GeneticWorthTraitsDto(trait.code(), null, calculatedValue, percentage);
      summaryDto.geneticTraits().add(traitResponse);
    }

    return summaryDto;
  }

  /**
   * Does the Ne calculation (effective population size).
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @return A {@link BigDecimal} representing the calculated value.
   */
  private BigDecimal calculateNe(List<GeneticWorthTraitsRequestDto> traitsDto) {
    BigDecimal malePollenSum = reducePollenCount(traitsDto);
    BigDecimal femaleConeSum = reduceConeCount(traitsDto);

    BigDecimal piSquareSum = BigDecimal.ZERO;
    for (GeneticWorthTraitsRequestDto dto : traitsDto) {
      BigDecimal pi = calculatePi(dto.pollenCount(), dto.coneCount(), malePollenSum, femaleConeSum);
      BigDecimal piSquare = pi.multiply(pi);

      piSquareSum = piSquareSum.add(piSquare);
      log.debug("calculateNe - piSquareSum {}", piSquareSum);
    }

    if (piSquareSum.compareTo(BigDecimal.ZERO) == 0) {
      log.debug("calculateNe - piSquareSum is zero!");
      return BigDecimal.ZERO;
    }

    BigDecimal neValue = BigDecimal.ONE.divide(piSquareSum, 10, RoundingMode.HALF_UP);
    log.debug("calculateNe - neValue {}", neValue);
    return neValue;
  }

  /**
   * Do the calculations for each Genetic Worth trait. Note that in the case the parent tree does
   * not attend the 70% treshold weight, the value for this trait will be zero.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values.
   * @return A {@link BigDecimal} representing the value.
   */
  private BigDecimal calculateTraitGeneticWorth(
      List<GeneticWorthTraitsRequestDto> traitsDto, CodeDescriptionDto trait) {
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

  /**
   * Check if a given trait mets the minimum of 70% of parent tree contribution.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @param trait A {@link GeneticWorth} with the trait that should be considered.
   * @return A BigDecimal representing the trait treshold.
   */
  private BigDecimal checkGeneticTraitTreshold(
      List<GeneticWorthTraitsRequestDto> traitsDto, CodeDescriptionDto trait) {
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

    log.debug("Finished checking Genetic Trait treshold for {} trait with: {}%", trait, sumPi);

    return sumPi;
  }

  /**
   * Finds the genetic trait value given the request dto and the trait that should be found.
   *
   * @param dto A {@link GeneticWorthTraitsRequestDto} instance with the traits value.
   * @param trait A {@link GeneticWorth} with the trait that should be considered.
   * @return a BigDecimal representing the trait value or BigDecimal.ZERO otherwise.
   */
  private BigDecimal getTraitValue(
      GeneticWorthTraitsRequestDto traitDto, CodeDescriptionDto trait) {
    List<GeneticWorthTraitsDto> geneticTraits = traitDto.geneticTraits();
    Optional<GeneticWorthTraitsDto> traitOptional =
        geneticTraits.stream()
            .filter(x -> x.traitCode().equalsIgnoreCase(trait.code()))
            .findFirst();
    return traitOptional.isEmpty() ? BigDecimal.ZERO : traitOptional.get().traitValue();
  }

  /**
   * Calculate the pi. The P represents the percentage of contribution for a parent tree, the sum of
   * male and female contribution divided by two.
   *
   * @param pollenCount The amount of pollen for this parent tree (clone).
   * @param coneCount The amount of cone for this parent tree (clone).
   * @param pollenSum The sum of all pollen count for this calculation.
   * @param coneSum The sum of all cone count for this calculation.
   * @return A BigDecimal representing the value.
   */
  private BigDecimal calculatePi(
      BigDecimal pollenCount, BigDecimal coneCount, BigDecimal pollenSum, BigDecimal coneSum) {
    BigDecimal bigZero = BigDecimal.ZERO;
    BigDecimal mi =
        pollenSum.compareTo(bigZero) == 0
            ? bigZero
            : pollenCount.divide(pollenSum, 10, RoundingMode.HALF_UP);
    BigDecimal fi =
        coneSum.compareTo(bigZero) == 0
            ? bigZero
            : coneCount.divide(coneSum, 10, RoundingMode.HALF_UP);
    return mi.add(fi).divide(new BigDecimal("2"), 10, RoundingMode.HALF_UP);
  }

  /**
   * Sums all the pollen count.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values
   * @return A BigDecimal representing the value
   */
  private BigDecimal reducePollenCount(List<GeneticWorthTraitsRequestDto> traitsDto) {
    return traitsDto.stream().map(x -> x.pollenCount()).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  /**
   * Sums all the cone count.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values
   * @return A BigDecimal representing the value
   */
  private BigDecimal reduceConeCount(List<GeneticWorthTraitsRequestDto> traitsDto) {
    return traitsDto.stream().map(x -> x.coneCount()).reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
