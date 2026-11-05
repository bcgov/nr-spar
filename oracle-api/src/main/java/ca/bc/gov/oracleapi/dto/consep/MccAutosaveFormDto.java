package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * One moisture content auto save: the activity record and the replicates, written together
 * under the activity's optimistic lock.
 */
@Schema(description = "Activity record and replicates saved together by moisture auto save")
public record MccAutosaveFormDto(
    @NotNull @Valid ActivityFormDto activity,
    @NotNull List<@Valid MccReplicateFormDto> replicates
) {}
