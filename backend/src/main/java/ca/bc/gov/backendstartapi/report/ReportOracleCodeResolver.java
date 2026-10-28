package ca.bc.gov.backendstartapi.report;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.oracle.OrgUnitDistrictDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import java.util.HashMap;
import java.util.Map;

/**
 * Resolves oracle-api code descriptions for one SPRR001 report.
 *
 * <p>Species is fetched by code so expired vegetation still prints. Org-unit and funding endpoints
 * are list-only, so those lists load once if the report needs them. Misses print the stored code.
 * Instances are scoped to one report and are therefore not Spring beans.
 */
final class ReportOracleCodeResolver {

  private final Provider oracleApiProvider;
  private Map<Integer, String> orgUnits;
  private Map<String, String> funding;

  ReportOracleCodeResolver(Provider oracleApiProvider) {
    this.oracleApiProvider = oracleApiProvider;
  }

  String speciesDesc(String code) {
    if (code == null || code.isBlank()) {
      return null;
    }
    try {
      String description =
          oracleApiProvider
              .getVegetationCode(code)
              .map(CodeDescriptionDto::getDescription)
              .orElse(null);
      return blankToFallback(description, code);
    } catch (RuntimeException e) {
      SparLog.warn("SPRR001 species lookup failed for " + code, e);
      return code;
    }
  }

  String orgUnitDesc(Integer orgUnitNo) {
    if (orgUnitNo == null) {
      return null;
    }
    String description = orgUnits().get(orgUnitNo);
    return description == null ? orgUnitNo.toString() : description;
  }

  String fundingDesc(String code) {
    if (code == null || code.isBlank()) {
      return null;
    }
    String description = funding().get(code);
    return description == null ? code : description;
  }

  private Map<Integer, String> orgUnits() {
    if (orgUnits == null) {
      orgUnits = loadOrgUnits();
    }
    return orgUnits;
  }

  private Map<String, String> funding() {
    if (funding == null) {
      funding = loadFunding();
    }
    return funding;
  }

  private Map<Integer, String> loadOrgUnits() {
    Map<Integer, String> map = new HashMap<>();
    try {
      for (OrgUnitDistrictDto row : oracleApiProvider.getAllDistrictOrgUnits()) {
        if (row.orgUnitNo() != null && row.orgUnitName() != null) {
          map.put(row.orgUnitNo(), row.orgUnitName());
        }
      }
    } catch (RuntimeException e) {
      SparLog.warn("SPRR001 org-unit list lookup failed; printing stored codes", e);
    }
    return map;
  }

  private Map<String, String> loadFunding() {
    Map<String, String> map = new HashMap<>();
    try {
      for (CodeDescriptionDto row : oracleApiProvider.getAllValidFundingSources()) {
        if (row.getCode() != null && row.getDescription() != null) {
          map.put(row.getCode(), row.getDescription());
        }
      }
    } catch (RuntimeException e) {
      SparLog.warn("SPRR001 funding list lookup failed; printing stored codes", e);
    }
    return map;
  }

  private static String blankToFallback(String description, String code) {
    return description == null || description.isBlank() ? code : description;
  }
}
