package ca.bc.gov.backendstartapi.service.parser;

import ca.bc.gov.backendstartapi.enums.parser.SmpMixHeader;
import ca.bc.gov.backendstartapi.vo.parser.SmpMixVolume;
import org.springframework.stereotype.Service;

/** Parser for SMP mix tables. */
@Service
public class SmpCalculationCsvTableParser extends CsvTableParser<SmpMixHeader, SmpMixVolume> {

  /** Build an instance with the appropriate header and row parsers. */
  public SmpCalculationCsvTableParser() {
    super(
        new CsvTableHeaderParser<>(SmpMixHeader.class),
        new CsvTableRowParser<>(SmpMixVolume::fromMap));
  }
}
