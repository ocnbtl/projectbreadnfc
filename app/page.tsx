import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  MapPin,
  MessageSquareText,
  MousePointerClick,
  Radio,
  SmartphoneNfc,
  Star,
} from "lucide-react";
import { DashboardPreview } from "@/components/dashboard-preview";
import { products } from "@/lib/site-data";

const businessTypes = [
  "Restaurants",
  "Coffee shops",
  "Salons",
  "Home services",
  "Specialty retail",
  "Professional offices",
  "Auto care",
  "Wellness",
];

const productImages = [
  "/images/scantap-counter-stand.png",
  "/images/scantap-adhesive-plate.png",
  "/images/scantap-staff-card.png",
];

export default function HomePage() {
  return (
    <>
      <section className="home-v2-hero">
        <div className="home-v2-proof" aria-label="Five star review goal">
          <span aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <Star fill="currentColor" key={index} size={19} />
            ))}
          </span>
          <p>Built for local shops and growing brands across the USA</p>
        </div>

        <div className="home-v2-grid">
          <div className="home-v2-copy">
            <h1>Drive traffic and increase sales with more five-star reviews.</h1>
            <p>
              Scantap gives customers a fast way to leave a Google review while
              the experience is still fresh—right at the counter, checkout, or
              final handoff.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="#how-it-works">
                See how Scantap works <ArrowRight size={17} />
              </Link>
              <Link className="button button-secondary" href="/dashboard">
                Try the dashboard
              </Link>
            </div>
          </div>

          <div className="home-v2-visual" aria-label="Scantap counter stand and dashboard preview">
            <div className="home-v2-dashboard">
              <DashboardPreview />
            </div>
            <Image
              alt="Black Scantap counter stand with an NFC tap point and QR code"
              className="home-v2-product"
              height={1150}
              priority
              sizes="(max-width: 680px) 72vw, 380px"
              src="/images/scantap-counter-stand.png"
              width={1536}
            />
          </div>
        </div>
      </section>

      <section className="business-rail" aria-label="Businesses Scantap is designed for">
        <p>Made for the businesses people recommend every day</p>
        <div className="business-rail-window">
          <div className="business-rail-track">
            {[...businessTypes, ...businessTypes].map((business, index) => (
              <span aria-hidden={index >= businessTypes.length} key={`${business}-${index}`}>
                {business}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="proof-stats section-shell" aria-labelledby="proof-heading">
        <div className="proof-stats-heading">
          <h2 id="proof-heading">Your reviews shape the decision before you ever meet the customer.</h2>
          <p>
            Strong ratings matter, but so do recency and consistency. Scantap
            helps make the review ask part of the customer experience you
            already deliver.
          </p>
        </div>
        <div className="proof-stats-grid">
          <article>
            <strong>97%</strong>
            <p>of consumers read reviews when choosing a local business.</p>
          </article>
          <article>
            <strong>74%</strong>
            <p>only care about reviews written in the last three months.</p>
          </article>
          <article>
            <strong>68%</strong>
            <p>will only consider a business with at least a four-star rating.</p>
          </article>
        </div>
        <a
          className="proof-source"
          href="https://www.brightlocal.com/research/local-consumer-review-survey/"
          rel="noreferrer"
          target="_blank"
        >
          Source: BrightLocal Local Consumer Review Survey 2026 <ArrowRight size={14} />
        </a>
      </section>

      <section className="home-system" id="how-it-works">
        <div className="section-shell">
          <div className="home-system-heading">
            <h2>Set it up once. Make the review ask easy every day.</h2>
            <p>
              Put Scantap where the customer naturally finishes, let them tap
              or scan, then keep up with reviews from one clear dashboard.
            </p>
          </div>
          <div className="home-system-flow">
            <article>
              <span className="flow-number">1</span>
              <div className="flow-icon"><Radio size={24} /></div>
              <h3>Place</h3>
              <p>Choose a counter, wall, checkout, or handoff that customers already notice.</p>
            </article>
            <span className="flow-connector" aria-hidden="true"><ArrowRight size={18} /></span>
            <article>
              <span className="flow-number">2</span>
              <div className="flow-icon"><MousePointerClick size={24} /></div>
              <h3>Tap or scan</h3>
              <p>NFC or QR opens your Google review page in seconds.</p>
            </article>
            <span className="flow-connector" aria-hidden="true"><ArrowRight size={18} /></span>
            <article>
              <span className="flow-number">3</span>
              <div className="flow-icon"><BarChart3 size={24} /></div>
              <h3>Respond and grow</h3>
              <p>See new reviews, reply faster, and track what customers keep mentioning.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="dashboard-explainer section-shell">
        <div className="dashboard-explainer-heading">
          <h2>A dashboard that tells you what changed—and what to do next.</h2>
          <p>
            The public demo is fully interactive. Filter reviews, write a reply,
            compare locations, and check device health with sample data.
          </p>
          <Link className="text-link-arrow" href="/dashboard">
            Explore the live demo <ArrowRight size={16} />
          </Link>
        </div>
        <div className="dashboard-callout-stage">
          <div className="dashboard-callout-preview"><DashboardPreview /></div>
          <span className="dashboard-callout callout-trends"><BarChart3 size={17} /> See review trends</span>
          <span className="dashboard-callout callout-replies"><MessageSquareText size={17} /> Reply to recent reviews</span>
          <span className="dashboard-callout callout-locations"><MapPin size={17} /> Compare locations</span>
          <span className="dashboard-callout callout-devices"><SmartphoneNfc size={17} /> Check every device</span>
        </div>
      </section>

      <section className="weekly-routine">
        <div className="section-shell weekly-routine-grid">
          <div>
            <h2>Review management should not become a second job.</h2>
            <p>
              Open Scantap, see what needs a reply, check how your locations are
              doing, and get back to running the business.
            </p>
          </div>
          <ol>
            <li><span>01</span><strong>Start with the reviews that need you</strong><p>Unanswered feedback stays at the top of the queue.</p></li>
            <li><span>02</span><strong>Look for a pattern, not a vanity number</strong><p>See which themes and locations changed this week.</p></li>
            <li><span>03</span><strong>Know the hardware is working</strong><p>Catch an offline device before it sits unnoticed.</p></li>
          </ol>
        </div>
      </section>

      <section className="home-products section-shell">
        <div className="home-products-heading">
          <h2>Three ways to put the review link in the right place.</h2>
          <p>
            Start with Scantap-branded hardware in black or white. If you want
            your own brand on the product, we can plan a custom run separately.
          </p>
        </div>
        <div className="home-product-grid">
          {products.map((product, index) => (
            <article key={product.slug}>
              <div className="home-product-image">
                <Image
                  alt={`${product.name} Scantap product mockup`}
                  fill
                  sizes="(max-width: 680px) 100vw, (max-width: 920px) 50vw, 33vw"
                  src={productImages[index]}
                />
              </div>
              <div>
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
                <span>{product.placement}</span>
              </div>
            </article>
          ))}
        </div>
        <Link className="button button-secondary" href="/products">
          Compare all three products <ArrowRight size={17} />
        </Link>
      </section>

      <section className="local-proof">
        <div className="section-shell local-proof-grid">
          <div>
            <span>Cincinnati, Ohio</span>
            <h2>Hands-on support from someone close enough to understand the setup.</h2>
          </div>
          <dl>
            <div><dt>3</dt><dd>physical formats</dd></div>
            <div><dt>1</dt><dd>direct Google review path</dd></div>
            <div><dt>Local</dt><dd>founder-led support</dd></div>
          </dl>
        </div>
      </section>

      <section className="closing-cta section-shell">
        <div>
          <SmartphoneNfc size={30} />
          <h2>Make the next good customer moment easier to share.</h2>
        </div>
        <div className="button-row">
          <Link className="button button-light" href="/pilot">
            Plan your first setup <ArrowRight size={17} />
          </Link>
          <Link className="button button-outline-light" href="/dashboard">
            Try the dashboard
          </Link>
        </div>
      </section>
    </>
  );
}
