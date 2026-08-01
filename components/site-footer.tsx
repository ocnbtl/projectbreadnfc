import Link from "next/link";
import { BrandMark } from "./brand-mark";

const footerGroups = [
  {
    title: "Product",
    links: [
      ["Products", "/products"],
      ["Dashboard demo", "/dashboard"],
      ["Plan a setup", "/pilot"],
      ["Customer login", "/login"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Industries", "/industries"],
      ["Locations", "/locations"],
      ["Blog", "/resources"],
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
          <p>Simple review tools for the customer moments that already happen in your business.</p>
          <span>Founder-led in Cincinnati, Ohio.</span>
        </div>
        {footerGroups.map((group) => (
          <div className="footer-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          </div>
        ))}
      </div>
      <div className="footer-base">
        <span>© {new Date().getFullYear()} Scantap. All rights reserved.</span>
        <span>Tap. Review. Grow.</span>
      </div>
    </footer>
  );
}
