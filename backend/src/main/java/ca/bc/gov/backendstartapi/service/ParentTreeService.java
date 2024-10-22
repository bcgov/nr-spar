package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CalculatedParentTreeValsDto;
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
import java.util.ArrayList;
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
  //CHECKSTYLE:OFF: VariableDeclarationUsageDistance
  public PtCalculationResDto calculatePtVals(PtValsCalReqDto ptVals) {
    SparLog.info(
        "Started calculation for parent tree contribution values. Number of orchard parent received:"
            + " {}. Number of SMP mix parent tree received: {}.",
        ptVals.orchardPtVals().size(),
        ptVals.smpMixIdAndProps().size());

    final BigDecimal zero = BigDecimal.ZERO;

    BigDecimal totalConeCount = zero;
    BigDecimal totalPollenCount = zero;
    // --First pass to calculate simple sums used in row-based calcs
    // --and to check if all bv d/r/m are estimated.
    for (OrchardParentTreeValsDto orchardPtVals : ptVals.orchardPtVals()) {
      totalConeCount = totalConeCount.add(orchardPtVals.coneCount());
      totalPollenCount = totalPollenCount.add(orchardPtVals.pollenCount());
    }

    BigDecimal parentPropOrchPoll;
    BigDecimal sumMaleGwAdContbOrchPoll = zero;
    BigDecimal sumMaleGwDfsContbOrchPoll = zero;
    BigDecimal sumMaleGwDfuContbOrchPoll = zero;
    BigDecimal sumMaleGwDfwContbOrchPoll = zero;
    BigDecimal sumMaleGwDsbContbOrchPoll = zero;
    BigDecimal sumMaleGwDscContbOrchPoll = zero;
    BigDecimal sumMaleGwDsgContbOrchPoll = zero;
    BigDecimal sumMaleGwGvoContbOrchPoll = zero;
    BigDecimal sumMaleGwIwsContbOrchPoll = zero;
    BigDecimal sumMaleGwWduContbOrchPoll = zero;
    BigDecimal sumMaleGwWveContbOrchPoll = zero;
    BigDecimal sumMaleGwWwdContbOrchPoll = zero;

    // --Second pass to calculate total male gw contribution orchard pollen
    // --(uses v_total_pollen_count from first pass)
    for (OrchardParentTreeValsDto parentTreeRow : ptVals.orchardPtVals()) {
      // --col:W
      if (!ValueUtil.hasValue(totalPollenCount)) {
        parentPropOrchPoll = zero;
      } else {
        parentPropOrchPoll =
            parentTreeRow.pollenCount().divide(totalPollenCount, DIVISION_SCALE, halfUp);
      }

      // --col:X
      BigDecimal maleGwAdContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "AD"));
      BigDecimal maleGwDfsContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "DFS"));
      BigDecimal maleGwDfuContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "DFU"));
      BigDecimal maleGwDfwContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "DFW"));
      BigDecimal maleGwDsbContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "DSB"));
      BigDecimal maleGwDscContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "DSC"));
      BigDecimal maleGwDsgContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "DSG"));
      BigDecimal maleGwGvoContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "GVO"));
      BigDecimal maleGwIwsContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "IWS"));
      BigDecimal maleGwWduContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "WDU"));
      BigDecimal maleGwWveContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "WVE"));
      BigDecimal maleGwWwdContribOrchPoll =
          parentPropOrchPoll.multiply(getTraitValue(parentTreeRow, "WWD"));

      // --accumulate total SUM(x)
      sumMaleGwAdContbOrchPoll = sumMaleGwAdContbOrchPoll.add(maleGwAdContribOrchPoll);
      sumMaleGwDfsContbOrchPoll = sumMaleGwDfsContbOrchPoll.add(maleGwDfsContribOrchPoll);
      sumMaleGwDfuContbOrchPoll = sumMaleGwDfuContbOrchPoll.add(maleGwDfuContribOrchPoll);
      sumMaleGwDfwContbOrchPoll = sumMaleGwDfwContbOrchPoll.add(maleGwDfwContribOrchPoll);
      sumMaleGwDsbContbOrchPoll = sumMaleGwDsbContbOrchPoll.add(maleGwDsbContribOrchPoll);
      sumMaleGwDscContbOrchPoll = sumMaleGwDscContbOrchPoll.add(maleGwDscContribOrchPoll);
      sumMaleGwDsgContbOrchPoll = sumMaleGwDsgContbOrchPoll.add(maleGwDsgContribOrchPoll);
      sumMaleGwGvoContbOrchPoll = sumMaleGwGvoContbOrchPoll.add(maleGwGvoContribOrchPoll);
      sumMaleGwIwsContbOrchPoll = sumMaleGwIwsContbOrchPoll.add(maleGwIwsContribOrchPoll);
      sumMaleGwWduContbOrchPoll = sumMaleGwWduContbOrchPoll.add(maleGwWduContribOrchPoll);
      sumMaleGwWveContbOrchPoll = sumMaleGwWveContbOrchPoll.add(maleGwWveContribOrchPoll);
      sumMaleGwWwdContbOrchPoll = sumMaleGwWwdContbOrchPoll.add(maleGwWwdContribOrchPoll);
    }

    // Third pass
    BigDecimal sumOrchGameteContr = zero;
    BigDecimal orchGameteContr;
    BigDecimal sumNeNoSmpContrib = zero;
    BigDecimal femaleCropPop;
    BigDecimal parentPropContrib = null;
    BigDecimal sumParentPropContrib = zero;
    BigDecimal neNoSmpContrib = null;

    BigDecimal maleTotalGwAdContrib;
    BigDecimal maleTotalGwDfsContrib;
    BigDecimal maleTotalGwDfuContrib;
    BigDecimal maleTotalGwDfwContrib;
    BigDecimal maleTotalGwDsbContrib;
    BigDecimal maleTotalGwDscContrib;
    BigDecimal maleTotalGwDsgContrib;
    BigDecimal maleTotalGwGvoContrib;
    BigDecimal maleTotalGwIwsContrib;
    BigDecimal maleTotalGwWduContrib;
    BigDecimal maleTotalGwWveContrib;
    BigDecimal maleTotalGwWwdContrib;

    BigDecimal sumParentTotalGwAdContrib = zero;
    BigDecimal sumParentTotalGwDfsContrib = zero;
    BigDecimal sumParentTotalGwDfuContrib = zero;
    BigDecimal sumParentTotalGwDfwContrib = zero;
    BigDecimal sumParentTotalGwDsbContrib = zero;
    BigDecimal sumParentTotalGwDscContrib = zero;
    BigDecimal sumParentTotalGwDsgContrib = zero;
    BigDecimal sumParentTotalGwGvoContrib = zero;
    BigDecimal sumParentTotalGwIwsContrib = zero;
    BigDecimal sumParentTotalGwWduContrib = zero;
    BigDecimal sumParentTotalGwWveContrib = zero;
    BigDecimal sumParentTotalGwWwdContrib = zero;

    BigDecimal pctTestedParentTreesAd = zero;
    BigDecimal pctTestedParentTreesDfs = zero;
    BigDecimal pctTestedParentTreesDfu = zero;
    BigDecimal pctTestedParentTreesDfw = zero;
    BigDecimal pctTestedParentTreesDsb = zero;
    BigDecimal pctTestedParentTreesDsc = zero;
    BigDecimal pctTestedParentTreesDsg = zero;
    BigDecimal pctTestedParentTreesGvo = zero;
    BigDecimal pctTestedParentTreesIws = zero;
    BigDecimal pctTestedParentTreesWdu = zero;
    BigDecimal pctTestedParentTreesWve = zero;
    BigDecimal pctTestedParentTreesWwd = zero;

    BigDecimal parentTotalGwAdContrib;
    BigDecimal parentTotalGwDfsContrib;
    BigDecimal parentTotalGwDfuContrib;
    BigDecimal parentTotalGwDfwContrib;
    BigDecimal parentTotalGwDsbContrib;
    BigDecimal parentTotalGwDscContrib;
    BigDecimal parentTotalGwDsgContrib;
    BigDecimal parentTotalGwGvoContrib;
    BigDecimal parentTotalGwIwsContrib;
    BigDecimal parentTotalGwWduContrib;
    BigDecimal parentTotalGwWveContrib;
    BigDecimal parentTotalGwWwdContrib;

    double smpSuccessWtdByfp;
    double sumSmpSuccessWtdByfp = 0;
    Integer totalNonOrchardPollen = 0;
    Integer numNonOrchardPollen = 0;

    double contaminantPollenBvDouble = 0;
    if (ValueUtil.hasValue(ptVals.contaminantPollenBv())) {
      contaminantPollenBvDouble = ptVals.contaminantPollenBv().doubleValue();
    }

    SparLog.debug("contaminantPollenBvDouble: {}", contaminantPollenBvDouble);

    // --Third pass to calc values that depend on totals derived above and the remainder
    for (OrchardParentTreeValsDto parentTreeRow : ptVals.orchardPtVals()) {
      // --Ignore rows without cone or pollen count
      if (ValueUtil.hasValue(parentTreeRow.coneCount())
          || ValueUtil.hasValue(parentTreeRow.pollenCount())) {
        BigDecimal ptPollenCount = parentTreeRow.pollenCount();
        BigDecimal ptConeCount = parentTreeRow.coneCount();

        // --values to calc avg non-orchard pollen contamination pct (only contribute to avg if
        // specified)
        if (ValueUtil.hasValue(parentTreeRow.nonOrchardPollenContamPct())) {
          totalNonOrchardPollen += parentTreeRow.nonOrchardPollenContamPct();
          numNonOrchardPollen = numNonOrchardPollen + 1;
        }

        // --col:V
        // femaleCropPop <-- same as fi, same as FEMALE(i), same as Female proportion
        if (!ValueUtil.hasValue(totalConeCount)) {
          femaleCropPop = zero;
        } else {
          femaleCropPop = ptConeCount.divide(totalConeCount, DIVISION_SCALE, halfUp);
        }

        // --col:W
        // parentPropOrchPoll <-- same as mi, same as MALE(i), same as Male proportion
        if (!ValueUtil.hasValue(totalPollenCount)) {
          parentPropOrchPoll = zero;
        } else {
          parentPropOrchPoll = ptPollenCount.divide(totalPollenCount, DIVISION_SCALE, halfUp);
        }

        // --col:Y
        BigDecimal vfGwAdContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "AD"));
        BigDecimal vfGwDfsContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "DFS"));
        BigDecimal vfGwDfuContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "DFU"));
        BigDecimal vfGwDfwContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "DFW"));
        BigDecimal vfGwDsbContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "DSB"));
        BigDecimal vfGwDscContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "DSC"));
        BigDecimal vfGwDsgContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "DSG"));
        BigDecimal vfGwGvoContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "GVO"));
        BigDecimal vfGwIwsContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "IWS"));
        BigDecimal vfGwWduContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "WDU"));
        BigDecimal vfGwWveContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "WVE"));
        BigDecimal vfGwWwdContrib = femaleCropPop.multiply(getTraitValue(parentTreeRow, "WWD"));

        // Aux values
        double auxValueAa =
            (1 - ((double) parentTreeRow.smpSuccessPerc() / 100))
                * ((double) parentTreeRow.nonOrchardPollenContamPct() / 100);

        // --col:AA
        double vmContamContrib =
            (auxValueAa * contaminantPollenBvDouble) * femaleCropPop.doubleValue();

        // --col:AB (depends on SUM(X)=v_sum_m_gw_contrib_orch_poll)
        double auxValueAb =
            (1
                - ((double) parentTreeRow.smpSuccessPerc() / 100)
                - ((double) parentTreeRow.nonOrchardPollenContamPct() / 100));

        double maleOrchPollContribAd =
            auxValueAb * sumMaleGwAdContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribDfs =
            auxValueAb * sumMaleGwDfsContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribDfu =
            auxValueAb * sumMaleGwDfuContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribDfw =
            auxValueAb * sumMaleGwDfwContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribDsb =
            auxValueAb * sumMaleGwDsbContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribDsc =
            auxValueAb * sumMaleGwDscContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribDsg =
            auxValueAb * sumMaleGwDsgContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribGvo =
            auxValueAb * sumMaleGwGvoContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribIws =
            auxValueAb * sumMaleGwIwsContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribWdu =
            auxValueAb * sumMaleGwWduContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribWve =
            auxValueAb * sumMaleGwWveContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();
        double maleOrchPollContribWwd =
            auxValueAb * sumMaleGwWwdContbOrchPoll.doubleValue() * femaleCropPop.doubleValue();

        // --col:AC (depends on prev value)
        maleTotalGwAdContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribAd);
        maleTotalGwDfsContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribDfs);
        maleTotalGwDfuContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribDfu);
        maleTotalGwDfwContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribDfw);
        maleTotalGwDsbContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribDsb);
        maleTotalGwDscContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribDsc);
        maleTotalGwDsgContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribDsg);
        maleTotalGwGvoContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribGvo);
        maleTotalGwIwsContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribIws);
        maleTotalGwWduContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribWdu);
        maleTotalGwWveContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribWve);
        maleTotalGwWwdContrib = BigDecimal.valueOf(0d + vmContamContrib + maleOrchPollContribWwd);

        // --col:AD
        if (!ValueUtil.hasValue(totalPollenCount)) {
          parentTotalGwAdContrib = vfGwAdContrib;
          parentTotalGwDfsContrib = vfGwDfsContrib;
          parentTotalGwDfuContrib = vfGwDfuContrib;
          parentTotalGwDfwContrib = vfGwDfwContrib;
          parentTotalGwDsbContrib = vfGwDsbContrib;
          parentTotalGwDscContrib = vfGwDscContrib;
          parentTotalGwDsgContrib = vfGwDsgContrib;
          parentTotalGwGvoContrib = vfGwGvoContrib;
          parentTotalGwIwsContrib = vfGwIwsContrib;
          parentTotalGwWduContrib = vfGwWduContrib;
          parentTotalGwWveContrib = vfGwWveContrib;
          parentTotalGwWwdContrib = vfGwWwdContrib;
        } else {
          BigDecimal two = BigDecimal.valueOf(2);

          parentTotalGwAdContrib =
              vfGwAdContrib.add(maleTotalGwAdContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwDfsContrib =
              vfGwDfsContrib.add(maleTotalGwDfsContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwDfuContrib =
              vfGwDfuContrib.add(maleTotalGwDfuContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwDfwContrib =
              vfGwDfwContrib.add(maleTotalGwDfwContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwDsbContrib =
              vfGwDsbContrib.add(maleTotalGwDsbContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwDscContrib =
              vfGwDscContrib.add(maleTotalGwDscContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwDsgContrib =
              vfGwDsgContrib.add(maleTotalGwDsgContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwGvoContrib =
              vfGwGvoContrib.add(maleTotalGwGvoContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwIwsContrib =
              vfGwIwsContrib.add(maleTotalGwIwsContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwWduContrib =
              vfGwWduContrib.add(maleTotalGwWduContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwWveContrib =
              vfGwWveContrib.add(maleTotalGwWveContrib).divide(two, DIVISION_SCALE, halfUp);
          parentTotalGwWwdContrib =
              vfGwWwdContrib.add(maleTotalGwWwdContrib).divide(two, DIVISION_SCALE, halfUp);
        }

        // --Set total gw contrib back into array so it can be displayed/saved
        // totalGeneticWorthContrib = parentTotalGwGvoContrib;

        // --SUM(AD)
        sumParentTotalGwAdContrib = sumParentTotalGwAdContrib.add(parentTotalGwAdContrib);
        sumParentTotalGwDfsContrib = sumParentTotalGwDfsContrib.add(parentTotalGwDfsContrib);
        sumParentTotalGwDfuContrib = sumParentTotalGwDfuContrib.add(parentTotalGwDfuContrib);
        sumParentTotalGwDfwContrib = sumParentTotalGwDfwContrib.add(parentTotalGwDfwContrib);
        sumParentTotalGwDsbContrib = sumParentTotalGwDsbContrib.add(parentTotalGwDsbContrib);
        sumParentTotalGwDscContrib = sumParentTotalGwDscContrib.add(parentTotalGwDscContrib);
        sumParentTotalGwDsgContrib = sumParentTotalGwDsgContrib.add(parentTotalGwDsgContrib);
        sumParentTotalGwGvoContrib = sumParentTotalGwGvoContrib.add(parentTotalGwGvoContrib);
        sumParentTotalGwIwsContrib = sumParentTotalGwIwsContrib.add(parentTotalGwIwsContrib);
        sumParentTotalGwWduContrib = sumParentTotalGwWduContrib.add(parentTotalGwWduContrib);
        sumParentTotalGwWveContrib = sumParentTotalGwWveContrib.add(parentTotalGwWveContrib);
        sumParentTotalGwWwdContrib = sumParentTotalGwWwdContrib.add(parentTotalGwWwdContrib);

        // --col:AE
        if (totalPollenCount.compareTo(BigDecimal.ZERO) == 0) {
          parentPropContrib = femaleCropPop;
        } else {
          parentPropContrib =
              femaleCropPop
                  .add(parentPropOrchPoll)
                  .divide(new BigDecimal("2"), DIVISION_SCALE, halfUp);
        }
        sumParentPropContrib = sumParentPropContrib.add(parentPropContrib);

        // --col:AO
        neNoSmpContrib = parentPropContrib.pow(2);
        sumNeNoSmpContrib = sumNeNoSmpContrib.add(neNoSmpContrib);

        // --col:AP (xls did /100 so left in for comparison and * 100 at end to get smp success %)
        smpSuccessWtdByfp = (femaleCropPop.doubleValue() * parentTreeRow.smpSuccessPerc()) / 100;
        sumSmpSuccessWtdByfp = sumSmpSuccessWtdByfp + smpSuccessWtdByfp;

        // --col:AQ
        orchGameteContr =
            femaleCropPop
                .add(new BigDecimal("0.75").multiply(parentPropOrchPoll))
                .divide(new BigDecimal(2))
                .pow(2);
        sumOrchGameteContr = sumOrchGameteContr.add(orchGameteContr);

        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "AD"))) {
          pctTestedParentTreesAd = pctTestedParentTreesAd.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "DFS"))) {
          pctTestedParentTreesDfs = pctTestedParentTreesDfs.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "DFU"))) {
          pctTestedParentTreesDfu = pctTestedParentTreesDfu.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "DFW"))) {
          pctTestedParentTreesDfw = pctTestedParentTreesDfw.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "DSB"))) {
          pctTestedParentTreesDsb = pctTestedParentTreesDsb.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "DSC"))) {
          pctTestedParentTreesDsc = pctTestedParentTreesDsc.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "DSG"))) {
          pctTestedParentTreesDsg = pctTestedParentTreesDsg.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "GVO"))) {
          pctTestedParentTreesGvo = pctTestedParentTreesGvo.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "IWS"))) {
          pctTestedParentTreesIws = pctTestedParentTreesIws.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "WDU"))) {
          pctTestedParentTreesWdu = pctTestedParentTreesWdu.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "WVE"))) {
          pctTestedParentTreesWve = pctTestedParentTreesWve.add(parentPropContrib);
        }
        if (ValueUtil.hasValue(getTraitValue(parentTreeRow, "WWD"))) {
          pctTestedParentTreesWwd = pctTestedParentTreesWwd.add(parentPropContrib);
        }
      }
    }

    // --calc avg non-orchard pollen contamination pct (7815)
    double avgNonOrchardPollen = 0D;
    if (numNonOrchardPollen > 0) {
      avgNonOrchardPollen = (double) totalNonOrchardPollen / numNonOrchardPollen;
    }

    // Not being displayed!? Why not?
    BigDecimal smpSuccessPct = BigDecimal.valueOf(sumSmpSuccessWtdByfp * 100).setScale(2, halfUp);
    SparLog.debug("smpSuccessPct: {}", smpSuccessPct);

    // -- 7071 (7918)
    BigDecimal orchardContaminationPct = zero;
    if (totalNonOrchardPollen > 0) {
      orchardContaminationPct = BigDecimal.valueOf(avgNonOrchardPollen).setScale(2, halfUp);
    }

    // Not being displayed!? Why not?
    SparLog.debug("orchardContaminationPct: {}", orchardContaminationPct);

    BigDecimal vgwAd = sumParentTotalGwAdContrib.setScale(1, halfUp);
    BigDecimal vgwDfs = sumParentTotalGwDfsContrib.setScale(1, halfUp);
    BigDecimal vgwDfu = sumParentTotalGwDfuContrib.setScale(1, halfUp);
    BigDecimal vgwDfw = sumParentTotalGwDfwContrib.setScale(1, halfUp);
    BigDecimal vgwDsb = sumParentTotalGwDsbContrib.setScale(1, halfUp);
    BigDecimal vgwDsc = sumParentTotalGwDscContrib.setScale(1, halfUp);
    BigDecimal vgwDsg = sumParentTotalGwDsgContrib.setScale(1, halfUp);
    BigDecimal vgwGvo = sumParentTotalGwGvoContrib.setScale(1, halfUp);
    BigDecimal vgwIws = sumParentTotalGwIwsContrib.setScale(1, halfUp);
    BigDecimal vgwWdu = sumParentTotalGwWduContrib.setScale(1, halfUp);
    BigDecimal vgwWve = sumParentTotalGwWveContrib.setScale(1, halfUp);
    BigDecimal vgwWwd = sumParentTotalGwWwdContrib.setScale(1, halfUp);

    // Set all BVs
    List<GeneticWorthTraitsDto> calculatedGws = new ArrayList<>();
    BigDecimal minimumThreshold = new BigDecimal("0.7");

    if (pctTestedParentTreesAd.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("AD genetic worth value: {}", vgwAd);
      calculatedGws.add(new GeneticWorthTraitsDto("AD", null, vgwAd, pctTestedParentTreesAd));
    }
    if (pctTestedParentTreesDfs.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("DFS genetic worth value: {}", vgwDfs);
      calculatedGws.add(new GeneticWorthTraitsDto("DFS", null, vgwDfs, pctTestedParentTreesDfs));
    }
    if (pctTestedParentTreesDfu.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("DFU genetic worth value: {}", vgwDfu);
      calculatedGws.add(new GeneticWorthTraitsDto("DFU", null, vgwDfu, pctTestedParentTreesDfu));
    }
    if (pctTestedParentTreesDfw.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("DFW genetic worth value: {}", vgwDfw);
      calculatedGws.add(new GeneticWorthTraitsDto("DFW", null, vgwDfw, pctTestedParentTreesDfw));
    }
    if (pctTestedParentTreesDsb.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("DSB genetic worth value: {}", vgwDsb);
      calculatedGws.add(new GeneticWorthTraitsDto("DSB", null, vgwDsb, pctTestedParentTreesDsb));
    }
    if (pctTestedParentTreesDsc.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("DSC genetic worth value: {}", vgwDsc);
      calculatedGws.add(new GeneticWorthTraitsDto("DSC", null, vgwDsc, pctTestedParentTreesDsc));
    }
    if (pctTestedParentTreesDsg.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("DSG genetic worth value: {}", vgwDsg);
      calculatedGws.add(new GeneticWorthTraitsDto("DSG", null, vgwDsg, pctTestedParentTreesDsg));
    }
    if (pctTestedParentTreesGvo.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("GVO genetic worth value: {}", vgwGvo);
      calculatedGws.add(new GeneticWorthTraitsDto("GVO", null, vgwGvo, pctTestedParentTreesGvo));
    }
    if (pctTestedParentTreesIws.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("IWS genetic worth value: {}", vgwIws);
      calculatedGws.add(new GeneticWorthTraitsDto("IWS", null, vgwIws, pctTestedParentTreesIws));
    }
    if (pctTestedParentTreesWdu.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("WDU genetic worth value: {}", vgwWdu);
      calculatedGws.add(new GeneticWorthTraitsDto("WDU", null, vgwWdu, pctTestedParentTreesWdu));
    }
    if (pctTestedParentTreesWve.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("WVE genetic worth value: {}", vgwWve);
      calculatedGws.add(new GeneticWorthTraitsDto("WVE", null, vgwWve, pctTestedParentTreesWve));
    }
    if (pctTestedParentTreesWwd.compareTo(minimumThreshold) >= 0) {
      SparLog.debug("WWD genetic worth value: {}", vgwWwd);
      calculatedGws.add(new GeneticWorthTraitsDto("WWD", null, vgwWwd, pctTestedParentTreesWwd));
    }

    BigDecimal coancestry = null;
    BigDecimal neValue =
        geneticWorthService.calculateNe(
            coancestry, sumOrchGameteContr, sumNeNoSmpContrib, ptVals.smpParentsOutside());

    CalculatedParentTreeValsDto calculatedVals = new CalculatedParentTreeValsDto();
    calculatedVals.setNeValue(neValue);

    GeospatialRespondDto smpMixGeoData = calcMeanGeospatial(ptVals.smpMixIdAndProps());
    SparLog.info("SMP mix mean geospatial calculation complete.");

    calculatedVals.setGeospatialData(calcSeedlotGeoData(ptVals, smpMixGeoData));
    SparLog.info("Seedlot mean geospatial calculation complete.");

    PtCalculationResDto summaryDto =
        new PtCalculationResDto(
            calculatedGws, calculatedVals, smpMixGeoData, smpSuccessPct, orchardContaminationPct);

    return summaryDto;
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
        geneticTraits.stream().filter(x -> x.traitCode().equalsIgnoreCase(traitCode)).findFirst();
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
   * these calculation definition in SPR01A_PTContribution.htm.
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
