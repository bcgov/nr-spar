package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of genetic worth. */
@Service
public class GeneticWorthService {
  private GeneticWorthRepository geneticWorthRepository;

  public GeneticWorthService(GeneticWorthRepository geneticWorthRepository) {
    this.geneticWorthRepository = geneticWorthRepository;
  }

  /** Fetch all valid genetic worth from the repository. */
  public List<GeneticWorthDto> getAllGeneticWorth() {
    SparLog.info("Fetching all genetic worth");
    List<GeneticWorthDto> resultList = new ArrayList<>();

    geneticWorthRepository.findAll().stream()
        .filter(gw -> gw.isValid())
        .forEach(
            gw -> {
              GeneticWorthDto methodToAdd =
                  new GeneticWorthDto(
                      gw.getGeneticWorthCode(), gw.getDescription(), gw.getDefaultBv());
              resultList.add(methodToAdd);
            });

    SparLog.info("{} genetic worth found.", resultList.size());
    return resultList;
  }

  /** Fetch a genetic worth from the repository by code. */
  public CodeDescriptionDto getGeneticWorthByCode(@NonNull String code) {
    SparLog.info("Fetching genetic worth with code {}", code);

    Optional<GeneticWorthEntity> gweOptional = geneticWorthRepository.findById(code);
    gweOptional.ifPresent(entity -> SparLog.info("Genetic worth {} found.", code));

    return gweOptional
        .map(
            entity -> new CodeDescriptionDto(entity.getGeneticWorthCode(), entity.getDescription()))
        .orElseThrow(NoGeneticWorthException::new);
  }

  /**
   * Does the calculation for each genetic trait. PS: if the threshold of 70% of contribution from
   * the parent tree is not met, the trait value will not be shown.
   *
   * @param traitsDto A {@link List} of {@link OrchardParentTreeValsDto} with the traits and values
   *     to be calculated.
   * @return A {@link PtCalculationResDto} containing all calculated values
   */
  public List<GeneticWorthTraitsDto> calculateGeneticWorth(
      List<OrchardParentTreeValsDto> traitsDto) {
    SparLog.info("Starting Genetic Worth calculations");
    BigDecimal minimumThreshold = new BigDecimal("0.7");

    List<GeneticWorthTraitsDto> calculated = new ArrayList<>();

    // Iterate over all traits
    List<GeneticWorthDto> geneticWorths = getAllGeneticWorth();

    for (GeneticWorthDto trait : geneticWorths) {
      BigDecimal calculatedValue = null;
      BigDecimal percentage = calcGeneticTraitThreshold(traitsDto, trait);

      if (percentage.compareTo(minimumThreshold) >= 0) {
        SparLog.info("Calculating Genetic Worth for {} trait", trait.getCode());
        calculatedValue = calculateTraitGeneticWorth(traitsDto, trait);
      } else {
        SparLog.info(
            "No Genetic Worth calculations for trait {}, threshold not met.", trait.getCode());
      }

      GeneticWorthTraitsDto traitResponse =
          new GeneticWorthTraitsDto(trait.getCode(), null, calculatedValue, percentage);
      calculated.add(traitResponse);
    }

    return calculated;
  }

  /**
   * Does the Ne calculation (effective population size).
   *
   * @param traitsDto A {@link List} of {@link OrchardParentTreeValsDto} with the traits and values
   *     to be calculated.
   * @return A {@link BigDecimal} representing the calculated value.
   */
  public BigDecimal calculateNe(List<OrchardParentTreeValsDto> traitsDto) {
    SparLog.info("Started Ne calculation");
    BigDecimal malePollenSum = reducePollenCount(traitsDto);
    BigDecimal femaleConeSum = reduceConeCount(traitsDto);

    BigDecimal piSquareSum = BigDecimal.ZERO;
    for (OrchardParentTreeValsDto dto : traitsDto) {
      BigDecimal pi = calculatePi(dto.pollenCount(), dto.coneCount(), malePollenSum, femaleConeSum);
      BigDecimal piSquare = pi.multiply(pi);

      piSquareSum = piSquareSum.add(piSquare);
      SparLog.debug("calculateNe - piSquareSum {}", piSquareSum);
    }

    if (piSquareSum.compareTo(BigDecimal.ZERO) == 0) {
      SparLog.debug("calculateNe - piSquareSum is zero!");
      return BigDecimal.ZERO;
    }

    BigDecimal neValue = BigDecimal.ONE.divide(piSquareSum, 10, RoundingMode.HALF_UP);
    SparLog.debug("calculateNe - neValue {}", neValue);

    return neValue.setScale(1, RoundingMode.HALF_UP);
  }

