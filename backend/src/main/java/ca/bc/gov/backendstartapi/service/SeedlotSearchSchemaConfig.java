package ca.bc.gov.backendstartapi.service;

import static ca.bc.gov.backendstartapi.search.SearchOperator.BETWEEN;
import static ca.bc.gov.backendstartapi.search.SearchOperator.EQ;
import static ca.bc.gov.backendstartapi.search.SearchOperator.GTE;
import static ca.bc.gov.backendstartapi.search.SearchOperator.IN;
import static ca.bc.gov.backendstartapi.search.SearchOperator.IS_NOT_NULL;
import static ca.bc.gov.backendstartapi.search.SearchOperator.IS_NULL;
import static ca.bc.gov.backendstartapi.search.SearchOperator.LTE;
import static ca.bc.gov.backendstartapi.search.SearchOperator.NE;
import static ca.bc.gov.backendstartapi.search.SearchOperator.STARTS_WITH;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.search.SearchSchema;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;

/**
 * Search surface (field whitelist, child tables, sorting) for {@link SeedlotSearchService}.
 * Row-level access stays in the service.
 */
@Configuration
public class SeedlotSearchSchemaConfig {

  /**
   * The complete public search surface for seedlots. Anything not declared here (emails,
   * comments, ...) cannot be filtered or sorted on.
   */
  @Bean
  public SearchSchema<Seedlot> seedlotSearchSchema(ObjectMapper objectMapper) {
    return SearchSchema.forEntity(Seedlot.class)
        .sortableField("seedlotNumber", "id", String.class, EQ, IN, STARTS_WITH)
        .sortableField("status", "seedlotStatus.seedlotStatusCode", String.class, EQ, NE, IN)
        .sortableField(
            "geneticClass", "geneticClass.geneticClassCode", String.class, EQ, IN, IS_NULL)
        .sortableField("species", "vegetationCode", String.class, EQ, IN)
        .sortableField("applicantClientNumber", "applicantClientNumber", String.class, EQ, IN)
        .field("intendedForCrownLand", "intendedForCrownLand", Boolean.class, EQ)
        .sortableField(
            "collectionStartDate",
            "collectionStartDate",
            LocalDate.class,
            EQ, GTE, LTE, BETWEEN, IS_NULL, IS_NOT_NULL)
        .sortableField(
            "createdAt", "auditInformation.entryTimestamp", LocalDateTime.class, GTE, LTE, BETWEEN)
        .sortableField(
            "updatedAt", "auditInformation.updateTimestamp", LocalDateTime.class, GTE, LTE, BETWEEN)
        .child(
            "orchards",
            SeedlotOrchard.class,
            c ->
                c.link("id", "seedlot.id")
                    .field("orchardId", "orchardId", String.class, EQ, IN)
                    .field("isPrimary", "isPrimary", Boolean.class, EQ))
        .child(
            "owners",
            SeedlotOwnerQuantity.class,
            c ->
                c.link("id", "seedlot.id")
                    .field("clientNumber", "ownerClientNumber", String.class, EQ, IN)
                    .field("locationCode", "ownerLocationCode", String.class, EQ)
                    .field("fundingSource", "fundingSourceCode", String.class, EQ, IN))
        .defaultSort(Sort.by(Sort.Direction.DESC, "auditInformation.updateTimestamp"))
        .tiebreaker("id")
        .build(objectMapper);
  }
}
