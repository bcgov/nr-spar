package ca.bc.gov.backendstartapi.dto.orchard;

public record ParentTreeGeneticQuality(
    String geneticTypeCode, String geneticWorthCode, int geneticQualityValue) {}
