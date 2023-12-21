package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixGeneticQualityId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SmpMixGeneticQuality SMPMixGeneticQualities}. */
public interface SmpMixGeneticQualityRepository
    extends JpaRepository<SmpMixGeneticQuality, SmpMixGeneticQualityId> {

  List<SmpMixGeneticQuality> findAllBySmpMix_Seedlot_id(String seedlotNumber);
}
