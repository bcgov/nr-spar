package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
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
   * Does the Ne calculation (effective population size).
   *
   * @param coancestry The coancestry value.
   * @param varSumOrchGameteContr The sum value of the Orchard gamete contribution.
   * @param varSumNeNoSmpContrib The sum value of the Ne number of SMP contribution.
   * @param smpParentsOutside The number of SMP parent tree from outside the orchard.
   * @return A {@link BigDecimal} representing the calculated value.
   */
  public BigDecimal calculateNe(
      BigDecimal coancestry,
      BigDecimal varSumOrchGameteContr,
      BigDecimal varSumNeNoSmpContrib,
      Integer smpParentsOutside) {
    SparLog.info("Started Ne calculation");
    BigDecimal varEffectivePopSize = null;

    final int scale = 10;
    final RoundingMode halfUp = RoundingMode.HALF_UP;
    BigDecimal zero = BigDecimal.ZERO;
    BigDecimal one = BigDecimal.ONE;

    if (coancestry != null) {
      // --Effective Population Size with Coancestry considered
      if (coancestry.compareTo(zero) == 0) {
        varEffectivePopSize = zero;
      } else {
        varEffectivePopSize = new BigDecimal("0.5").divide(coancestry, scale, halfUp);
      }
    } else if (smpParentsOutside > 0) {
      // --Effective Population Size with SMP (for Growth)
      // Original equation: varEffectivePopSize = Math.round(1/(v_sum_orch_gamete_contr + (
      // Math.power(0.25/(2*varSmpParentsOutside),2) * varSmpParentsOutside )) ,1);
      varEffectivePopSize =
          one.divide(
              (varSumOrchGameteContr.add(
                  new BigDecimal("0.25")
                      .divide(
                          new BigDecimal("2").multiply(new BigDecimal(smpParentsOutside)),
                          scale,
                          halfUp)
                      .pow(2)
                      .multiply(new BigDecimal(smpParentsOutside)))),
              scale,
              halfUp);
    } else {
      // --Effective Population Size
      if (varSumOrchGameteContr.compareTo(zero) == 0) {
        varEffectivePopSize = zero;
      } else {
        // varEffectivePopSize = Math.round(1 / varSumNeNoSmpContrib);
        varEffectivePopSize = one.divide(varSumNeNoSmpContrib, scale, halfUp);
      }
    }

    SparLog.debug("calculateNe - neValue {}", varEffectivePopSize);

    return varEffectivePopSize.setScale(1, halfUp);
  }
}
