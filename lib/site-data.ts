export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://projectbreadnfc.vercel.app";

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
    summary: "A clear review prompt customers can see at checkout or on the way out.",
    placement: "Checkout counters, reception desks, and host stands",
    bestFor: "You want one visible review point that stays put",
    detail: "The angled stand keeps the tap point and QR code easy to reach without taking over the counter. Choose a black or white Scantap design for the fastest setup.",
  },
  {
    slug: "adhesive-plate",
    name: "Adhesive plate",
    summary: "A slim, fixed review point for counters, doors, mirrors, and other tight spaces.",
    placement: "Registers, doors, mirrors, and service counters",
    bestFor: "You need the review prompt to stay flat and out of the way",
    detail: "The plate adds a tap point without adding another object to the counter. We will confirm the surface and placement before installation so the adhesive has the best chance to hold.",
  },
  {
    slug: "staff-card",
    name: "Staff card",
    summary: "A pocket-sized review link for teams that finish the job away from a counter.",
    placement: "Field teams, table service, front desks, and final walkthroughs",
    bestFor: "The customer handoff moves with your team",
    detail: "The staff card makes the same neutral Google review request available wherever the interaction ends. It works especially well for technicians, servers, and mobile service teams.",
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
    short: "Make the review ask easy at checkout, pickup, or the host stand.",
    intro: "A restaurant team does not need another long script. Scantap gives every guest the same quick, optional path to your Google review page when the visit ends.",
    moments: ["At checkout after the bill is settled", "When a pickup order is handed over", "At the host stand as guests leave"],
    dashboard: ["New reviews and rating changes", "Themes such as service, wait time, and food quality", "Which placement customers use most"],
    placements: ["Counter stand", "Host-stand adhesive plate", "Staff card"],
  },
  {
    slug: "home-services",
    name: "Home services",
    short: "Give technicians one professional way to share the review link after the work is done.",
    intro: "For contractors and field-service teams, the review moment usually happens at the final walkthrough. A staff card keeps the link ready without relying on a follow-up message days later.",
    moments: ["After the customer reviews the completed work", "When the invoice or receipt is handed over", "After the technician answers the final questions"],
    dashboard: ["Review activity by service area", "Reviews waiting for an owner reply", "Staff-card activity by team or location"],
    placements: ["Staff card", "Vehicle or equipment case", "Office counter stand"],
  },
  {
    slug: "specialty-retail",
    name: "Specialty retail",
    short: "Put the review link at the register without adding another checkout step.",
    intro: "Independent stores win on helpful conversations and regular customers. Scantap keeps the Google review link visible without interrupting the checkout experience.",
    moments: ["At the register after payment", "When an order or special item is picked up", "During staffed events and product demonstrations"],
    dashboard: ["Taps by store and placement", "Review themes and rating mix", "Devices that are offline or rarely used"],
    placements: ["Counter stand", "Register plate", "Staff card"],
  },
  {
    slug: "professional-services",
    name: "Professional services",
    short: "Keep the review request calm, clear, and appropriate for the client relationship.",
    intro: "Practices and service firms need a review request that feels like a natural closeout. Scantap makes the option visible at reception or during the final handoff.",
    moments: ["After a completed appointment", "At the end of a project or engagement", "When final documents or results are delivered"],
    dashboard: ["Reviews that still need a reply", "Service themes over time", "Activity across offices or teams"],
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
    intro: "Simple review tools and local setup support for independent Cincinnati businesses.",
    localContext: ["Customers often compare businesses across several nearby neighborhoods.", "Many owners still manage the review queue themselves.", "A physical prompt can reach customers before a later message gets ignored."],
    nearby: ["Oakley", "Hyde Park", "Clifton", "Blue Ash", "Mason"],
  },
  {
    slug: "mason",
    name: "Mason",
    region: "Ohio",
    intro: "A quick Google review path for Mason businesses serving residents, families, and visitors.",
    localContext: ["Customers can compare several nearby options from one search.", "Restaurants, home services, and retailers benefit from recent reviews.", "Small teams need a review routine that does not add more admin."],
    nearby: ["Deerfield Township", "Kings Mills", "West Chester", "Lebanon"],
  },
  {
    slug: "blue-ash",
    name: "Blue Ash",
    region: "Ohio",
    intro: "Review tools for Blue Ash offices, restaurants, shops, and everyday service businesses.",
    localContext: ["The area serves both a large daytime workforce and nearby residents.", "Professional offices and local services often need a quieter review ask.", "Location-level activity helps owners see which prompt customers notice."],
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
    description: "A short, comfortable way to introduce the review link to every customer.",
    category: "Review requests",
    readTime: "6 min read",
    published: "July 31, 2026",
    sections: [
      {
        heading: "Keep the request short",
        paragraphs: ["Customers do not need a sales pitch. Tell them where the tap goes, make the choice optional, and let the product handle the rest.", "Use the same neutral request for every customer. That keeps the process fair and makes the habit easier for staff to remember."],
      },
      {
        heading: "Use one sentence your team can say naturally",
        paragraphs: ["Try: “If you have a minute, you can tap here to share your experience on Google.” It explains the action without asking for a particular rating."],
        points: ["Offer the same review path to every customer.", "Do not offer a reward for a positive review.", "Do not hide the public review link behind a private rating form."],
      },
      {
        heading: "Let the placement do some of the work",
        paragraphs: ["A counter stand keeps the option visible without making an employee interrupt. For mobile teams, a staff card works because it stays with the person closing out the job.", "Start with one placement. If customers do not use it, move it before buying more hardware."],
      },
    ],
  },
  {
    slug: "where-to-place-nfc-review-tags",
    title: "Five places an NFC review tag can earn its spot",
    description: "Practical placement ideas for counters, reception desks, pickups, and field teams.",
    category: "Hardware",
    readTime: "5 min read",
    published: "July 31, 2026",
    sections: [
      {
        heading: "Put it where the experience ends",
        paragraphs: ["The best placement is usually where the customer has finished the main interaction and has a free hand. A great-looking product in the wrong place will still be ignored."],
        points: ["Beside the payment terminal without covering instructions", "At reception or the host stand near the exit", "Where completed orders are handed over", "On a staff card used during the final walkthrough", "Near a pickup shelf where staff can still answer questions"],
      },
      {
        heading: "Remove the small points of friction",
        paragraphs: ["Avoid crowded signage, hard-to-reach surfaces, and placements that make tapping look required. Keep the QR code visible for customers who prefer their camera.", "Test NFC and QR on both iPhone and Android before the product goes in front of customers."],
      },
    ],
  },
  {
    slug: "review-dashboard-metrics-that-matter",
    title: "The review dashboard numbers worth checking each week",
    description: "A simple weekly scorecard for reviews, replies, themes, and device health.",
    category: "Dashboard",
    readTime: "7 min read",
    published: "July 31, 2026",
    sections: [
      {
        heading: "Start with work that needs attention",
        paragraphs: ["A useful dashboard answers three questions quickly: what changed, what needs a reply, and whether the review prompts are working. A big number with no next step is just decoration."],
        points: ["New reviews and rating movement", "Reviews waiting for a response", "Response rate and response time", "Repeated themes in recent feedback", "NFC interactions and Google page opens", "Offline or underused devices"],
      },
      {
        heading: "Do not call every tap a review",
        paragraphs: ["An NFC interaction means someone used the product. A Google page open means the link loaded. Neither proves a review was submitted, so the dashboard should keep those events separate.", "Look for trends, but do not claim the hardware caused a review unless the data can actually support it."],
      },
      {
        heading: "Build a fifteen-minute routine",
        paragraphs: ["Reply to recent reviews, scan for repeated themes, and check device health once a week. If the dashboard turns that into another reporting project, it is doing too much."],
      },
    ],
  },
];

