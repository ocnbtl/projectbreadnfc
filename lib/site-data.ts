export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export type Product = {
  slug: string;
  name: string;
  summary: string;
  placement: string;
  bestFor: string;
  detail: string;
};

export const products: Product[] = [
  {
    slug: "counter-stand",
    name: "Counter stand",
    summary: "A visible, stable prompt for the point where a visit naturally ends.",
    placement: "Checkout counters, reception desks, host stands",
    bestFor: "A consistent review prompt customers can spot on their own",
    detail:
      "The standard Scantap version keeps setup simple. White and black formats are planned, with a QR fallback alongside NFC.",
  },
  {
    slug: "adhesive-plate",
    name: "Adhesive plate",
    summary: "A low-profile tap point for surfaces that already get customer attention.",
    placement: "Registers, doors, mirrors, service counters",
    bestFor: "Tight spaces and fixed placement",
    detail:
      "The plate stays out of the way while keeping the review link available. Final adhesive and surface testing will be completed before inventory is sold.",
  },
  {
    slug: "staff-card",
    name: "Staff card",
    summary: "A handoff-friendly card for team members who ask at the right moment.",
    placement: "Front desks, field teams, table service",
    bestFor: "Businesses where the interaction moves around",
    detail:
      "The staff card gives a real person a simple prompt to share. It is not intended for selective review requests.",
  },
];

export type Industry = {
  slug: string;
  name: string;
  short: string;
  intro: string;
  moments: string[];
  dashboard: string[];
  placements: string[];
};

export const industries: Industry[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    short: "Put the review prompt where a good meal naturally ends.",
    intro:
      "Restaurants rarely need another script. They need a prompt that fits checkout, pickup, or the final table touch without interrupting service.",
    moments: [
      "After a smooth checkout or pickup",
      "When a guest compliments the food or staff",
      "At the host stand as a visit ends",
    ],
    dashboard: [
      "Review volume and rating movement",
      "Recurring themes such as service, wait time, and food quality",
      "Which placement gets used most often",
    ],
    placements: ["Counter stand", "Host-stand plate", "Staff card"],
  },
  {
    slug: "home-services",
    name: "Home services",
    short: "Give technicians a professional way to ask after the work is done.",
    intro:
      "For contractors and field-service teams, the best review moment is often at the final walkthrough—not in a text message days later.",
    moments: [
      "After the customer approves completed work",
      "At invoice or receipt handoff",
      "After a technician answers the final questions",
    ],
    dashboard: [
      "Review activity by service area",
      "Response queue for owner follow-up",
      "Staff-card and location activity",
    ],
    placements: ["Staff card", "Vehicle-ready card", "Office counter stand"],
  },
  {
    slug: "specialty-retail",
    name: "Specialty retail",
    short: "Keep the ask quick in stores where regulars and referrals matter.",
    intro:
      "Independent retailers build trust one conversation at a time. Scantap makes the review link easy to share without adding a complicated checkout step.",
    moments: [
      "After product guidance or a successful recommendation",
      "At the register when the customer is already satisfied",
      "During community events and in-store demos",
    ],
    dashboard: [
      "Taps by store or placement",
      "Review themes and rating distribution",
      "Offline or underused devices",
    ],
    placements: ["Counter stand", "Register plate", "Staff card"],
  },
  {
    slug: "professional-services",
    name: "Professional services",
    short: "Make a thoughtful review request feel like part of the closeout.",
    intro:
      "Local practices and service firms need a calm, professional ask that respects the client relationship and keeps the next step clear.",
    moments: [
      "After a successful appointment",
      "At the completion of a project or engagement",
      "When a client offers unsolicited praise",
    ],
    dashboard: [
      "Reviews that still need a reply",
      "Service themes over time",
      "Activity across offices or teams",
    ],
    placements: ["Reception stand", "Checkout plate", "Advisor card"],
  },
];

