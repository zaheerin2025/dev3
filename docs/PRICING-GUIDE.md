# Developers3 — Pricing Guide (Internal)

Owner-facing reference for how we set, change, and defend our prices.
Canonical prices live in code and the Admin panel — this document explains the thinking, not the other way around.

> Last updated: 2025 pricing overhaul (Task 19-c). Review this guide quarterly.

---

## 1. How our prices are set

Every fixed quote is built from the same formula:

```
price = estimated hours × blended rate ($45/hr) × 1.4 value buffer
```

- **Estimated hours** — scoped hours from the discovery call/workshop (design, build, QA, launch, project management). Estimate conservatively; add 10% buffer for unknowns *before* applying the formula.
- **Blended rate ($45/hr)** — our true internal cost across the senior team (we are deliberately lean: no sales commissions, no account managers).
- **Value buffer (×1.4)** — covers risk, revisions, warranty, and the business margin. Never quote below `hours × rate` (cost) — the buffer is what keeps us solvent when a project runs long.

### Minimum project floors

The formula never applies below these floors — small jobs must carry their coordination cost:

| Work type                    | Floor                    |
| ---------------------------- | ------------------------ |
| Any custom website           | $500                     |
| E-commerce / custom build    | $2,999                   |
| Web app / software (phase 1) | $8,500                   |
| Mobile app MVP               | $4,500                   |
| UI/UX engagement             | $950                     |
| Marketing retainers          | $299–$350 /mo            |
| Maintenance plans            | $49 /mo                  |
| Hourly work (post-launch)    | $55/hr, 4-hour minimum   |

### Worked examples (current canonical prices)

| Package                | Est. hours | Math                    | Quoted price |
| ---------------------- | ---------- | ----------------------- | ------------ |
| Starter Website        | ~12–14 h   | 12.5 × $45 × 1.4 ≈ $788 | **$699**     |
| Business Website       | ~24 h      | 24 × $45 × 1.4 ≈ $1,512 | **$1,499**   |
| E-commerce / Custom    | ~48 h      | 48 × $45 × 1.4 ≈ $3,024 | **$2,999+**  |
| Custom Software        | ~135 h     | 135 × $45 × 1.4 ≈ $8,505| **$8,500**   |
| Mobile App MVP         | ~72 h      | 72 × $45 × 1.4 ≈ $4,536 | **$4,500**   |
| UI/UX Design           | ~15 h      | 15 × $45 × 1.4 ≈ $945   | **$950**     |
| SEO retainer           | ~5.5 h/mo  | 5.5 × $45 × 1.4 ≈ $347  | **$350/mo**  |
| Google Ads management  | ~4.75 h/mo | 4.75 × $45 × 1.4 ≈ $299 | **$299/mo**  |
| Maintenance            | ~0.8 h/mo  | 0.8 × $45 × 1.4 ≈ $50   | **$49/mo**   |

> If a quote's implied hourly (price ÷ hours) drops below $45, the job is underpriced — reduce scope or raise the number.

---

## 2. 2025 market benchmark (US small-business market)

Where the market is, where we sit, and why:

| Service                          | Market range (US, 2025) | Our price   | Our position                                   |
| -------------------------------- | ----------------------- | ----------- | ---------------------------------------------- |
| Landing / 5-page site            | $400 – $1,500           | $699        | Below median — entry point to win the deal     |
| Business site w/ CMS             | $1,000 – $3,000         | $1,499      | At/below median — flagged "Most Popular"       |
| E-commerce                       | $1,500 – $5,000         | $2,999+     | Mid-range — real store scope, fixed quote      |
| Custom web app                   | $8,000 – $25,000        | $8,500+     | At the low end — senior team, phased delivery  |
| SEO retainer                     | $300 – $800 /mo         | $350 /mo    | At the low end — retainers compound, start low |
| Google Ads management            | $250 – $500 /mo         | $299 /mo    | Low end — management fee never touches ad spend|
| Maintenance plan                 | $30 – $100 /mo          | $49 /mo     | Low end — the door-opener for the upsell ladder|
| UI/UX design                     | $800 – $2,500           | $950        | Low end — entry projects that grow into builds |

