import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, QrCode, Radio } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "NFC review products",
  description: "Compare the Scantap counter stand, adhesive plate, and staff card for in-person Google review requests.",
  alternates: { canonical: "/products" },
};

const productImages = [
  "/images/scantap-counter-stand.png",
  "/images/scantap-adhesive-plate.png",
  "/images/scantap-staff-card.png",
];

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="Put the review link where customers can actually use it."
        description="Choose a counter stand, adhesive plate, or staff card based on how the customer experience ends. Every format supports NFC and QR and opens your Google review page directly."
        primary={{ label: "Plan your first setup", href: "/pilot" }}
        secondary={{ label: "Try the dashboard", href: "/dashboard" }}
      >
        <div className="product-hero-photo">
          <Image
            alt="Scantap counter stand for Google reviews"
            fill
            priority
            sizes="(max-width: 920px) 100vw, 48vw"
            src="/images/scantap-counter-stand.png"
          />
        </div>
      </PageHero>

      <section className="product-detail-section section-shell">
        {products.map((product, index) => (
          <article className="product-detail-row" id={product.slug} key={product.slug}>
            <div className="product-detail-photo">
              <Image alt={`${product.name} Scantap product mockup`} fill sizes="(max-width: 920px) 100vw, 50vw" src={productImages[index]} />
            </div>
            <div>
              <h2>{product.name}</h2>
              <p className="lead">{product.summary}</p>
              <p>{product.detail}</p>
              <dl>
                <div><dt>Works best at</dt><dd>{product.placement}</dd></div>
                <div><dt>Choose it when</dt><dd>{product.bestFor}</dd></div>
              </dl>
            </div>
          </article>
        ))}
      </section>

      <section className="included-section">
        <div className="section-shell">
          <div className="section-heading">
            <h2>Everything you need to make the first tap work.</h2>
            <p>We program the destination, include a QR backup, and check the placement before the device goes to work.</p>
          </div>
          <div className="included-grid">
            <article><Radio size={24} /><h3>NFC programmed to your link</h3><p>Each device opens the Google review page you approve.</p></article>
            <article><QrCode size={24} /><h3>QR backup on every design</h3><p>Customers can use their camera whenever that feels easier.</p></article>
            <article><Check size={24} /><h3>Phone and placement check</h3><p>We test the tap and scan flow before you put it in front of customers.</p></article>
          </div>
        </div>
      </section>

      <section className="custom-section section-shell">
        <div><Clock3 size={26} /><h2>Want your own brand on it?</h2></div>
        <div>
          <p>
            Custom-branded runs need separate artwork, proofing, supplier minimums,
            and more lead time. We will confirm the price and schedule before you order.
          </p>
          <Link className="text-link-arrow" href="/pilot">Include custom branding in your setup <ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  );
}
