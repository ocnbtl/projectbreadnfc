import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Radio } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "About Scantap",
  description: "Scantap is a Cincinnati company building straightforward NFC review tools and reputation software for small businesses.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="We are building a simpler way for local businesses to earn more reviews."
        description="Scantap started with a common problem: customers often mean to leave a review and never get around to it. We put the link in front of them while the experience is still fresh, then make the follow-up easier for the business owner."
        primary={{ label: "Try the dashboard", href: "/dashboard" }}
        secondary={{ label: "See the products", href: "/products" }}
      >
        <div className="about-mark">
          <Radio size={38} />
          <strong>Built in Cincinnati</strong>
          <span>For the businesses we visit every day</span>
        </div>
      </PageHero>
      <section className="about-principles section-shell">
        <div><h2>What matters to us</h2><p>Scantap should be easy for the customer, useful for the owner, and honest about what the numbers mean.</p></div>
        <div className="principles-list">
          <article><span>01</span><h3>Make the next step obvious.</h3><p>The customer should know that a tap opens the business&apos;s Google review page.</p></article>
          <article><span>02</span><h3>Keep the numbers honest.</h3><p>A tap, a page open, a review, and a reply are different events. The dashboard treats them that way.</p></article>
          <article><span>03</span><h3>Save the owner time.</h3><p>The dashboard should shorten the weekly review routine, not create more reporting work.</p></article>
          <article><span>04</span><h3>Stay close to the customer.</h3><p>We are starting in Greater Cincinnati so early support and product feedback can be hands-on.</p></article>
        </div>
      </section>
      <section className="about-status section-shell">
        <div><MapPin size={24} /><h2>Where Scantap is today</h2></div>
        <ul>
          <li><Check size={17} /> Counter stand, adhesive plate, and staff card selected for the launch offer</li>
          <li><Check size={17} /> Public dashboard demo available for hands-on testing</li>
          <li><Check size={17} /> Supplier samples and final product costs still being confirmed</li>
          <li><Check size={17} /> Customer accounts and live Google integrations are the next product layer</li>
        </ul>
      </section>
      <section className="plain-cta section-shell">
        <div><h2>See what we are building.</h2><p>Try the dashboard with sample data or compare the three product formats.</p></div>
        <Link className="button button-primary" href="/dashboard">Open the dashboard <ArrowRight size={17} /></Link>
      </section>
    </>
  );
}