**Strategy: at/below median to win deals, premium quality in delivery.**
We win on a published, fixed, itemized price against agencies that hide theirs. The upsell ladder (Section 4) — not the first invoice — is where margin comes from. Do **not** chase the bottom of any range: there is always a cheaper freelancer, and we do not want those clients.

---

## 3. When to raise prices (and how to discount safely)

### Raise prices when ANY of these is true

1. **Demand > capacity for 4+ consecutive weeks** — the booking calendar, not opinions, sets the price.
2. **Win rate > 60%** over the last 20 quotes — we are leaving money on the table.
3. **After 5 strong case studies** are published for that service line — proof supports premium.

How to raise: bump the published starting prices by 10–15%, keep existing clients grandfathered for 6–12 months, and update the benchmark table above in the same commit. Raise one service line at a time.

### Discount safely: reduce scope, never rate

- ✅ Fewer pages, defer phase 2, template-based design instead of custom, client provides copy/images, fewer integrations at launch.
- ✅ Bundle value instead of cutting: "I can't do $1,199, but I can include 3 months of maintenance."
- ✅ Minimum viable discount: 10%; walk away below the floors in Section 1.
- ❌ Never cut the blended rate, the value buffer, or the payment terms (40/40/20).

### The upsell ladder (maximize lifetime value, not first invoice)

```
Maintenance $49/mo  →  SEO $350/mo  →  Business rebuild $1,499  →  E-commerce / custom $2,999+
```

1. Land the Starter or Business site (below median — easy yes).
2. Attach **Maintenance** at launch ("who updates it after we hand over?").
3. After 60–90 days of traffic data, pitch **SEO** or **Google Ads** with real numbers.
4. When the business grows, the rebuild/e-commerce conversation starts with a client who already trusts us.

---

## 4. HOW TO EDIT PRICES

### Option A — edit the data files (source of truth)

1. **Website tiers, service starting prices, pricing FAQs:**
   `src/data/pricing.ts` → `websiteTiers[].price`, `servicePricingBlocks[].startingAt`, `pricingFaqs`.
2. **Per-service pages:**
   `src/data/services-priority.ts` and `src/data/services-extended.ts` → each service's `startingPrice` field, plus any `pricingNote` / FAQ answer copy that mentions a number.

   Keep the two layers consistent:

   | Service (slug)                | Field to edit      |
   | ----------------------------- | ------------------ |
   | custom-website-development    | startingPrice      |
   | wordpress-development         | startingPrice      |
   | ecommerce-development         | startingPrice      |
   | software-development          | startingPrice      |
   | mobile-app-development        | startingPrice      |
   | ui-ux-design                  | startingPrice      |
   | seo-services                  | startingPrice      |
   | google-ads-management         | startingPrice      |
   | social-media-marketing        | startingPrice      |
   | website-maintenance           | startingPrice      |

3. **Also check for stragglers** (search for the old number): the pricing meta description in `src/lib/routes.ts` and the home FAQ in `src/data/company.ts`. Blog articles (`src/data/blog-posts.ts`) are informational content — update them only if they quote *our* package prices.

**Dev server:** no restart needed — normal HMR picks the change up; hard-refresh the browser if a cached page lingers. No database or deploy step involved.

### Option B — Admin panel → Pricing tab (live DB override)

The Admin panel has a **Pricing** tab that stores price overrides in the database; overridden values win at runtime without touching code or redeploys. See worklog **Task 19-e** for how overrides are applied and how to clear them.

> Rule of thumb: Option A = the new baseline (versioned, deploys with the site). Option B = a quick experiment or promo that you should promote into the data files once it proves out.

### Consistency checklist before publishing new prices

- [ ] `src/data/pricing.ts` — tiers + service blocks + FAQ answers
- [ ] `src/data/services-priority.ts` / `src/data/services-extended.ts` — `startingPrice`, `pricingNote`, FAQ answers
- [ ] `src/lib/routes.ts` — pricing page meta description
- [ ] `src/data/company.ts` — home FAQ "How much does a new website cost?"
- [ ] Admin panel overrides cleared/updated (Option B)
- [ ] This guide's benchmark table + worked examples updated