export type Location = {
  slug: string;
  name: string;
  region: string;
  intro: string;
  localContext: string[];
  nearby: string[];
};

export const locations: Location[] = [
  {
    slug: "cincinnati",
    name: "Cincinnati",
    region: "Ohio",
    intro:
      "A practical review system for independent Cincinnati businesses that win on local trust.",
    localContext: [
      "Neighborhood businesses compete across distinct local search markets.",
      "Owners often manage the review queue themselves between daily operations.",
      "A physical prompt can reach customers who ignore a later text or email.",
    ],
    nearby: ["Oakley", "Hyde Park", "Clifton", "Blue Ash", "Mason"],
  },
  {
    slug: "mason",
    name: "Mason",
    region: "Ohio",
    intro:
      "Review tools for Mason businesses serving residents, families, and visitors in a busy suburban market.",
    localContext: [
      "High-intent local searches often compare several nearby options at once.",
      "Restaurants, home services, and specialty retailers depend on recent proof.",
      "Owner-operated teams benefit from a review process that does not add admin.",
    ],
    nearby: ["Deerfield Township", "Kings Mills", "West Chester", "Lebanon"],
  },
  {
    slug: "blue-ash",
    name: "Blue Ash",
    region: "Ohio",
    intro:
      "A straightforward way for Blue Ash businesses to turn good in-person experiences into visible local trust.",
    localContext: [
      "The area mixes professional offices, restaurants, and everyday services.",
      "Daytime customers and local residents can have different service patterns.",
      "Location-level activity helps owners see which prompt is actually being used.",
    ],
    nearby: ["Montgomery", "Sharonville", "Kenwood", "Sycamore Township"],
  },
];

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  published: string;
  sections: { heading: string; paragraphs: string[]; points?: string[] }[];
};

export const articles: Article[] = [
  {
    slug: "how-to-ask-for-a-google-review",
    title: "How to ask for a Google review without making it awkward",
    description:
      "A practical way to choose the moment, phrase the ask, and keep the request honest.",
    category: "Review requests",
    readTime: "6 min read",
    published: "July 31, 2026",
    sections: [
      {
        heading: "Start with the moment, not the script",
        paragraphs: [
          "The best review request usually follows a specific sign that the customer is happy: they thank the technician, compliment the meal, or say they will come back. That is a better cue than asking every employee to repeat the same line at every transaction.",
          "Keep the request short. Tell the customer where the tap goes and let them decide whether to continue.",
        ],
      },
      {
        heading: "Use one honest sentence",
        paragraphs: [
          "Try: “If you have a minute, you can tap here to share your experience on Google.” It explains the action without pushing for a particular rating.",
        ],
        points: [
          "Do not ask only customers you expect to leave five stars.",
          "Do not offer a reward for a positive review.",
          "Do not put a private form in front of the public review option.",
        ],
      },
      {
        heading: "Make the physical placement do some of the work",
        paragraphs: [
          "A counter stand can make the next step obvious without forcing an employee to interrupt. For mobile teams, a staff card works better because it stays with the person closing out the job.",
          "Test one placement at a time and track whether customers actually use it. More hardware is not automatically better.",
        ],
      },
    ],
  },
  {
    slug: "where-to-place-nfc-review-tags",
    title: "Five places an NFC review tag can earn its spot",
    description:
      "Placement ideas for counters, service handoffs, reception desks, and field teams.",
    category: "Hardware",
    readTime: "5 min read",
    published: "July 31, 2026",
    sections: [
      {
        heading: "Placement should follow the customer journey",
        paragraphs: [
          "Put the prompt where the customer has finished the main experience and still has a free moment. A beautiful tag in the wrong place will not get used.",
        ],
        points: [
          "Beside the payment terminal, without covering instructions",
          "At a reception or host stand near the natural exit",
          "On a service counter where completed orders are handed over",
          "On a staff card used during the final walkthrough",
          "Near a pickup shelf when staff can still answer questions",
        ],
      },
      {
        heading: "Watch for friction",
        paragraphs: [
          "Avoid crowded signage, surfaces customers cannot comfortably reach, and placements that imply tapping is required. The QR fallback should remain visible for phones or users who prefer a camera.",
          "Check the tag on both iPhone and Android devices after installation, then repeat the check whenever the destination changes.",
        ],
      },
    ],
  },
  {
    slug: "review-dashboard-metrics-that-matter",
    title: "The review dashboard metrics worth checking each week",
    description:
      "A small-business scorecard for new reviews, response work, themes, and device health.",
    category: "Dashboard",
    readTime: "7 min read",
    published: "July 31, 2026",
    sections: [
      {
        heading: "Begin with work that needs attention",
        paragraphs: [
          "A dashboard should answer three questions quickly: what changed, what needs a reply, and whether the review prompts are working. A large number with no next step is usually decoration.",
        ],
        points: [
          "New reviews and rating movement",
          "Reviews waiting for a response",
          "Response rate and median response time",
          "Repeated themes in recent feedback",
          "NFC interactions and destination opens",
          "Offline or underused devices",
        ],
      },
      {
        heading: "Do not confuse a tap with a review",
        paragraphs: [
          "An NFC interaction shows that someone used the prompt. A Google link open shows the next page loaded. Neither proves a review was submitted. Keep those events separate so the numbers stay useful.",
          "Compare trends over time, but avoid claiming a direct cause unless the underlying data supports it.",
        ],
      },
      {
        heading: "Choose a short weekly routine",
        paragraphs: [
          "Set aside fifteen minutes to reply to recent reviews, scan for repeated themes, and check device health. The dashboard should make that routine faster instead of creating another reporting project.",
        ],
      },
    ],
  },
];

