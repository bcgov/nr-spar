package ca.bc.gov.backendstartapi.report;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

/**
 * Guards the contract between Jasper bean properties and the jrxml {@code <field name>} list. A
 * field the template declares but the bean lacks (or vice versa) would print blank or fail fill.
 */
class Sprr001FieldContractTest {

  private static final Pattern FIELD_NAME = Pattern.compile("<field name=\"([^\"]+)\"");

  @Test
  @DisplayName("Sprr001MainRow properties match the main template fields")
  void mainFields_shouldMatchTemplate() throws Exception {
    assertEquals(
        declaredFields(SparReportConstants.SPRR001_MAIN_JRXML),
        beanProperties(Sprr001MainRow.class));
  }

  @Test
  @DisplayName("Sprr001OwnershipRow properties match the ownership subreport fields")
  void ownershipFields_shouldMatchTemplate() throws Exception {
    assertEquals(
        declaredFields("SPRR001-SEEDLOT_REG_DTL_SR2_OWNERSHIP.jrxml"),
        beanProperties(Sprr001OwnershipRow.class));
  }

  private static Set<String> declaredFields(String jrxmlFile) throws IOException {
    ClassPathResource resource =
        new ClassPathResource(SparReportConstants.REPORT_CLASSPATH_DIR + jrxmlFile);
    String jrxml;
    try (InputStream inputStream = resource.getInputStream()) {
      jrxml = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    }

    Set<String> fields = new LinkedHashSet<>();
    Matcher matcher = FIELD_NAME.matcher(jrxml);
    while (matcher.find()) {
      fields.add(matcher.group(1));
    }
    return fields;
  }

  private static Set<String> beanProperties(Class<?> beanType) throws Exception {
    return Arrays.stream(Introspector.getBeanInfo(beanType, Object.class).getPropertyDescriptors())
        .map(PropertyDescriptor::getName)
        .collect(Collectors.toCollection(LinkedHashSet::new));
  }
}
