export type CaseStudy = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  metaDescription: string;
  problem: string;
  approach: { title: string; body: string }[];
  /** Simplified pipeline stages drawn on the detail page. */
  architecture: string[];
  /** Only set when the design names the tools used. */
  stack?: string[];
  outcomes: string[];
  datePublished: string;
  dateModified: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "real-estate-scraping",
    category: "Real Estate Data Scraping",
    title: "Scraping 10+ Protected Real Estate Portals",
    summary:
      "Built anti-bot-aware scraping infrastructure with session rotation, proxy rotation, and dynamic parameter handling.",
    metaDescription:
      "Case study: anti-bot-aware scraping with session rotation, proxy rotation and dynamic parameter handling across 10+ protected real estate portals.",
    problem:
      "Real estate portals guard their listings. Session checks, rotating request parameters and bot detection cause a straightforward scraper to be blocked within a few requests, and every portal behaves differently. The goal was dependable data from more than ten protected portals, not a one-off export.",
    approach: [
      { title: "Study each portal", body: "Map how every site issues sessions, builds requests and paginates, so the scraper follows the site's real flow instead of guessing." },
      { title: "Rotate sessions and proxies", body: "Session management and proxy rotation keep request patterns natural and spread the load, which reduces blocks." },
      { title: "Handle dynamic parameters", body: "Portals generate tokens and query parameters on the fly. The scrapers read and reproduce them per request rather than hard-coding values." },
      { title: "Normalize the output", body: "Listings from every portal are mapped into one consistent schema, so downstream systems see a single clean format." },
    ],
    architecture: ["Protected portals", "Session & proxy manager", "Scraper workers", "Parser & validator", "Structured listings"],
    outcomes: [
      "One scraping layer covering 10+ protected portals",
      "Consistent, structured listing data across every source",
      "Session, proxy and parameter handling built in from the start",
    ],
    datePublished: "2026-09-19",
    dateModified: "2026-09-19",
  },
  {
    slug: "document-extraction",
    category: "OCR & Document Processing",
    title: "Multilingual Document Data Extraction",
    summary: "Extracted structured data from PDFs and scanned documents using EasyOCR, Tesseract, and spaCy.",
    metaDescription:
      "Case study: extracting structured data from multilingual PDFs and scanned documents with EasyOCR, Tesseract and spaCy.",
    problem:
      "Important information was locked inside PDFs and scanned documents, often in more than one language, where copy-and-paste and simple text extraction fail. The goal was to turn those documents into structured, usable data.",
    approach: [
      { title: "Prepare the documents", body: "Clean up scans so text recognition starts from the best possible input." },
      { title: "Recognize the text", body: "EasyOCR and Tesseract handle text recognition across languages and layouts." },
      { title: "Extract structured fields", body: "spaCy identifies and pulls out the fields that matter from the recognized text." },
      { title: "Validate before delivery", body: "Extracted values are checked and uncertain results are flagged, so errors are caught before data reaches your systems." },
    ],
    architecture: ["PDFs & scans", "Document preparation", "OCR (EasyOCR, Tesseract)", "NLP extraction (spaCy)", "Validated records"],
    stack: ["EasyOCR", "Tesseract", "spaCy"],
    outcomes: [
      "Structured data from scanned and multilingual documents",
      "Repeatable extraction in place of manual data entry",
      "Uncertain values flagged for review",
    ],
    datePublished: "2026-09-19",
    dateModified: "2026-09-19",
  },
  {
    slug: "etl-pipeline",
    category: "ETL & Data Pipeline",
    title: "High-Volume ETL Pipeline",
    summary:
      "Designed and implemented a scalable ETL pipeline processing millions of records with data cleaning, validation, and normalization.",
    metaDescription:
      "Case study: a scalable ETL pipeline that cleans, validates and normalizes millions of records, built for high-volume data processing.",
    problem:
      "Raw data arrived inconsistent, duplicated and incomplete, and volumes reached millions of records. The pipeline had to clean and standardize that data reliably at scale.",
    approach: [
      { title: "Extract from the sources", body: "Pull raw records from every source into a single, well-defined entry point." },
      { title: "Clean and deduplicate", body: "Fix formatting problems, drop duplicates and fill or flag gaps." },
      { title: "Validate against rules", body: "Every record is checked against explicit rules, and failures are separated instead of silently loaded." },
      { title: "Normalize and load", body: "Records are mapped to a consistent schema and delivered to the destination systems." },
    ],
    architecture: ["Data sources", "Extract", "Clean & validate", "Normalize", "Load to your systems"],
    outcomes: [
      "Millions of records processed through one scalable pipeline",
      "Clean, validated and consistently formatted output",
      "A pipeline that scales with data volume",
    ],
    datePublished: "2026-09-19",
    dateModified: "2026-09-19",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
