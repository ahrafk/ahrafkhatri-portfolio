export type Service = {
  id: string;
  icon: "globe" | "shield" | "scan" | "database" | "cloud" | "braces";
  title: string;
  description: string;
};

export const services: Service[] = [
  { id: "web-scraping", icon: "globe", title: "Complex Web Scraping", description: "Extract data from JavaScript-heavy, protected, and dynamic websites." },
  { id: "anti-bot", icon: "shield", title: "Anti-Bot Infrastructure", description: "Session management, proxy rotation, CAPTCHA handling, and more." },
  { id: "ocr", icon: "scan", title: "OCR & Document Extraction", description: "Extract data from PDFs, scanned documents, and images using AI/OCR." },
  { id: "etl", icon: "database", title: "ETL & Data Pipelines", description: "Clean, normalize, and deliver structured data to your systems." },
  { id: "infrastructure", icon: "cloud", title: "Scalable Infrastructure", description: "Cloud-based scraping systems with monitoring, logging, and alerting." },
  { id: "integration", icon: "braces", title: "API & Data Integration", description: "Integrate extracted data with your existing tools and workflows." },
];