export const curatedSolutions = [
  {
    location: "mason",
    industry: "restaurants",
    title: "Google review tools for restaurants in Mason, Ohio",
    description: "A simple Scantap setup for Mason restaurants, pickup counters, and host stands.",
    localAngle: "Mason restaurants serve regulars, families, and visitors who may compare several nearby options. Recent, specific reviews help the next guest understand the experience before they choose where to eat.",
    plan: ["Start with one stand at the host or checkout area", "Use the same neutral review request for every guest", "Keep device activity separate from completed Google reviews", "Check service and wait-time themes once a week"],
  },
  {
    location: "cincinnati",
    industry: "home-services",
    title: "Google review tools for home-service teams in Cincinnati",
    description: "A direct review path for contractors and field-service teams at the final walkthrough.",
    localAngle: "Cincinnati home-service businesses work across many neighborhoods and depend on trust before the customer ever calls. A staff card keeps the review link ready when the work is approved.",
    plan: ["Give staff cards to the people who close out jobs", "Use one clear review request across the team", "Compare activity by service area without ranking employees", "Reply while the job details are still fresh"],
  },
  {
    location: "blue-ash",
    industry: "professional-services",
    title: "Review management for professional services in Blue Ash, Ohio",
    description: "A calm review workflow for Blue Ash offices, practices, and client-service teams.",
    localAngle: "Blue Ash combines a large daytime business population with nearby residents. Professional firms need a review request that feels like a respectful closeout, not a retail promotion.",
    plan: ["Place a counter stand at reception or checkout", "Keep the Google destination clear and optional", "Assign response work to one owner or manager", "Review service themes without exposing client details"],
  },
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
