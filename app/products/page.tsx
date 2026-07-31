import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock3, QrCode, Radio } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { ProductVisual } from "@/components/product-visual";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "NFC review products",
  description:
    "Compare Scantap counter stands, adhesive plates, and staff cards for direct Google review requests.",
};

const productTypes = ["stand", "plate", "card"] as const;

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="A review prompt that fits the way your business already works."
        description="Choose a visible counter stand, a low-profile adhesive plate, or a staff card your team can carry. Every format uses NFC with a QR fallback and opens the business's Google review page directly."
        primary={{ label: "Build a pilot outline", href: "/pilot" }}
        secondary={{ label: "See the dashboard", href: "/dashboard" }}
      >
        <div className="product-hero-stack">
          <ProductVisual type="stand" />
          <ProductVisual type="plate" dark />
          <ProductVisual type="card" />
        </div>
      </PageHero>

      <section className="product-detail-section section-shell">
        {products.map((product, index) => (
          <article className="product-detail-row" id={product.slug} key={product.slug}>
            <ProductVisual type={productTypes[index]} dark={index === 1} />
            <div>
              <h2>{product.name}</h2>
              <p className="lead">{product.summary}</p>
              <p>{product.detail}</p>
              <dl>
                <div>
                  <dt>Best placement</dt>
                  <dd>{product.placement}</dd>
                </div>
                <div>
                  <dt>Best for</dt>
                  <dd>{product.bestFor}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </section>

      <section className="included-section">
        <div className="section-shell">
          <div className="section-heading">
            <h2>The standard version keeps the first order simple.</h2>
            <p>
              The launch offer is Scantap-branded hardware that can be assigned
              to a business without waiting on custom artwork.
            </p>
          </div>
          <div className="included-grid">
            <article>
              <Radio size={24} />
              <h3>NFC programmed to your link</h3>
              <p>Each device is assigned and checked before handoff.</p>
            </article>
            <article>
              <QrCode size={24} />
              <h3>Visible QR fallback</h3>
              <p>Customers can use their camera when they prefer not to tap.</p>
            </article>
            <article>
              <Check size={24} />
              <h3>Placement and phone check</h3>
              <p>The pilot checklist covers placement and iPhone/Android tests.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="custom-section section-shell">
        <div>
          <Clock3 size={26} />
          <h2>Need your own brand on the hardware?</h2>
        </div>
        <div>
          <p>
            Custom-branded runs will be quoted separately because artwork,
            proofing, order minimums, and supplier timing can change the cost
            and delivery date. Scantap will confirm those details before an
            order is placed.
          </p>
          <Link className="text-link-arrow" href="/pilot">
            Add custom branding to a pilot outline <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
