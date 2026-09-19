/** Crawlers that fetch pages to answer a user's query or power AI search. Always allowed. */
export const AI_RETRIEVAL_CRAWLERS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
] as const;

/** Crawlers that collect content for model training. Controlled by `site.allowAiTrainingCrawlers`. */
export const AI_TRAINING_CRAWLERS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"] as const;
