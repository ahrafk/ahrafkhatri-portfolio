export type Testimonial = {
  quote: string;
  role: string;
  company: string;
  monogram: string;
  /**
   * `true` marks text that has NOT been verified with a real client. Placeholder entries are never published:
   * the Testimonials section stays hidden until at least one entry has `placeholder` set to false (or omitted).
   */
  placeholder?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Ahraf helped us extract complex data from a highly protected website. His understanding of anti-bot systems and scalable architecture is impressive.",
    role: "Product Manager",
    company: "Real Estate Tech Company",
    monogram: "RT",
    placeholder: true,
  },
  {
    quote: "Professional, reliable, and technically very strong. He delivered a robust data pipeline that has been running smoothly for months.",
    role: "CTO",
    company: "Data Research Firm",
    monogram: "DR",
    placeholder: true,
  },
  {
    quote: "Great expertise in web scraping and document data extraction. Highly recommended for any complex data project.",
    role: "Founder",
    company: "SaaS Company",
    monogram: "SC",
    placeholder: true,
  },
];

/** Only verified, permissioned testimonials are shown on the site. */
export const publishedTestimonials: Testimonial[] = testimonials.filter((t) => !t.placeholder);
