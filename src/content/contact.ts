export const projectTypeValues = ["web-scraping", "document-extraction", "etl-pipeline", "infrastructure", "other"] as const;
export const budgetValues = ["under-2k", "2k-5k", "5k-15k", "15k-plus", "not-sure"] as const;

export type ProjectType = (typeof projectTypeValues)[number];
export type Budget = (typeof budgetValues)[number];

export const projectTypeLabels: Record<ProjectType, string> = {
  "web-scraping": "Web scraping",
  "document-extraction": "Document / OCR extraction",
  "etl-pipeline": "ETL & data pipeline",
  infrastructure: "Scraping infrastructure",
  other: "Something else",
};

/** Budget bands are placeholders the owner may edit freely. */
export const budgetLabels: Record<Budget, string> = {
  "under-2k": "Under $2k",
  "2k-5k": "$2k to $5k",
  "5k-15k": "$5k to $15k",
  "15k-plus": "$15k+",
  "not-sure": "Not sure yet",
};

export const contactCopy = {
  fields: {
    name: "Name",
    email: "Email",
    projectType: "Project type",
    budget: "Budget (optional)",
    message: "Tell me about your project",
  },
  placeholders: {
    name: "Your name",
    email: "you@company.com",
    message: "What data do you need, from where, and how should it be delivered?",
    projectType: "Choose one",
    budget: "Select a range",
  },
  submit: "Send message",
  submitting: "Sending…",
  sendingStatus: "Sending your message…",
  success: "Thanks, your message is on its way. I'll reply by email soon.",
  fallback: "Email isn't configured on the server yet, so I've opened your email app with your message filled in.",
  error: "Something went wrong sending your message. Please try again, or email me directly.",
  rateLimited: "Too many messages from this connection. Please try again in a few minutes.",
  validation: {
    name: "Please enter your name",
    email: "Enter a valid email address",
    projectType: "Choose a project type",
    message: "Please write at least 20 characters so I can understand your project",
  },
};