export const curatedSolutions = [
  {
    location: "mason",
    industry: "restaurants",
    title: "Google review tools for restaurants in Mason, Ohio",
    description:
      "A practical NFC review setup for Mason restaurants, pickup counters, and host stands.",
    localAngle:
      "Mason restaurants serve regulars, families, and visitors who may compare several nearby options before choosing where to eat. Recent, specific reviews help the next customer understand what the experience is actually like.",
    plan: [
      "Start with one stand at the host or checkout area",
      "Use a staff card only when a guest gives clear positive feedback",
      "Track placement use separately from completed Google reviews",
      "Review wait-time and service themes once a week",
    ],
  },
  {
    location: "cincinnati",
    industry: "home-services",
    title: "Google review tools for home-service teams in Cincinnati",
    description:
      "A direct review path for Cincinnati contractors and field-service teams at the final walkthrough.",
    localAngle:
      "Cincinnati home-service businesses often work across several neighborhoods and depend on trust before a customer ever calls. A staff card keeps the review ask available at the moment the customer approves the work.",
    plan: [
      "Assign staff cards to the people who close out jobs",
      "Use one neutral review request across the team",
      "Compare activity by service area without ranking employees",
      "Reply to specific service concerns while the job is still recent",
    ],
  },
  {
    location: "blue-ash",
    industry: "professional-services",
    title: "Review management for professional services in Blue Ash, Ohio",
    description:
      "A measured review workflow for Blue Ash offices, practices, and client-service teams.",
    localAngle:
      "Blue Ash combines a strong daytime business population with nearby residents. Professional firms need a review request that feels like a respectful closeout, not a retail promotion.",
    plan: [
      "Place a counter stand at reception or checkout",
      "Keep the public Google destination clear and optional",
      "Route response work to an approved owner or manager",
      "Review location and service themes without exposing client details",
    ],
  },
];

export const navItems = [
  { href: "/products", label: "Products" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/industries", label: "Industries" },
  { href: "/locations", label: "Locations" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function getIndustry(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

export function getLocation(slug: string) {
  return locations.find((location) => location.slug === slug);
}

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
