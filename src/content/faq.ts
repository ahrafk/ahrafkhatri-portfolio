export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = [
  {
    question: "What does a web scraping consultant do?",
    answer:
      "A web scraping consultant designs and builds systems that collect data from websites reliably and at scale. That includes handling JavaScript-heavy pages, anti-bot protection, proxies and sessions, then cleaning and delivering the data in a structured form your team can use. I also monitor the scrapers so they keep working when sites change.",
  },
  {
    question: "Can you scrape websites with anti-bot protection?",
    answer:
      "Yes. I build anti-bot-aware infrastructure using session management, proxy rotation, CAPTCHA handling and realistic browser automation. Each site is different, so I start by studying how the target behaves, then design a scraper that stays reliable and respectful of the site's load. I only work on data you are entitled to collect.",
  },
  {
    question: "Can you extract data from scanned PDFs and images?",
    answer:
      "Yes. I build OCR and document extraction pipelines using tools such as EasyOCR, Tesseract, OpenCV and spaCy. They turn scanned PDFs, images and multilingual documents into clean, structured fields, with validation steps that flag uncertain results so errors are caught before the data reaches your systems.",
  },
  {
    question: "Is web scraping legal?",
    answer:
      "It depends on what you collect, where, and how. Public, non-personal data is generally treated differently from personal data or content behind a login, and site terms and local laws matter. I build ethical, compliant systems and will flag risks early, but this is not legal advice, so check your specific case with a lawyer.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "My core stack is Python with Playwright and Selenium for scraping, Pandas and NumPy for processing, and PostgreSQL or MongoDB for storage. I run pipelines with Celery, RabbitMQ and Airflow, deploy with Docker on AWS, and use Tesseract, OpenCV, spaCy and TensorFlow for OCR and language work.",
  },
  {
    question: "Can you deliver data into our existing systems?",
    answer:
      "Yes. I integrate extracted data through APIs, databases, files or scheduled exports, so it lands directly in the tools and workflows you already use. I clean, normalize and validate the data first, and add monitoring and alerting so you know quickly if a feed breaks or a source changes.",
  },
  {
    question: "What kinds of clients do you work with?",
    answer:
      "I work with startups, established businesses, research teams and enterprises that need reliable web data at scale. My case studies cover real estate data, document processing and large ETL pipelines. I'm based in Mumbai, India, and work with clients globally, so time zones are rarely a problem.",
  },
  {
    question: "How do we start a project?",
    answer:
      "Send a short description of the data you need, the sites or documents involved, and how you want it delivered, using the contact form. I'll review it, ask any follow-up questions, and suggest an approach. From there we agree on scope and a plan before any build work begins.",
  },
];
