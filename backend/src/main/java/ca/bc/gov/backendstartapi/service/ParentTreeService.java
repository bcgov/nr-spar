package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CalculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.exception.PtGeoDataNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.util.LatLongUtil;
import ca.bc.gov.backendstartapi.util.ValueUtil;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** This class holds methods for handling Parent Trees records. */
@Service
@RequiredArgsConstructor
public class ParentTreeService {

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;

  private final GeneticWorthService geneticWorthService;

  static int DIVISION_SCALE = 10;
  static BigDecimal PERC_DIVISOR = new BigDecimal(100);
  static BigDecimal HALF_DIVISOR = new BigDecimal(2);
  static BigDecimal PROP_DIVISOR = new BigDecimal(200);
  static BigDecimal ONE = BigDecimal.ONE;
  static RoundingMode halfUp = RoundingMode.HALF_UP;

  /**
   * Does the calculation for each genetic trait. PS: if the threshold of 70% of contribution from
   * the parent tree is not met, the trait value will not be shown.
   *
   * @param ptVals A {@link PtValsCalReqDto} sent by an endpoint consumer for calculation
   * @return A {@link PtCalculationResDto} containing all calculated values
   */
  public PtCalculationResDto calculatePtVals(PtValsCalReqDto ptVals) {
    SparLog.info(
        "Started calculation for parent tree contribution values. Number of rchard parent received:"
            + " {}. Number of SMP mix parent tree received: {}.",
        ptVals.orchardPtVals().size(),
        ptVals.smpMixIdAndProps().size());

    final BigDecimal zero = BigDecimal.ZERO;

    // First pass
    BigDecimal varTotalConeCount = zero;
    BigDecimal varTotalPollenCount = zero;
    Integer varTotalNonOrchardPollen = 0;
    Integer varNumNonOrchardPollen = 0;
    for (OrchardParentTreeValsDto orchardPtVals : ptVals.orchardPtVals()) {
      varTotalConeCount = varTotalConeCount.add(orchardPtVals.coneCount());
      varTotalPollenCount = varTotalPollenCount.add(orchardPtVals.pollenCount());
      if (ValueUtil.hasValue(orchardPtVals.nonOrchardPollenContamPct())) {
        varTotalNonOrchardPollen += orchardPtVals.nonOrchardPollenContamPct();
        varNumNonOrchardPollen += 1;
      }
    }

    // --calc avg non-orchard pollen contamination pct
    Double varAvgNonOrchardPollen = 0D;
    if (varNumNonOrchardPollen > 0) {
      varAvgNonOrchardPollen = (double) varTotalNonOrchardPollen / varNumNonOrchardPollen;
    }

    Integer varOrchardContaminationPct;
    if (varTotalNonOrchardPollen == 0) {
      varOrchardContaminationPct = 0;
    } else {
      varOrchardContaminationPct = varAvgNonOrchardPollen.intValue();
    }

    // Second pass - No needed, since only --col:W it's in there, which is already on the third pass
    BigDecimal varParentPropOrchPoll = zero;

    // Third pass
    BigDecimal varSumOrchGameteContr = zero;
    BigDecimal varOrchGameteContr;
    BigDecimal varSumNeNoSmpContrib = zero;
    BigDecimal vFemaleCropPop = zero;
    BigDecimal varParPropContrib = null;
    BigDecimal varNeNoSmpContrib = null;
    
    BigDecimal varSumMaleGwAdContbOrchPoll  = zero;
    BigDecimal varSumMaleGwDfsContbOrchPoll = zero;
    BigDecimal varSumMaleGwDfuContbOrchPoll = zero;
    BigDecimal varSumMaleGwDfwContbOrchPoll = zero;
    BigDecimal varSumMaleGwDsbContbOrchPoll = zero;
    BigDecimal varSumMaleGwDscContbOrchPoll = zero;
    BigDecimal varSumMaleGwDsgContbOrchPoll = zero;
    BigDecimal varSumMaleGwGvoContbOrchPoll = zero;
    BigDecimal varSumMaleGwIwsContbOrchPoll = zero;
    BigDecimal varSumMaleGwWduContbOrchPoll = zero;
    BigDecimal varSumMaleGwWveContbOrchPoll = zero;
    BigDecimal varSumMaleGwWwdContbOrchPoll = zero;
    
    BigDecimal varMaleTotalGwAdContrib  = zero;
    BigDecimal varMaleTotalGwDfsContrib = zero;
    BigDecimal varMaleTotalGwDfuContrib = zero;
    BigDecimal varMaleTotalGwDfwContrib = zero;
    BigDecimal varMaleTotalGwDsbContrib = zero;
    BigDecimal varMaleTotalGwDscContrib = zero;
    BigDecimal varMaleTotalGwDsgContrib = zero;
    BigDecimal varMaleTotalGwGvoContrib = zero;
    BigDecimal varMaleTotalGwIwsContrib = zero;
    BigDecimal varMaleTotalGwWduContrib = zero;
    BigDecimal varMaleTotalGwWveContrib = zero;
    BigDecimal varMaleTotalGwWwdContrib = zero;

    BigDecimal totalGeneticWorthContrib = zero;
    BigDecimal varSumParentTotalGwAdContrib = zero;
    BigDecimal varSumParentTotalGwDfsContrib = zero;
    BigDecimal varSumParentTotalGwDfuContrib = zero;
    BigDecimal varSumParentTotalGwDfwContrib = zero;
    BigDecimal varSumParentTotalGwDsbContrib = zero;
    BigDecimal varSumParentTotalGwDscContrib = zero;
    BigDecimal varSumParentTotalGwDsgContrib = zero;
    BigDecimal varSumParentTotalGwGvoContrib = zero;
    BigDecimal varSumParentTotalGwIwsContrib = zero;
    BigDecimal varSumParentTotalGwWduContrib = zero;
    BigDecimal varSumParentTotalGwWveContrib = zero;
    BigDecimal varSumParentTotalGwWwdContrib = zero;
    for (OrchardParentTreeValsDto parentTreeRow : ptVals.orchardPtVals()) {
      boolean hasConeCount = parentTreeRow.coneCount().compareTo(BigDecimal.ZERO) > 0;
      boolean hasPollenCount = parentTreeRow.pollenCount().compareTo(BigDecimal.ZERO) > 0;
      // --Ignore rows without cone or pollen count
      if (hasConeCount || hasPollenCount) {
        BigDecimal ptPollenCount = parentTreeRow.pollenCount();
        BigDecimal ptConeCount = parentTreeRow.coneCount();

        // --col:V
        if (varTotalConeCount.compareTo(BigDecimal.ZERO) > 0) {
          vFemaleCropPop = ptConeCount.divide(varTotalConeCount, DIVISION_SCALE, halfUp);
        }

        // --col:W
        if (varTotalPollenCount.compareTo(BigDecimal.ZERO) > 0) {
          varParentPropOrchPoll = ptPollenCount.divide(varTotalPollenCount, DIVISION_SCALE, halfUp);
        }

        // Trait values
        BigDecimal adBreedingValue  = getTraitValue(parentTreeRow, "AD");
        BigDecimal dfsBreedingValue = getTraitValue(parentTreeRow, "DFS");
        BigDecimal dfuBreedingValue = getTraitValue(parentTreeRow, "DFU");
        BigDecimal dfwBreedingValue = getTraitValue(parentTreeRow, "DFW");
        BigDecimal dsbBreedingValue = getTraitValue(parentTreeRow, "DSB");
        BigDecimal dscBreedingValue = getTraitValue(parentTreeRow, "DSC");
        BigDecimal dsgBreedingValue = getTraitValue(parentTreeRow, "DSG");
        BigDecimal gvoBreedingValue = getTraitValue(parentTreeRow, "GVO");
        BigDecimal iwsBreedingValue = getTraitValue(parentTreeRow, "IWS");
        BigDecimal wduBreedingValue = getTraitValue(parentTreeRow, "WDU");
        BigDecimal wveBreedingValue = getTraitValue(parentTreeRow, "WVE");
        BigDecimal wwdBreedingValue = getTraitValue(parentTreeRow, "WWD");

        // --col:X
        BigDecimal varMaleGwAdContribOrchPoll  = varParentPropOrchPoll.multiply(adBreedingValue);
        BigDecimal varMaleGwDfsContribOrchPoll = varParentPropOrchPoll.multiply(dfsBreedingValue);
        BigDecimal varMaleGwDfuContribOrchPoll = varParentPropOrchPoll.multiply(dfuBreedingValue);
        BigDecimal varMaleGwDfwContribOrchPoll = varParentPropOrchPoll.multiply(dfwBreedingValue);
        BigDecimal varMaleGwDsbContribOrchPoll = varParentPropOrchPoll.multiply(dsbBreedingValue);
        BigDecimal varMaleGwDscContribOrchPoll = varParentPropOrchPoll.multiply(dscBreedingValue);
        BigDecimal varMaleGwDsgContribOrchPoll = varParentPropOrchPoll.multiply(dsgBreedingValue);
        BigDecimal varMaleGwGvoContribOrchPoll = varParentPropOrchPoll.multiply(gvoBreedingValue);
        BigDecimal varMaleGwIwsContribOrchPoll = varParentPropOrchPoll.multiply(iwsBreedingValue);
        BigDecimal varMaleGwWduContribOrchPoll = varParentPropOrchPoll.multiply(wduBreedingValue);
        BigDecimal varMaleGwWveContribOrchPoll = varParentPropOrchPoll.multiply(wveBreedingValue);
        BigDecimal varMaleGwWwdContribOrchPoll = varParentPropOrchPoll.multiply(wwdBreedingValue);
        

        // --accumulate total SUM(x)
        varSumMaleGwAdContbOrchPoll  = varSumMaleGwAdContbOrchPoll.add(varMaleGwAdContribOrchPoll);
        varSumMaleGwDfsContbOrchPoll = varSumMaleGwDfsContbOrchPoll.add(varMaleGwDfsContribOrchPoll);
        varSumMaleGwDfuContbOrchPoll = varSumMaleGwDfuContbOrchPoll.add(varMaleGwDfuContribOrchPoll);
        varSumMaleGwDfwContbOrchPoll = varSumMaleGwDfwContbOrchPoll.add(varMaleGwDfwContribOrchPoll);
        varSumMaleGwDsbContbOrchPoll = varSumMaleGwDsbContbOrchPoll.add(varMaleGwDsbContribOrchPoll);
        varSumMaleGwDscContbOrchPoll = varSumMaleGwDscContbOrchPoll.add(varMaleGwDscContribOrchPoll);
        varSumMaleGwDsgContbOrchPoll = varSumMaleGwDsgContbOrchPoll.add(varMaleGwDsgContribOrchPoll);
        varSumMaleGwGvoContbOrchPoll = varSumMaleGwGvoContbOrchPoll.add(varMaleGwGvoContribOrchPoll);
        varSumMaleGwIwsContbOrchPoll = varSumMaleGwIwsContbOrchPoll.add(varMaleGwIwsContribOrchPoll);
        varSumMaleGwWduContbOrchPoll = varSumMaleGwWduContbOrchPoll.add(varMaleGwWduContribOrchPoll);
        varSumMaleGwWveContbOrchPoll = varSumMaleGwWveContbOrchPoll.add(varMaleGwWveContribOrchPoll);
        varSumMaleGwWwdContbOrchPoll = varSumMaleGwWwdContbOrchPoll.add(varMaleGwWwdContribOrchPoll);

        // --col:Y
        BigDecimal vfGwAdContrib  = vFemaleCropPop.multiply(adBreedingValue);
        BigDecimal vfGwDfsContrib = vFemaleCropPop.multiply(dfsBreedingValue);
        BigDecimal vfGwDfuContrib = vFemaleCropPop.multiply(dfuBreedingValue);
        BigDecimal vfGwDfwContrib = vFemaleCropPop.multiply(dfwBreedingValue);
        BigDecimal vfGwDsbContrib = vFemaleCropPop.multiply(dsbBreedingValue);
        BigDecimal vfGwDscContrib = vFemaleCropPop.multiply(dscBreedingValue);
        BigDecimal vfGwDsgContrib = vFemaleCropPop.multiply(dsgBreedingValue);
        BigDecimal vfGwGvoContrib = vFemaleCropPop.multiply(gvoBreedingValue);
        BigDecimal vfGwIwsContrib = vFemaleCropPop.multiply(iwsBreedingValue);
        BigDecimal vfGwWduContrib = vFemaleCropPop.multiply(wduBreedingValue);
        BigDecimal vfGwWveContrib = vFemaleCropPop.multiply(wveBreedingValue);
        BigDecimal vfGwWwdContrib = vFemaleCropPop.multiply(wwdBreedingValue);

        // --col:Z (preparing, gathering values)
        BigDecimal adSmpMixBreedingValue  = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "AD");
        BigDecimal dfsSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "DFS");
        BigDecimal dfuSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "DFU");
        BigDecimal dfwSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "DFW");
        BigDecimal dsbSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "DSB");
        BigDecimal dscSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "DSC");
        BigDecimal dsgSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "DSG");
        BigDecimal gvoSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "GVO");
        BigDecimal iwsSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "IWS");
        BigDecimal wduSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "WDU");
        BigDecimal wveSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "WVE");
        BigDecimal wwdSmpMixBreedingValue = getSmpMixTraitValue(ptVals.smpMixIdAndProps(), parentTreeRow.parentTreeId(), "WWD");
        
        // --col:Z
        BigDecimal vmSmpAdContrib  = calcColumnZ(parentTreeRow.smpSuccessPerc(), adSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpDfsContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), dfsSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpDfuContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), dfuSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpDfwContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), dfwSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpDsbContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), dsbSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpDscContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), dscSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpDsgContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), dsgSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpGvoContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), gvoSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpIwsContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), iwsSmpMixBreedingValue,vFemaleCropPop);
        BigDecimal vmSmpWduContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), wduSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpWveContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), wveSmpMixBreedingValue, vFemaleCropPop);
        BigDecimal vmSmpWwdContrib = calcColumnZ(parentTreeRow.smpSuccessPerc(), wwdSmpMixBreedingValue, vFemaleCropPop);

        // --col:AA
        // v_m_contam_contrib := ( (1 - (v_a_smp_success_pct/100)) * (varAnotherNonOrchardPollenContam/100) * v_contaminant_pollen_bv ) * vFemaleCropPop;
        BigDecimal partOne = zero;
        if (parentTreeRow.smpSuccessPerc() > 0) {
          partOne = new BigDecimal(parentTreeRow.smpSuccessPerc()).divide(PERC_DIVISOR, DIVISION_SCALE, halfUp);
        }

        BigDecimal partTwo = zero;
        if (parentTreeRow.nonOrchardPollenContamPct() > 0) {
          partTwo = new BigDecimal(parentTreeRow.nonOrchardPollenContamPct()).divide(PERC_DIVISOR, DIVISION_SCALE, halfUp);
        }
        BigDecimal partThree = BigDecimal.ONE.subtract(partOne).multiply(partTwo).multiply(ptVals.contaminantPollenBv());
        BigDecimal vmContamContrib = partThree.multiply(vFemaleCropPop);

        // --col:AB (depends on SUM(X)=v_sum_m_gw_contrib_orch_poll)
        // v_m_orch_poll_contrib_GVO = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_GVO_contb_orch_poll ) * v_female_crop_pop;
        BigDecimal vmOrchPollContribAd  = calcColumAb(partOne, partTwo, varSumMaleGwAdContbOrchPoll,  vFemaleCropPop);
        BigDecimal vmOrchPollContribDfs = calcColumAb(partOne, partTwo, varSumMaleGwDfsContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribDfu = calcColumAb(partOne, partTwo, varSumMaleGwDfuContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribDfw = calcColumAb(partOne, partTwo, varSumMaleGwDfwContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribDsb = calcColumAb(partOne, partTwo, varSumMaleGwDsbContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribDsc = calcColumAb(partOne, partTwo, varSumMaleGwDscContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribDsg = calcColumAb(partOne, partTwo, varSumMaleGwDsgContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribGvo = calcColumAb(partOne, partTwo, varSumMaleGwGvoContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribIws = calcColumAb(partOne, partTwo, varSumMaleGwIwsContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribWdu = calcColumAb(partOne, partTwo, varSumMaleGwWduContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribWve = calcColumAb(partOne, partTwo, varSumMaleGwWveContbOrchPoll, vFemaleCropPop);
        BigDecimal vmOrchPollContribWwd = calcColumAb(partOne, partTwo, varSumMaleGwWwdContbOrchPoll, vFemaleCropPop);

        // --col:AC (depends on prev value)
        varMaleTotalGwAdContrib  =  vmSmpAdContrib.add(vmContamContrib).add(vmOrchPollContribAd);
        varMaleTotalGwDfsContrib = vmSmpDfsContrib.add(vmContamContrib).add(vmOrchPollContribDfs);
        varMaleTotalGwDfuContrib = vmSmpDfuContrib.add(vmContamContrib).add(vmOrchPollContribDfu);
        varMaleTotalGwDfwContrib = vmSmpDfwContrib.add(vmContamContrib).add(vmOrchPollContribDfw);
        varMaleTotalGwDsbContrib = vmSmpDsbContrib.add(vmContamContrib).add(vmOrchPollContribDsb);
        varMaleTotalGwDscContrib = vmSmpDscContrib.add(vmContamContrib).add(vmOrchPollContribDsc);
        varMaleTotalGwDsgContrib = vmSmpDsgContrib.add(vmContamContrib).add(vmOrchPollContribDsg);
        varMaleTotalGwGvoContrib = vmSmpGvoContrib.add(vmContamContrib).add(vmOrchPollContribGvo);
        varMaleTotalGwIwsContrib = vmSmpIwsContrib.add(vmContamContrib).add(vmOrchPollContribIws);
        varMaleTotalGwWduContrib = vmSmpWduContrib.add(vmContamContrib).add(vmOrchPollContribWdu);
        varMaleTotalGwWveContrib = vmSmpWveContrib.add(vmContamContrib).add(vmOrchPollContribWve);
        varMaleTotalGwWwdContrib = vmSmpWwdContrib.add(vmContamContrib).add(vmOrchPollContribWwd);

        // --col:AD
        BigDecimal varParentTotalGwAdContrib;
        BigDecimal varParentTotalGwDfsContrib;
        BigDecimal varParentTotalGwDfuContrib;
        BigDecimal varParentTotalGwDfwContrib;
        BigDecimal varParentTotalGwDsbContrib;
        BigDecimal varParentTotalGwDscContrib;
        BigDecimal varParentTotalGwDsgContrib;
        BigDecimal varParentTotalGwGvoContrib;
        BigDecimal varParentTotalGwIwsContrib;
        BigDecimal varParentTotalGwWduContrib;
        BigDecimal varParentTotalGwWveContrib;
        BigDecimal varParentTotalGwWwdContrib;
        if (varTotalPollenCount.compareTo(zero) == 0) {
          varParentTotalGwAdContrib  = vfGwAdContrib;
          varParentTotalGwDfsContrib = vfGwDfsContrib;
          varParentTotalGwDfuContrib = vfGwDfuContrib;
          varParentTotalGwDfwContrib = vfGwDfwContrib;
          varParentTotalGwDsbContrib = vfGwDsbContrib;
          varParentTotalGwDscContrib = vfGwDscContrib;
          varParentTotalGwDsgContrib = vfGwDsgContrib;
          varParentTotalGwGvoContrib = vfGwGvoContrib;
          varParentTotalGwIwsContrib = vfGwIwsContrib;
          varParentTotalGwWduContrib = vfGwWduContrib;
          varParentTotalGwWveContrib = vfGwWveContrib;
          varParentTotalGwWwdContrib = vfGwWwdContrib;
        } else {
          BigDecimal two = new BigDecimal("2");

          varParentTotalGwAdContrib  = vfGwAdContrib.add(varMaleTotalGwAdContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwDfsContrib = vfGwDfsContrib.add(varMaleTotalGwDfsContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwDfuContrib = vfGwDfuContrib.add(varMaleTotalGwDfuContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwDfwContrib = vfGwDfwContrib.add(varMaleTotalGwDfwContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwDsbContrib = vfGwDsbContrib.add(varMaleTotalGwDsbContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwDscContrib = vfGwDscContrib.add(varMaleTotalGwDscContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwDsgContrib = vfGwDsgContrib.add(varMaleTotalGwDsgContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwGvoContrib = vfGwGvoContrib.add(varMaleTotalGwGvoContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwIwsContrib = vfGwIwsContrib.add(varMaleTotalGwIwsContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwWduContrib = vfGwWduContrib.add(varMaleTotalGwWduContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwWveContrib = vfGwWveContrib.add(varMaleTotalGwWveContrib).divide(two, DIVISION_SCALE, halfUp);
          varParentTotalGwWwdContrib = vfGwWwdContrib.add(varMaleTotalGwWwdContrib).divide(two, DIVISION_SCALE, halfUp);
        }

        // --Set total gw contrib back into array so it can be displayed/saved
        // TODO: Review here!
        // p_pt(i).total_genetic_worth_contrib := v_p_total_gw_GVO_contrib;
        totalGeneticWorthContrib = varParentTotalGwGvoContrib;

        // v_sum_p_total_gw_GVO_contrib := v_sum_p_total_gw_GVO_contrib + v_p_total_gw_GVO_contrib;
        
        varSumParentTotalGwAdContrib = varSumParentTotalGwAdContrib.add(varParentTotalGwAdContrib);
        varSumParentTotalGwDfsContrib = varSumParentTotalGwDfsContrib.add(varParentTotalGwDfsContrib);
        varSumParentTotalGwDfuContrib = varSumParentTotalGwDfuContrib.add(varParentTotalGwDfuContrib);
        varSumParentTotalGwDfwContrib = varSumParentTotalGwDfwContrib.add(varParentTotalGwDfwContrib);
        varSumParentTotalGwDsbContrib = varSumParentTotalGwDsbContrib.add(varParentTotalGwDsbContrib);
        varSumParentTotalGwDscContrib = varSumParentTotalGwDscContrib.add(varParentTotalGwDscContrib);
        varSumParentTotalGwDsgContrib = varSumParentTotalGwDsgContrib.add(varParentTotalGwDsgContrib);
        varSumParentTotalGwGvoContrib = varSumParentTotalGwGvoContrib.add(varParentTotalGwGvoContrib);
        varSumParentTotalGwIwsContrib = varSumParentTotalGwIwsContrib.add(varParentTotalGwIwsContrib);
        varSumParentTotalGwWduContrib = varSumParentTotalGwWduContrib.add(varParentTotalGwWduContrib);
        varSumParentTotalGwWveContrib = varSumParentTotalGwWveContrib.add(varParentTotalGwWveContrib);
        varSumParentTotalGwWwdContrib = varSumParentTotalGwWwdContrib.add(varParentTotalGwWwdContrib);

        // --col:AE
        if (varTotalPollenCount.compareTo(BigDecimal.ZERO) == 0) {
          varParPropContrib = vFemaleCropPop;
        } else {
          varParPropContrib =
              vFemaleCropPop
                  .add(varParentPropOrchPoll)
                  .divide(new BigDecimal("2"), DIVISION_SCALE, halfUp);
        }

        // --col:AO
        varNeNoSmpContrib = varParPropContrib.pow(2);
        varSumNeNoSmpContrib = varSumNeNoSmpContrib.add(varNeNoSmpContrib);

        // --col:AQ
        varOrchGameteContr =
            vFemaleCropPop
                .add(new BigDecimal("0.75").multiply(varParentPropOrchPoll))
                .divide(new BigDecimal(2))
                .pow(2);
        varSumOrchGameteContr = varSumOrchGameteContr.add(varOrchGameteContr);
      }
    }

    //v_gw_GVO := ROUND(v_sum_p_total_gw_GVO_contrib);
    BigDecimal vgwAd  = varSumParentTotalGwAdContrib; // not rounding, for now
    BigDecimal vgwDfs = varSumParentTotalGwDfsContrib; // not rounding, for now
    BigDecimal vgwDfu = varSumParentTotalGwDfuContrib; // not rounding, for now
    BigDecimal vgwDfw = varSumParentTotalGwDfwContrib; // not rounding, for now
    BigDecimal vgwDsb = varSumParentTotalGwDsbContrib; // not rounding, for now
    BigDecimal vgwDsc = varSumParentTotalGwDscContrib; // not rounding, for now
    BigDecimal vgwDsg = varSumParentTotalGwDsgContrib; // not rounding, for now
    BigDecimal vgwGvo = varSumParentTotalGwGvoContrib; // not rounding, for now
    BigDecimal vgwIws = varSumParentTotalGwIwsContrib; // not rounding, for now
    BigDecimal vgwWdu = varSumParentTotalGwWduContrib; // not rounding, for now
    BigDecimal vgwWve = varSumParentTotalGwWveContrib; // not rounding, for now
    BigDecimal vgwWwd = varSumParentTotalGwWwdContrib; // not rounding, for now

    SparLog.info("vgwAd: {}", vgwAd);
    SparLog.info("vgwDfs: {}", vgwDfs);
    SparLog.info("vgwDfu: {}", vgwDfu);
    SparLog.info("vgwDfw: {}", vgwDfw);
    SparLog.info("vgwDsb: {}", vgwDsb);
    SparLog.info("vgwDsc: {}", vgwDsc);
    SparLog.info("vgwDsg: {}", vgwDsg);
    SparLog.info("vgwGvo: {}", vgwGvo);
    SparLog.info("vgwIws: {}", vgwIws);
    SparLog.info("vgwWdu: {}", vgwWdu);
    SparLog.info("vgwWve: {}", vgwWve);
    SparLog.info("vgwWwd: {}", vgwWwd);

    BigDecimal coancestry = null;
    BigDecimal neValue =
        geneticWorthService.calculateNe(
            coancestry, varSumOrchGameteContr, varSumNeNoSmpContrib, ptVals.smpParentsOutside());

    CalculatedParentTreeValsDto calculatedVals = new CalculatedParentTreeValsDto();
    calculatedVals.setNeValue(neValue);

    GeospatialRespondDto smpMixGeoData = calcMeanGeospatial(ptVals.smpMixIdAndProps());
    SparLog.info("SMP mix mean geospatial calculation complete.");

    calculatedVals.setGeospatialData(calcSeedlotGeoData(ptVals, smpMixGeoData));
    SparLog.info("Seedlot mean geospatial calculation complete.");

    List<GeneticWorthTraitsDto> calculatedGws =
        geneticWorthService.calculateGeneticWorth(ptVals.orchardPtVals());

    PtCalculationResDto summaryDto =
        new PtCalculationResDto(calculatedGws, calculatedVals, smpMixGeoData);

    return summaryDto;
  }

  private BigDecimal calcColumnZ(Integer smpSuccessPerc, BigDecimal smpMixBv, BigDecimal femaleCropProp) {
    return new BigDecimal(smpSuccessPerc)
            .multiply(smpMixBv)
            .divide(PERC_DIVISOR, DIVISION_SCALE, halfUp)
            .multiply(femaleCropProp);
  }

  private BigDecimal calcColumAb(BigDecimal partOne, BigDecimal partTwo, BigDecimal varSumMaleGwGvoContbOrchPoll, BigDecimal v_female_crop_pop) {
    BigDecimal partThree = BigDecimal.ONE.subtract(partOne).subtract(partTwo);
    return partThree.multiply(varSumMaleGwGvoContbOrchPoll).multiply(v_female_crop_pop);
  }

  /**
   * Finds the genetic trait value given the request dto and the trait that should be found.
   *
   * @param dto A {@link OrchardParentTreeValsDto} instance with the traits value.
   * @param traitCode The trait code that should be considered.
   * @return a BigDecimal representing the trait value or BigDecimal.ZERO otherwise.
   */
  private BigDecimal getTraitValue(OrchardParentTreeValsDto traitDto, String traitCode) {
    List<GeneticWorthTraitsDto> geneticTraits = traitDto.geneticTraits();
    Optional<GeneticWorthTraitsDto> traitOptional =
        geneticTraits.stream()
            .filter(x -> x.traitCode().equalsIgnoreCase(traitCode))
            .findFirst();
    return traitOptional.isEmpty() ? BigDecimal.ZERO : traitOptional.get().traitValue();
  }

  private BigDecimal getSmpMixTraitValue(List<GeospatialRequestDto> smpMixIdAndProps, String parentTreeId, String traitCode) {
    Optional<GeospatialRequestDto> smpMixValuesOp = smpMixIdAndProps.stream().filter(x -> x.parentTreeId().equals(Long.parseLong(parentTreeId))).findFirst();
    if (smpMixValuesOp.isEmpty()) {
      return BigDecimal.ZERO;
    }

    GeospatialRequestDto smpMixValues = smpMixValuesOp.get();

    List<GeneticWorthTraitsDto> geneticTraits = smpMixValues.geneticTraits();
    Optional<GeneticWorthTraitsDto> traitOptional =
        geneticTraits.stream()
            .filter(x -> x.traitCode().equalsIgnoreCase(traitCode))
            .findFirst();
    return traitOptional.isEmpty() ? BigDecimal.ZERO : traitOptional.get().traitValue();
  }

  /**
   * Calculate mean geospatial values given a list of {@link GeospatialRequestDto}.
   *
   * @param ptreeIdAndProportions List of parent tree id and proportion.
   * @return A List of {@link GeospatialRespondDto}
   */
  private GeospatialRespondDto calcMeanGeospatial(
      List<GeospatialRequestDto> ptreeIdAndProportions) {
    SparLog.info(
        "{} parent tree record(s) received to calculate lat long and elevation",
        ptreeIdAndProportions.size());

    List<Long> ptIds =
        ptreeIdAndProportions.stream().map(GeospatialRequestDto::parentTreeId).toList();

    List<GeospatialOracleResDto> oracleDtoList =
        oracleApiProvider.getPtGeospatialDataByIdList(ptIds);

    if (oracleDtoList.isEmpty() && !ptreeIdAndProportions.isEmpty()) {
      SparLog.info(
          "Parent tree ids not found from Oracle for the given parent tree ids: {}",
          ptreeIdAndProportions.stream().map(GeospatialRequestDto::parentTreeId).toList());
      throw new PtGeoDataNotFoundException();
    }

    Map<Long, GeospatialOracleResDto> oracleMap =
        oracleDtoList.stream()
            .collect(Collectors.toMap(GeospatialOracleResDto::parentTreeId, Function.identity()));

    // Accumulators of weighted values, convert DMS to minutes (legacy algo) then sum it up.
    BigDecimal meanLatMinSum = BigDecimal.ZERO;
    BigDecimal meanLongMinSum = BigDecimal.ZERO;
    BigDecimal meanElevationSum = BigDecimal.ZERO;

    // Loop through list to calculate weighted values then sum them up.
    // Reference: legacy SPAR database/ddl/pkg/SPR_001A_SMP_CALCULATION.PKS
    for (GeospatialRequestDto dto : ptreeIdAndProportions) {
      // frontend already do this:

      GeospatialOracleResDto geospatialResDto = oracleMap.get(dto.parentTreeId());
      if (Objects.isNull(geospatialResDto)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!", dto.parentTreeId());
        continue;
      }

      // Definition: weighted value = proportion * value

      BigDecimal proportion = dto.proportion();
      if (proportion.compareTo(ONE) > 0) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            String.format(
                "Invalid proportion with %s for parent tree id: %s.",
                proportion.toString(), dto.parentTreeId().toString()));
      }

      // Elevation
      BigDecimal weightedElevation =
          proportion.multiply(new BigDecimal(geospatialResDto.elevation()));
      meanElevationSum = meanElevationSum.add(weightedElevation);

      // Latitude
      Integer[] ptLatDms =
          new Integer[] {
            geospatialResDto.latitudeDegree(),
            geospatialResDto.latitudeMinute(),
            geospatialResDto.latitudeSecond()
          };
      BigDecimal latMinute = LatLongUtil.dmsToMinute(ptLatDms);
      BigDecimal weightedLatMin = proportion.multiply(latMinute);
      meanLatMinSum = meanLatMinSum.add(weightedLatMin);

      // Longitude
      Integer[] ptLongDms =
          new Integer[] {
            geospatialResDto.longitudeDegree(),
            geospatialResDto.longitudeMinute(),
            geospatialResDto.longitudeSecond()
          };
      BigDecimal longMinute = LatLongUtil.dmsToMinute(ptLongDms);
      BigDecimal weightedLongMin = proportion.multiply(longMinute);
      meanLongMinSum = meanLongMinSum.add(weightedLongMin);
    }

    // latitude
    Integer[] latitudeDms = LatLongUtil.minuteToDms(meanLatMinSum);
    BigDecimal latitudeDecimalDegree = LatLongUtil.dmsToDecimalDegree(latitudeDms);

    // longitude
    Integer[] longitudeDms = LatLongUtil.minuteToDms(meanLongMinSum);
    BigDecimal longitudeDecimalDegree = LatLongUtil.dmsToDecimalDegree(longitudeDms);

    GeospatialRespondDto result = new GeospatialRespondDto();

    result.setMeanElevation(meanElevationSum.intValue());
    result.setMeanLatitudeDegree(latitudeDms[0]);
    result.setMeanLatitudeMinute(latitudeDms[1]);
    result.setMeanLatitudeSecond(latitudeDms[2]);
    result.setMeanLongitudeDegree(longitudeDms[0]);
    result.setMeanLongitudeMinute(longitudeDms[1]);
    result.setMeanLongitudeSecond(longitudeDms[2]);
    result.setMeanLatitude(latitudeDecimalDegree);
    result.setMeanLongitude(longitudeDecimalDegree);

    return result;
  }

  /**
   * All reference to Certification Template Col is labelled with an id such as AM, AN or AL Find
   * these calculation definition in SPR01A_PTContribution.htm
   */
  private GeospatialRespondDto calcSeedlotGeoData(
      PtValsCalReqDto ptValDtos, GeospatialRespondDto smpMixGeoData) {
    List<OrchardParentTreeValsDto> orchardPtVals = ptValDtos.orchardPtVals();

    BigDecimal totalConeCount =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::coneCount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalPollenCount =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::pollenCount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    List<Long> orchardPtIds =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::parentTreeId)
            .map(Long::parseLong)
            .toList();
    List<GeospatialOracleResDto> orchardPtGeoData =
        oracleApiProvider.getPtGeospatialDataByIdList(orchardPtIds);

    Map<Long, GeospatialOracleResDto> orchardPtGeoDataMap =
        orchardPtGeoData.stream()
            .collect(Collectors.toMap(GeospatialOracleResDto::parentTreeId, Function.identity()));

    BigDecimal wtdLatMinuteSum = BigDecimal.ZERO;
    BigDecimal wtdLongMinuteSum = BigDecimal.ZERO;
    BigDecimal wtdElevSum = BigDecimal.ZERO;

    for (OrchardParentTreeValsDto ptVal : orchardPtVals) {

      GeospatialOracleResDto ptGeoData =
          orchardPtGeoDataMap.get(Long.valueOf(ptVal.parentTreeId()));

      if (Objects.isNull(ptGeoData)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!",
            ptVal.parentTreeId());
        continue;
      }

      BigDecimal femaleCropPop = calcFemaleCropPop(ptVal, totalConeCount);

      BigDecimal proportion = calcProportion(ptVal, femaleCropPop, totalPollenCount);

      BigDecimal smpSuccessPerc = new BigDecimal(ptVal.smpSuccessPerc());

      /*
       * Mean Lat = SUM(Wtd Lat. with parent and SMP pollen)
       * Wtd Lat. with parent and SMP pollen is defined in  w/ id = AM
       *
       *  STEP 3
       *  AM:
       *  v_wtd_lat_p_and_smp_poll := v_p_contrib_lat_no_smp_poll + v_smp_poll_wtd_contrib_lat;
       *  v_sum_wtd_lat_p_and_smp_poll := v_sum_wtd_lat_p_and_smp_poll + v_wtd_lat_p_and_smp_poll;
       *
       *  STEP 2
       *  AG:
       *  v_p_contrib_lat_no_smp_poll :=
       *      v_coll_lat * (varParPropContrib-((v_female_crop_pop*v_a_smp_success_pct)/200));
       *
       *  STEP 1
       *  AJ:
       *  v_smp_poll_wtd_contrib_lat := ((v_lat * v_a_smp_success_pct)/200)*v_female_crop_pop;
       *
       *  STEP 0
       *  T:
       *  v_lat := (v_a_smp_mix_latitude_degrees*3600) + (v_a_smp_mix_latitude_minutes*60);
       *  Although smp_mix_latitude_degrees and smp_mix_minutes are individual values
       *  in the Oracle Seedlot_Parent_Tree table, according to SPR_001A_SMP_CALCULATION.PKS,
       *  those values are the same for a given seedlot, calculated from v_sum_wtd_lat.
       *
       *  NOTE: We use decimal degrees instead of converting everything to seconds.
       */

      // Step 0 - smpMixLat is v_lat as the name v_lat is too generic
      BigDecimal smpMixLat = smpMixGeoData.getMeanLatitude();

      // Step 1
      BigDecimal smpPollWtdContribLat =
          smpMixLat.multiply(smpSuccessPerc).divide(PROP_DIVISOR).multiply(femaleCropPop);

      // Step 2
      Integer[] latDms =
          new Integer[] {
            ptGeoData.latitudeDegree(), ptGeoData.latitudeMinute(), ptGeoData.latitudeSecond()
          };
      BigDecimal ptLatMinute = LatLongUtil.dmsToMinute(latDms);
      BigDecimal parentContribLatNoSmpPoll = ptLatMinute.multiply(proportion);

      // Step 3
      BigDecimal wtdParentLat = parentContribLatNoSmpPoll.add(smpPollWtdContribLat);
      wtdLatMinuteSum = wtdLatMinuteSum.add(wtdParentLat);

      // Mean Long = SUM(Wtd. Long. with parent and SMP pollen)
      // Wtd Long. with parent and SMP pollen is defined in Certification Template Col w/ id
      // AN
      // Calculations are similar to those of Lat's, but with long values
      BigDecimal smpMixLong = smpMixGeoData.getMeanLongitude();

      BigDecimal smpPollWtdContribLong =
          smpMixLong.multiply(smpSuccessPerc).divide(PROP_DIVISOR).multiply(femaleCropPop);

      Integer[] longDms =
          new Integer[] {
            ptGeoData.longitudeDegree(), ptGeoData.longitudeMinute(), ptGeoData.longitudeSecond()
          };
      BigDecimal ptLongMinute = LatLongUtil.dmsToMinute(longDms);
      BigDecimal parentContribLongNoSmpPoll = ptLongMinute.multiply(proportion);

      BigDecimal wtdParentLong = parentContribLongNoSmpPoll.add(smpPollWtdContribLong);
      wtdLongMinuteSum = wtdLongMinuteSum.add(wtdParentLong);

      // Mean Elev. = SUM(Wtd. elev with parent and SMP pollen)
      // Wtd elev. with parent and SMP pollen is defined in Certification Template Col w/ id
      // AL
      // Calculations are similar to those of Lat's, but with elevation values
      BigDecimal smpMixElev = new BigDecimal(smpMixGeoData.getMeanElevation());

      BigDecimal smpPollWtdContribElev =
          smpMixElev.multiply(smpSuccessPerc).divide(PROP_DIVISOR).multiply(femaleCropPop);

      BigDecimal ptElev = new BigDecimal(ptGeoData.elevation());
      BigDecimal parentContribElevNoSmpPoll = ptElev.multiply(proportion);

      BigDecimal wtdParentElev = parentContribElevNoSmpPoll.add(smpPollWtdContribElev);
      wtdElevSum = wtdElevSum.add(wtdParentElev);
    }

    GeospatialRespondDto result = new GeospatialRespondDto();

    Integer[] latDms = LatLongUtil.minuteToDms(wtdLatMinuteSum);
    result.setMeanLatitudeDegree(latDms[0]);
    result.setMeanLatitudeMinute(latDms[1]);
    result.setMeanLatitudeSecond(latDms[2]);

    Integer[] longDms = LatLongUtil.minuteToDms(wtdLongMinuteSum);
    result.setMeanLongitudeDegree(longDms[0]);
    result.setMeanLongitudeMinute(longDms[1]);
    result.setMeanLongitudeSecond(longDms[2]);

    result.setMeanElevation(wtdElevSum.setScale(0, RoundingMode.HALF_UP).intValue());
    result.setMeanLatitude(LatLongUtil.dmsToDecimalDegree(latDms));
    result.setMeanLongitude(LatLongUtil.dmsToDecimalDegree(longDms));

    return result;
  }

  /**
   * Calculate the proportion for parent contribution without SMP Pollen.
   *
   * @return prop = varParPropContrib-((v_female_crop_pop*v_a_smp_success_pct)/200)
   */
  private BigDecimal calcProportion(
      OrchardParentTreeValsDto ptValDto, BigDecimal femaleCropPop, BigDecimal totalPollenCount) {
    /*
     * REFERENCE v_parent_prop_orch_poll
     * --col:W
     * IF v_total_pollen_count = 0 THEN
     *  v_parent_prop_orch_poll := 0;
     * ELSE
     *  v_parent_prop_orch_poll := NVL(p_pt(i).pollen_count,0) / v_total_pollen_count;
     */
    BigDecimal parentPropOrchPoll = BigDecimal.ZERO;
    if (!totalPollenCount.equals(BigDecimal.ZERO)) {
      parentPropOrchPoll =
          ptValDto.pollenCount().divide(totalPollenCount, DIVISION_SCALE, RoundingMode.HALF_UP);
    }

    /*
     * REFERENCE varParPropContrib
     * --col:AE
     * IF v_total_pollen_count = 0 THEN
     *  varParPropContrib := v_female_crop_pop;
     * ELSE
     *  varParPropContrib := (v_female_crop_pop + v_parent_prop_orch_poll) / 2;
     */
    BigDecimal parentPropContrib;
    if (totalPollenCount.equals(BigDecimal.ZERO)) {
      parentPropContrib = femaleCropPop;
    } else {
      parentPropContrib = (femaleCropPop.add(parentPropOrchPoll)).divide(HALF_DIVISOR);
    }

    BigDecimal smpSuccessPerc = new BigDecimal(ptValDto.smpSuccessPerc()).divide(PERC_DIVISOR);

    // prop = varParPropContrib-((v_female_crop_pop*v_a_smp_success_pct)/200)
    BigDecimal prop =
        parentPropContrib.subtract((femaleCropPop).multiply(smpSuccessPerc).divide(PROP_DIVISOR));

    return prop;
  }

  private BigDecimal calcFemaleCropPop(
      OrchardParentTreeValsDto ptValDto, BigDecimal totalConeCount) {
    /*
     * REFERENCE v_female_crop_pop
     * --col:V
     * IF v_total_cone_count = 0 THEN
     *   v_female_crop_pop := 0;
     * ELSE
     *    v_female_crop_pop := v_a_cone_count / v_total_cone_count;
     */
    BigDecimal femaleCropPop = BigDecimal.ZERO;

    if (!totalConeCount.equals(BigDecimal.ZERO)) {
      femaleCropPop =
          ptValDto.coneCount().divide(totalConeCount, DIVISION_SCALE, RoundingMode.HALF_UP);
    }

    return femaleCropPop;
  }
}
