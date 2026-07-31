import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Radio } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "About Scantap",
  description:
    "Scantap is a founder-led Cincinnati company building straightforward NFC review tools and reputation software for small businesses.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Review tools should earn their place in the business."
        description="Scantap is being built in Cincinnati for owners who want a better review habit without another complicated system. The goal is simple hardware, useful follow-through, and claims that stay grounded in what the product can prove."
        primary={{ label: "Explore the dashboard", href: "/dashboard" }}
        secondary={{ label: "Plan a pilot", href: "/pilot" }}
      >
        <div className="about-mark">
          <Radio size={38} />
          <strong>Built close to the customer</strong>
          <span>Greater Cincinnati, Ohio</span>
        </div>
      </PageHero>
      <section className="about-principles section-shell">
        <div>
          <h2>What Scantap is trying to get right</h2>
          <p>
            The product is early. That makes it more important to be clear
            about the operating principles before adding features or promises.
          </p>
        </div>
        <div className="principles-list">
          <article>
            <span>01</span>
            <h3>Direct is better.</h3>
            <p>The customer should understand where a tap goes before they tap.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Events keep their meaning.</h3>
            <p>A tap, a Google open, a new review, and a reply are different things.</p>
          </article>
          <article>
            <span>03</span>
            <h3>The dashboard serves a routine.</h3>
            <p>It should shorten the owner&apos;s weekly review work, not create more reporting.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Local support is an advantage.</h3>
            <p>The first pilots stay close enough for real placement and workflow feedback.</p>
          </article>
        </div>
      </section>
      <section className="about-status section-shell">
        <div>
          <MapPin size={24} />
          <h2>Where the company is today</h2>
        </div>
        <ul>
          <li><Check size={17} /> Website and interactive dashboard demo in active build</li>
          <li><Check size={17} /> Counter stand, adhesive plate, and staff card selected for the launch offer</li>
          <li><Check size={17} /> Candidate suppliers identified; samples and final costs still require verification</li>
          <li><Check size={17} /> Pilot pricing and direct support channel will be set before public sales</li>
        </ul>
      </section>
      <section className="plain-cta section-shell">
        <div>
          <h2>See the product as it stands today.</h2>
          <p>The demo is functional, clearly labeled, and ready for focused feedback.</p>
        </div>
        <Link className="button button-primary" href="/dashboard">
          Open the dashboard <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
