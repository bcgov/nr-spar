# Thymeleaf + OpenHTMLtoPDF for SPAR Reporting

_As of 2026-11-10_

## Summary

**Recommendation:** replace JasperReports with Thymeleaf templates rendered to PDF by OpenHTMLtoPDF.

A working proof of concept exists for SPRR001. See [Proof of concept](#proof-of-concept).

## How it works

Thymeleaf fills in an HTML template. OpenHTMLtoPDF turns that HTML into a PDF. It supports CSS 2.1 plus most of CSS paged media: `@page`, running headers and footers, and page counters.

```text
┌──────────────────┐     ┌───────────┐     ┌───────┐     ┌───────────────┐     ┌─────┐
│ Java view model  │ ──> │ Thymeleaf │ ──> │ XHTML │ ──> │ OpenHTMLtoPDF │ ──> │ PDF │
│ formatting,      │     │ template  │     │       │     │               │     │     │
│ totals           │     │           │     │       │     │               │     │     │
└──────────────────┘     └───────────┘     └───────┘     └───────────────┘     └─────┘
```

1. Java builds a view model. All logic happens here: formatting, conditionals and totals.
2. Thymeleaf renders the template to well-formed XHTML.
3. OpenHTMLtoPDF lays out the pages and writes the PDF, using fonts bundled on the classpath.

## Pros

- **Native-image friendly.** Nothing is compiled or class-loaded at runtime.
- **Embedded.** It runs inside the app, with no report server and no network hop.
- **Familiar skills.** Templates are HTML and CSS, which every developer already knows.
- **Readable in code review.** A template change is a readable diff, unlike a change to JRXML coordinates.
- **Content grows naturally.** Wrapping text and variable-length lists push the layout down without stretch or float settings.
- **Logic lives in Java.** Totals and formatting are calculated before rendering, so they can be unit tested.
- **Accessible and archival output.** OpenHTMLtoPDF can produce tagged PDF (PDF/UA) and archival PDF (PDF/A).
- **Open licences.** OpenHTMLtoPDF is LGPL. Thymeleaf and PDFBox are Apache 2.0.

## Pitfalls and limitations

The two real gaps are Excel output and per-page values. SPAR's legacy reports have no per-page values, but they do have Excel output (see [Excel output](#excel-output)).

| Pitfall | What Jasper does | What we'd do instead | Severity |
| --- | --- | --- | --- |
| **Excel output** | One template exports PDF and Excel | **Thymeleaf cannot produce spreadsheets.** Excel needs its own code path. | **High: SPAR has Excel reports** |
| Per-page totals | Knows which rows landed on each page, so it can total them | Not possible: the HTML is built before the renderer paginates | High if required |
| Visual designer | Analysts edit layouts in Jaspersoft Studio | Developers edit HTML and CSS | Medium |
| Pixel-identical output | n/a | Output is equivalent, not identical | Medium |
| CSS 2.1 only | n/a | No flexbox or grid. Layout uses tables, floats or absolute positioning. | Medium |
| Group headers repeating on new pages | Built in | Only a table's `<thead>` repeats automatically | Low to medium |
| Charts | JFreeChart from report data | Render SVG in Java and embed it. No JavaScript. | Low to medium |
| Crosstabs (pivot tables) | Built in | Pivot in Java and render a plain table | Low |
| Variables and running totals | Declared in JRXML | Calculate in Java before rendering | Low |
| Keep-together and page breaks | `splitType="Prevent"` | `page-break-inside: avoid`. Mostly reliable, less so inside tables. | Low |

## Excel output

**Thymeleaf only produces HTML, and through OpenHTMLtoPDF, PDF. It has no Excel output.** Jasper renders one template to either PDF or Excel, and SPAR relies on that today.

**These spreadsheets can be replicated with [FastExcel](https://github.com/dhatim/fastexcel).** They are flat tables (header row and data rows), not designed layouts. FastExcel is small, plain Java and native-friendly. It produces better files than Jasper's: real number and date cells, column widths, frozen headers, filters and named sheets, as `.xlsx`. Apache POI also works but is heavier and harder to run in native image.

**Even simpler: CSV, if business is OK with it.** Many of these are data extracts that people open and filter. CSV needs no library and opens directly in Excel. It can't do multiple sheets or formatting, so FastExcel is still needed where those matter.

## Proof of concept

`GET /api/seedlots/{seedlotNumber}/reports/registration` renders SPRR001 with Thymeleaf + OpenHTMLtoPDF. On this branch Jasper has been removed entirely. The output closely matches the old Jasper version: the same 2 pages, sections, borders, shading and headers.

**Native image:** the backend's Dockerfile now builds a native image successfully with Thymeleaf and OpenHTMLtoPDF in place. The compile took about 8 minutes and peaked at about 9.5GB of memory. Rendering a report from the native binary has not been tested yet.

| File | Role |
| --- | --- |
| `backend/src/main/resources/reports/html/sprr001.html` | Main template |
| `backend/src/main/resources/reports/html/sprr001-ownership.html` | Ownership section (replaces Jasper subreport SR2) |
| `report/html/Sprr001HtmlModel.java` | Formatting and calculations from the JRXML, as Java |
| `report/html/HtmlPdfRenderer.java` | Renders a template to PDF with bundled fonts |
| `report/html/HtmlReportRuntimeHints.java` | Native-image hints (native build passes; runtime rendering not yet tested) |
| `report/html/Sprr001HtmlReportService.java` | Lookup, access check, model, render |

## Alternatives considered

The pipeline has two swappable parts: the **template engine** that produces HTML, and the **renderer** that turns it into a PDF.

### Template engines (instead of Thymeleaf)

- **[JTE](https://jte.gg/):** compiles templates to Java at build time. Templates are type-checked, so a renamed model field breaks the build rather than printing blank. It also needs no reflection, so no native-image hints. It's the strongest alternative, and switching later would only mean rewriting template syntax; the CSS and the Java view models carry over. We started with Thymeleaf because it is better known, it's what the team already uses for emails, and its XML mode enforces the well-formed XHTML that OpenHTMLtoPDF needs.

### PDF renderers (instead of OpenHTMLtoPDF)

- **[WeasyPrint](https://weasyprint.org/):** a Python HTML-to-PDF renderer. It supports more CSS than OpenHTMLtoPDF, including flexbox, footnotes and better page breaks in tables, and BC Gov publishes an OpenShift-ready image (`bcgovimages/weasyprint`). However, it runs as a separate service rather than inside the app, and it's slower on long reports. It's our fallback if a report outgrows OpenHTMLtoPDF, and the HTML templates would mostly carry over.
- **Apache FOP (XSL-FO):** an embedded renderer with strong pagination features, proven in native images. However, XSL-FO is verbose, few developers know it, it has no browser preview, and the language has been frozen since 2013.
### Other

- **CDOGS (Common Document Generation Service):** the team advised against it. The service has no guaranteed uptime, and it struggles with very large reports.
- **Native Jasper in Spring Boot:** not officially supported. The only proven native path is the Quarkus JasperReports extension.
