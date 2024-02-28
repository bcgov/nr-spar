package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLatLongDto;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.provider.Provider;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/** This class holds methods for handling Parent Trees records. */
@Service
@RequiredArgsConstructor
public class ParentTreeService {

  @Qualifier("oracleApi")
  private final Provider oracleProvider;

  public List<ParentTreeLatLongDto> getLatLongElevation(List<LatLongRequestDto> ptreeIds) {
    SparLog.info(
        "{} parent tree record(s) received to calculate lat long and elevation", ptreeIds.size());

    List<Integer> ptIds = ptreeIds.stream().map(LatLongRequestDto::parentTreeId).toList();

    // call oracle
    List<ParentTreeLatLongDto> oracleDtoList = oracleProvider.getParentTreeLatLongByIdList(ptIds);

    if (oracleDtoList.isEmpty()) {
      SparLog.info("No parent tree lat long data from Oracle for the given parent tree ids.");
      return List.of();
    }

    /*
    First loop through list to get total amount of material and # of pt outside of seedlot.
    var smpMixList = find All smp_mix records for that seedlot number;
    for (SmpMix smpMix : smpMixList) {
      if (smpMix.amount_of_material is not null) {
        v_total_amount_of_material += smpMix.amount_of_material;
      }
      // checks if the parent tree is inside the orchard
      select seedlot_number from seedlot_parent_tree where seedlot_number = main_seedlot_number and parent_tree_id = smpMix.parent_tree_id;
      if (seedlot_number is not null) {
        v_num_parents_from_outside += 1;
      }
    }
    */

    BigDecimal amountOfMaterialSum = BigDecimal.ZERO;
    int amountOutside = 0;
    for (LatLongRequestDto dto : ptreeIds) {
      amountOfMaterialSum = amountOfMaterialSum.add(dto.amountOfMaterial());

      if (!dto.insideOrchard()) {
        amountOutside++;
      }
    }

    /*
    Second loop through list to calculate proportion and weight values.
    for (SmpMix smpMix : smpMixList) {
      // calculate the proportion
      // PS: we don't need that. We're doing this calculation in the FE
      //
      if (smpMix.amount_of_material is not null) {
        smpMix.proportion = smpMix.amount_of_material / v_total_amount_of_material;
      }
      // weighted for each trait
      fetch the smp_mix_gen_qlty record
      var weighted_bv_AD = smpMix.proportion * smp_mix_gen_qlty_ad.genetic_quality_value;
      // repeat for DFS, DFU, DFW, etc..
      // mean elevation
      var weighted_elevation = smpMix.proportion * smpMix.elevation;
      var v_coll_lat = (p_pt(i).latitude_degrees*60) + p_pt(i).latitude_minutes + (p_pt(i).latitude_seconds/60);
      var v_coll_long = (p_pt(i).longitude_degrees*60) + p_pt(i).longitude_minutes + (p_pt(i).longitude_seconds/60);
      p_pt(i).weighted_latitude = p_pt(i).proportion * NVL(v_coll_lat, 0);
      p_pt(i).weighted_longitude = p_pt(i).proportion * NVL(v_coll_long, 0);
      // sums all weighted values, for each trait
      v_sum_wtd_bv_AD += weighted_bv_AD;
      // set smp mix calculated values. For each traita
      p_smp_mix_bv_AD = v_sum_wtd_bv_AD;
      //
      // !! the packages doesn't save the calculated. But I think we need to do it.
      // saves the calculation!
      //
    }
    */

    for (LatLongRequestDto dto : ptreeIds) {
      // frontend already do this:
      BigDecimal proportion = dto.amountOfMaterial().divide(amountOfMaterialSum, 10, RoundingMode.HALF_UP);

      
      List<SmpMixGeneticQuality> smixGenQltyList = smpMixGeneticQualityService.findAllBySmpMix(sm.getId());
      for (SmpMixGeneticQuality smixGenQlty : smixGenQltyList) {
        // weighted for each trait
        BigDecimal weighted = proportion.multiply(smixGenQlty.getGeneticQualityValue());

        // mean elevation - FIXME -> smpMix.elevation
        BigDecimal weightedElevation = proportion.multiply(BigDecimal.ONE);
      }
    }
  }
}
