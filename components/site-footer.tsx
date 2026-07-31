import Link from "next/link";
import { BrandMark } from "./brand-mark";

const footerGroups = [
  {
    title: "Explore",
    links: [
      ["Products", "/products"],
      ["Dashboard", "/dashboard"],
      ["Pilot planner", "/pilot"],
    ],
  },
  {
    title: "Solutions",
    links: [
      ["Industries", "/industries"],
      ["Locations", "/locations"],
      ["Resources", "/resources"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <BrandMark />
          <p>
            NFC review tools and a focused reputation dashboard for small
            businesses in Greater Cincinnati.
          </p>
          <span>Founder-led in Cincinnati, Ohio.</span>
        </div>
        {footerGroups.map((group) => (
          <div className="footer-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-base">
        <span>© {new Date().getFullYear()} Scantap. All rights reserved.</span>
        <span>Clear prompts. Honest reviews. Useful follow-through.</span>
      </div>
    </footer>
  );
}
