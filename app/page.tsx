import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  MapPin,
  MessageSquareText,
  MousePointerClick,
  Paperclip,
  Radio,
  Send,
  SmartphoneNfc,
  Trash2,
} from "lucide-react";
import { DashboardPreview } from "@/components/dashboard-preview";
import { ProductVisual } from "@/components/product-visual";
import { SignalLedger } from "@/components/signal-ledger";
import { articles, industries, locations, products } from "@/lib/site-data";

const productTypes = ["stand", "plate", "card"] as const;

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>Turn everyday customer moments into reviews that build your reputation.</h1>
          <p>
            Scantap gives customers a direct path to your Google review page,
            then gives you one clear place to follow what happens next.
          </p>
          <div className="button-row">
            <Link className="button button-primary" href="#how-it-works">
              See how Scantap works <ArrowRight size={17} />
            </Link>
            <Link className="button button-secondary" href="/dashboard">
              Explore the dashboard
            </Link>
          </div>
          <div className="hero-trust-line">
            <span>
              <Check size={15} /> Direct to Google
            </span>
            <span>
              <Check size={15} /> QR fallback included
            </span>
            <span>
              <Check size={15} /> No review gating
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <DashboardPreview />
          <div className="hero-product">
            <ProductVisual type="stand" />
          </div>
        </div>
      </section>

      <section className="how-section section-shell" id="how-it-works">
        <div className="section-heading">
          <h2>A simple system for the moment a customer says, “That was great.”</h2>
          <p>
            No app download. No private form placed in front of the review.
            Just a clear next step for the customer and a useful trail for the
            business.
          </p>
        </div>
        <div className="steps-grid">
          <article>
            <span className="step-number">1</span>
            <Radio size={24} />
            <h3>Place it</h3>
            <p>
              Put a stand, plate, or staff card where the customer experience
              naturally finishes.
            </p>
          </article>
          <article>
            <span className="step-number">2</span>
            <MousePointerClick size={24} />
            <h3>The customer taps</h3>
            <p>
              NFC or QR opens the business&apos;s Google review page directly.
            </p>
          </article>
          <article>
            <span className="step-number">3</span>
            <MessageSquareText size={24} />
            <h3>You follow the signal</h3>
            <p>
              See activity, keep up with replies, and catch hardware that needs
              attention.
            </p>
          </article>
        </div>
      </section>

      <section className="products-section section-shell">
        <div className="section-heading split-heading">
          <div>
            <h2>Three simple formats. One straightforward review path.</h2>
          </div>
          <div>
            <p>
              Start with Scantap-branded hardware in white or black. Custom
              branded runs are available with separate proofing and lead time.
            </p>
            <Link className="text-link-arrow" href="/products">
              Compare the products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.slug}>
              <ProductVisual type={productTypes[index]} dark={index === 1} />
              <div className="product-copy">
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
                <span>{product.placement}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-story section-shell">
        <div className="dashboard-story-copy">
          <h2>A clearer view of what happens after the tap.</h2>
          <p>
            The dashboard starts with the work that needs attention—not a wall
            of vanity metrics. Review activity, replies, themes, and device
            health stay connected without pretending every tap became a review.
          </p>
          <ul className="check-list">
            <li>
              <Check size={17} /> Know which reviews still need a reply
            </li>
            <li>
              <Check size={17} /> Separate taps, Google opens, and completed reviews
            </li>
            <li>
              <Check size={17} /> Catch offline or underused devices
            </li>
          </ul>
          <Link className="button button-primary" href="/dashboard">
            Explore the dashboard <ArrowRight size={17} />
          </Link>
          <small>Interactive demo workspace with sample data</small>
        </div>
        <div className="dashboard-story-visual">
          <DashboardPreview />
        </div>
      </section>

      <section className="workday-section">
        <div className="section-shell">
          <div className="section-heading split-heading">
            <h2>Built for the workday, not another software chore.</h2>
            <p>
              Scantap borrows the speed of a good operations tool: one command
              bar, clear status, and focused actions where you need them.
            </p>
          </div>
          <div className="command-demo" aria-label="Example dashboard actions">
            <span>
              <Paperclip size={16} /> Attach context
            </span>
            <span>Mark handled</span>
            <span>Save draft</span>
            <button aria-label="Discard example draft" type="button">
              <Trash2 size={16} />
            </button>
            <button aria-label="Send example reply" type="button">
              <Send size={16} />
            </button>
          </div>
          <div className="workday-grid">
            <article>
              <MessageSquareText size={25} />
              <h3>Know what needs a reply.</h3>
              <p>
                The queue keeps recent, unanswered feedback close to the work.
              </p>
            </article>
            <article>
              <MapPin size={25} />
              <h3>See where people are tapping.</h3>
              <p>
                Compare locations and placements without calling every
                interaction a review.
              </p>
            </article>
            <article className="error-example">
              <AlertTriangle size={25} />
              <h3>Catch offline devices.</h3>
              <p>
                A clear error state tells you which device needs attention and
                why.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="trust-section section-shell">
        <div className="trust-copy">
          <h2>Direct, honest, and easy to understand.</h2>
          <p>
            When a customer taps, they go to the business&apos;s Google review
            page. Scantap does not hold the public option behind a sentiment
            check or steer unhappy customers somewhere else.
          </p>
          <ul className="check-list">
            <li>
              <Check size={17} /> The public review option stays available to everyone
            </li>
            <li>
              <Check size={17} /> Private feedback can be offered separately
            </li>
            <li>
              <Check size={17} /> Replies remain human-reviewed
            </li>
          </ul>
        </div>
        <div className="trust-ledger">
          <SignalLedger />
          <p>
            Each event keeps its own meaning. A tap is a tap. A link open is a
            link open. A review is counted only when the review source reports
            it.
          </p>
        </div>
      </section>

      <section className="directory-section section-shell">
        <div className="section-heading">
          <h2>Start where your business is.</h2>
          <p>
            Practical guidance by business type and by the Greater Cincinnati
            communities Scantap can support first.
          </p>
        </div>
        <div className="directory-grid">
          <div>
            <h3>Industries</h3>
            {industries.map((industry) => (
              <Link href={`/industries/${industry.slug}`} key={industry.slug}>
                <span>{industry.name}</span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
          <div>
            <h3>Locations</h3>
            {locations.map((location) => (
              <Link href={`/locations/${location.slug}`} key={location.slug}>
                <span>{location.name}, {location.region}</span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
          <div className="directory-resources">
            <h3>Useful starting points</h3>
            {articles.map((article) => (
              <Link href={`/resources/${article.slug}`} key={article.slug}>
                <span>{article.title}</span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta section-shell">
        <div>
          <SmartphoneNfc size={30} />
          <h2>Make the next good customer moment easier to share.</h2>
        </div>
        <div className="button-row">
          <Link className="button button-light" href="/dashboard">
            See the dashboard <ArrowRight size={17} />
          </Link>
          <Link className="button button-outline-light" href="/pilot">
            Plan a pilot
          </Link>
        </div>
      </section>
    </>
  );
}
