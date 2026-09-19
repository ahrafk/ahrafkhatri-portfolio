import {
  siApacheairflow,
  siCelery,
  siDjango,
  siDocker,
  siMongodb,
  siNumpy,
  siOpencv,
  siPandas,
  siPostgresql,
  siPython,
  siRabbitmq,
  siSelenium,
  siSpacy,
  siTensorflow,
} from "simple-icons";

export type StackIcon = { path: string; hex: string };
export type StackItem = { name: string; monogram: string; icon?: StackIcon };
export type StackGroup = { id: string; label: string; blurb: string; items: StackItem[] };

const icon = (i: { path: string; hex: string }): StackIcon => ({ path: i.path, hex: i.hex });

export const stackGroups: StackGroup[] = [
  {
    id: "scraping",
    label: "Scraping & Automation",
    blurb: "Browser automation for dynamic, protected sites.",
    items: [
      { name: "Playwright", monogram: "Pw" },
      { name: "Selenium", monogram: "Se", icon: icon(siSelenium) },
    ],
  },
  {
    id: "data",
    label: "Data & Storage",
    blurb: "Processing and storing data at volume.",
    items: [
      { name: "Python", monogram: "Py", icon: icon(siPython) },
      { name: "Pandas", monogram: "Pd", icon: icon(siPandas) },
      { name: "NumPy", monogram: "Np", icon: icon(siNumpy) },
      { name: "PostgreSQL", monogram: "Pg", icon: icon(siPostgresql) },
      { name: "MongoDB", monogram: "Mg", icon: icon(siMongodb) },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    blurb: "Queues, orchestration and cloud deployment.",
    items: [
      { name: "Docker", monogram: "Dk", icon: icon(siDocker) },
      { name: "AWS", monogram: "AWS" },
      { name: "Airflow", monogram: "Af", icon: icon(siApacheairflow) },
      { name: "Celery", monogram: "Ce", icon: icon(siCelery) },
      { name: "RabbitMQ", monogram: "Rq", icon: icon(siRabbitmq) },
      { name: "Django", monogram: "Dj", icon: icon(siDjango) },
    ],
  },
  {
    id: "ai-ocr",
    label: "AI & OCR",
    blurb: "Reading documents and understanding text.",
    items: [
      { name: "Tesseract", monogram: "Ts" },
      { name: "EasyOCR", monogram: "Ez" },
      { name: "OpenCV", monogram: "Cv", icon: icon(siOpencv) },
      { name: "spaCy", monogram: "Sp", icon: icon(siSpacy) },
      { name: "TensorFlow", monogram: "Tf", icon: icon(siTensorflow) },
    ],
  },
];