  /**
   * Do the calculations for each Genetic Worth trait. Note that in the case the parent tree does
   * not attend the 70% threshold weight, the value for this trait will be zero.
   *
   * @param traitsDto A {@link List} of {@link OrchardParentTreeValsDto} with the traits and values.
   * @return A {@link BigDecimal} representing the value.
   */
  private BigDecimal calculateTraitGeneticWorth(
      List<OrchardParentTreeValsDto> traitsDto, CodeDescriptionDto trait) {
    BigDecimal malePollenSum = reducePollenCount(traitsDto);
    BigDecimal femaleConeSum = reduceConeCount(traitsDto);
    BigDecimal sumGw = BigDecimal.ZERO;

    for (OrchardParentTreeValsDto dto : traitsDto) {
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
   * Calculate the threshold of a genetic trait. To be used to check if a given trait mets the
   * minimum of 70% of parent tree contribution.
   *
   * @param traitsDto A {@link List} of {@link OrchardParentTreeValsDto} with the traits and values
   *     to be calculated.
   * @param trait A {@link GeneticWorth} with the trait that should be considered.
   * @return A BigDecimal representing the trait threshold.
   */
  private BigDecimal calcGeneticTraitThreshold(
      List<OrchardParentTreeValsDto> traitsDto, CodeDescriptionDto trait) {
    SparLog.debug("Checking genetic trait threshold for {} trait", trait);

    BigDecimal malePollenSum = reducePollenCount(traitsDto);
    BigDecimal femaleConeSum = reduceConeCount(traitsDto);
    BigDecimal sumPi = BigDecimal.ZERO;

    SparLog.debug("femaleConeSum {}", femaleConeSum);
    SparLog.debug("malePollenSum {}", malePollenSum);

    for (OrchardParentTreeValsDto traitFor : traitsDto) {
      BigDecimal traitBreedingValue = getTraitValue(traitFor, trait);
      if (!Objects.isNull(traitBreedingValue) && traitBreedingValue.floatValue() != 0) {
        BigDecimal pi =
            calculatePi(traitFor.pollenCount(), traitFor.coneCount(), malePollenSum, femaleConeSum);
        sumPi = sumPi.add(pi);
      }
    }

    SparLog.debug("Finished checking Genetic Trait threshold for {} trait with: {}%", trait, sumPi);

    return sumPi;
  }

  /**
   * Finds the genetic trait value given the request dto and the trait that should be found.
   *
   * @param dto A {@link OrchardParentTreeValsDto} instance with the traits value.
   * @param trait A {@link GeneticWorth} with the trait that should be considered.
   * @return a BigDecimal representing the trait value or BigDecimal.ZERO otherwise.
   */
  private BigDecimal getTraitValue(OrchardParentTreeValsDto traitDto, CodeDescriptionDto trait) {
    List<GeneticWorthTraitsDto> geneticTraits = traitDto.geneticTraits();
    Optional<GeneticWorthTraitsDto> traitOptional =
        geneticTraits.stream()
            .filter(x -> x.traitCode().equalsIgnoreCase(trait.getCode()))
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

    BigDecimal calculatedPi = mi.add(fi).divide(new BigDecimal("2"), 10, RoundingMode.HALF_UP);

    return calculatedPi;
  }

  /**
   * Sums all the pollen count.
   *
   * @param traitsDto A {@link List} of {@link OrchardParentTreeValsDto} with the traits and values
   * @return A BigDecimal representing the value
   */
  private BigDecimal reducePollenCount(List<OrchardParentTreeValsDto> traitsDto) {
    return traitsDto.stream().map(x -> x.pollenCount()).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  /**
   * Sums all the cone count.
   *
   * @param traitsDto A {@link List} of {@link OrchardParentTreeValsDto} with the traits and values
   * @return A BigDecimal representing the value
   */
  private BigDecimal reduceConeCount(List<OrchardParentTreeValsDto> traitsDto) {
    return traitsDto.stream().map(x -> x.coneCount()).reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
