subject: seedlot.orchard_contamination_pct
-----------------------------------------spr_seedlot----------------------------------------


-- go back to:
--values to calc avg non-orchard pollen contamination pct (only contribute to avg if specified)
-- (7377)

--Third pass to calc values that depend on totals derived above and the remainder
-- (7233)
FOR i IN 1..p_pt.COUNT LOOP
  --ignore rows without cone or pollen count
  IF p_pt(i).non_orchard_pollen_contam_pct IS NOT NULL THEN
    v_total_non_orchard_pollen := v_total_non_orchard_pollen + v_a_non_orchard_pollen_contam;
    v_num_non_orchard_pollen := v_num_non_orchard_pollen + 1;
  END IF;

--calc avg non-orchard pollen contamination pct
-- (7815)
IF v_num_non_orchard_pollen > 0 THEN
  v_avg_non_orchard_pollen := v_total_non_orchard_pollen / v_num_non_orchard_pollen;
END IF;

-- Ron's starts here:
-- 7071 (7918)
IF v_total_non_orchard_pollen = 0 THEN
  v_orchard_contamination_pct := 0;
ELSE
  v_orchard_contamination_pct := ROUND(v_avg_non_orchard_pollen);
END IF;

----------------------------------------------------------------------------------------------
-- v_total_non_orchard_pollen - in recalc - looping through parent trees filled in
------------------------------------------------------------------------------------------------
-- values to calc avg non-orchard pollen contamination pct (only contribute to avg if specified)
-- 6532 (7377)
IF p_pt(i).non_orchard_pollen_contam_pct IS NOT NULL THEN   
  v_total_non_orchard_pollen := v_total_non_orchard_pollen + v_a_non_orchard_pollen_contam;
  v_num_non_orchard_pollen := v_num_non_orchard_pollen + 1;
END IF;

-------------------------------------------------------------------------------------------------
-- non_orchard_pollen_contam_pct is from spt  - entered on parent tree origin radio button
-------------------------------------------------------------------------------------------------
-- 6456
v_a_non_orchard_pollen_contam := NVL(p_pt(i).non_orchard_pollen_contam_pct,0);

-------------------------------------------------------------------------------------------------
-- final analysis
seedlot.orchard_contamination_pct
  loop through parent trees from screen
    IF non_orchard_pollen_contam_pct is not null
      v_total_non_orchard_pollen := v_total_non_orchard_pollen + v_a_non_orchard_pollen_contam;
      v_num_non_orchard_pollen := v_num_non_orchard_pollen + 1;
      v_avg_non_orchard_pollen := v_total_non_orchard_pollen / v_num_non_orchard_pollen;
-------------------------------------------------------------------------------------------------
-- dependencies
------------------------------------------------------------------------------------------------
-- 6291
v_m_gw_GVO_contrib_orch_poll :=  varParentPropOrchPoll * COALESCE(p_pt(i).bv_GVO,p_pt(i).cv_GVO,0);

--6306
v_sum_m_gw_GVO_contb_orch_poll := v_sum_m_gw_GVO_contb_orch_poll + v_m_gw_GVO_contrib_orch_poll;

--6577
--col:V
IF varTotalConeCount = 0 THEN
  varFemaleCropPop := 0;
ELSE
  varFemaleCropPop := varAnotherConeCount / varTotalConeCount;
END IF;

-- 6601
// --col:Y
v_f_gw_GVO_contrib := varFemaleCropPop * NVL(p_pt(i).bv_GVO,p_pt(i).cv_GVO);

-- 6628
--col:Z
v_m_smp_GVO_contrib := ( (v_a_smp_success_pct * v_a_smp_mix_bv_GVO) / 100 ) * varFemaleCropPop;

-- 6649
--col:AA
v_m_contam_contrib := ( (1 - (v_a_smp_success_pct/100)) * (v_a_non_orchard_pollen_contam/100) * v_contaminant_pollen_bv ) * varFemaleCropPop;

-- 6651
--col:AB (depends on SUM(X)=v_sum_m_gw_contrib_orch_poll)
v_m_orch_poll_contrib_GVO := ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_GVO_contb_orch_poll ) * varFemaleCropPop;

--col:AC
-- depends on prev value
v_m_total_gw_GVO_contrib := v_m_smp_GVO_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_GVO;

--col:AD
IF v_total_pollen_count = 0 THEN
  v_p_total_gw_GVO_contrib := v_f_gw_GVO_contrib;
ELSE
  v_p_total_gw_GVO_contrib := (v_f_gw_GVO_contrib + v_m_total_gw_GVO_contrib) / 2;
END IF;

-- 6736
--Set total gw contrib back into array so it can be displayed/saved
p_pt(i).total_genetic_worth_contrib := v_p_total_gw_GVO_contrib;

-- 6759
v_sum_p_total_gw_GVO_contrib := v_sum_p_total_gw_GVO_contrib + v_p_total_gw_GVO_contrib;

-- 6892
END LOOP

-- 7002
v_gw_GVO := ROUND(v_sum_p_total_gw_GVO_contrib);

-- 7135
IF b_bv_GVO_not_estimated AND r_pt_contrib.pct_tested_parent_trees_GVO >= 70 THEN
  r_pt_contrib.gw_GVO := v_gw_GVO;
END IF;

-- ?? what if it's estimated or <70? apparently does not get set
