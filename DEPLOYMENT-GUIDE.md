# Developers3 — Free Hosting & Database Guide

**The question:** "Where should I publish this website and its database entirely for FREE?"
**The answer:** Vercel (free Hobby plan) for the app + Neon (free plan) for the database. Details, warnings, and alternatives below.

This is a full-stack Next.js app, not a brochure site. It has server-side pieces that *require* a real server:

- API routes under `/api/*` (contact-form **leads**, **newsletter** signups, **admin** auth, public blog/settings)
- A **Prisma** database (currently SQLite at `db/custom.db`) holding `Lead`, `NewsletterSubscriber`, `Post`, and `Setting` tables
- An admin panel at `/#/admin` protected by the `ADMIN_PASSCODE` env var
- A tools portal (100 client-side tools) at `/#/tools` — this part needs nothing special, it's just static assets
- Optional env vars: `NEXT_PUBLIC_GA_ID` (GA4) and `NEXT_PUBLIC_ADSENSE_CLIENT` (AdSense)

Because of the API routes and database, any "pure static" host (GitHub Pages, plain S3, most "free web hosting" sites) is **out**. You need a host that runs Next.js server code.

## Contents

1. [The short answer](#1-the-short-answer)
2. [Why the SQLite file cannot come with you — read this first](#2-why-the-sqlite-file-cannot-come-with-you)
3. [Step-by-step: deploy to Vercel + Neon](#3-step-by-step-deploy-to-vercel--neon)
4. [Database free-tier comparison](#4-database-free-tier-comparison)
5. [Alternative free app hosts, honestly reviewed](#5-alternative-free-app-hosts)
6. [Honest limits and the upgrade path](#6-honest-limits-and-the-upgrade-path)
7. [Security and your data](#7-security-and-your-data)
8. [FAQ](#8-faq)
9. [Where these numbers came from](#9-where-these-numbers-came-from)

---

## 1. The short answer

**Vercel Hobby (free) + Neon Postgres free plan.** Free tier limits as of 2025/2026 — always re-verify on their pricing pages before committing (see [section 9](#9-where-these-numbers-came-from)).

Why this combo wins for *this specific app*:

- **Vercel is the Next.js maker's own platform.** Zero configuration: it detects the Next.js framework, detects the `bun.lock` file and uses Bun automatically, builds API routes as serverless functions, gives you automatic HTTPS, preview deployments for every git push, and a global CDN. Nothing about this app needs to change to run on it.
- **Neon is serverless Postgres with a genuinely free tier** — no time limit, no credit card, no "free for 12 months then billed" trap. You get 0.5 GB of storage per project and roughly 100 compute-hours per month, which is far beyond what a lead form, a blog, and a key/value content store will ever use.
- **Prisma speaks Postgres natively.** Switching this app from SQLite to Postgres is a one-line change in `prisma/schema.prisma` plus one push command. Neon even documents the exact Prisma setup (pooled connection for runtime, direct connection for schema changes).
- **The admin panel works.** `/api/admin/*` routes run as normal serverless functions; the login is a timing-safe passcode check, so it works fine on serverless.

The one honest caveat: Vercel's Hobby plan is **for personal, non-commercial use** per their Fair Use Policy. If Developers3 is operating as a business and pulling client leads through this site, plan for Vercel Pro ($20/mo) eventually — see [section 6](#6-honest-limits-and-the-upgrade-path).

## 2. Why the SQLite file cannot come with you

This is the single most common mistake people make with this kind of app, so read this before anything else.

**Serverless hosts (Vercel, Netlify, Cloudflare) have an ephemeral filesystem.** Your API routes don't run in one long-lived process — each request (or burst of requests) runs in a short-lived function instance with a fresh, temporary filesystem. Concretely:

- The functions can't reliably write files at all, and anything written to `/tmp` is thrown away the moment the instance ends.
- Even if you committed `db/custom.db` to the repo, every function instance would get its own *copy*. A lead submitted at 2:00 PM would go into instance A's copy and vanish. Your admin panel would see a different database than your contact form. Redeploys would wipe everything.
- Your real leads and subscribers would be lost, silently, with no errors to warn you.

**Conclusion:** SQLite works in development (that's what `db/custom.db` is for) but must be replaced with a hosted database for production. Postgres via Neon is the closest-to-free-lunch option. Section 4 compares the alternatives; they're all hosted databases for the same reason.

> ⚠️ **Do not** "just deploy to Vercel and keep SQLite" because a tutorial said you can. It will appear to work. Then your leads evaporate.

## 3. Step-by-step: deploy to Vercel + Neon

Budget about 1–2 hours. You need: a GitHub account, your terminal, and this project folder.

### Step 1 — Push the project to GitHub

First, make sure the local SQLite database and secrets never reach GitHub. `.env` is already gitignored, but `db/` is **not** — add it:

```bash
cd /path/to/my-project
echo "db/" >> .gitignore   # never publish db/custom.db (it may contain test leads)
```

Then create an **empty** repo on GitHub (no README, no license — avoid merge conflicts), and:

```bash
git init                          # if not already a git repo
git add .
git commit -m "Developers3 site — initial release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/developers3.git
git push -u origin main
```

### Step 2 — Create the Neon database

1. Go to [neon.com](https://neon.com) → sign up (Google/GitHub login). **No credit card required.**
2. Create a project (pick the region closest to your visitors, e.g. US East or EU Central).
3. On the dashboard, find **Connection Details** and copy **both** strings:
   - **Pooled connection** (host contains `-pooler`) — this is what the running app uses. It survives bursts of serverless traffic.
   - **Direct connection** (no `-pooler`) — this is what `prisma db push` / migrations need. Schema changes can't go through the pooler.

Keep both strings handy; they look like `postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`. Treat them like passwords.

### Step 3 — Switch Prisma from SQLite to Postgres

Open `prisma/schema.prisma` and change the datasource block from:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

to:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled — used by the app at runtime
  directUrl = env("DIRECT_URL")     // direct — used by prisma db push / migrate
}
```

Nothing else in the schema changes. All four models (`Lead`, `NewsletterSubscriber`, `Post`, `Setting`) are plain types that map to Postgres without edits.

### Step 4 — Create the production tables

Run the schema push **from your own machine against the Neon database**. This is where "deploying the database" actually happens. Inline env vars override your local `.env` (which still points at the SQLite file):

```bash
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require" \
DIRECT_URL="postgresql://ep-xxxx.region.aws.neon.tech/neondb?sslmode=require" \
bunx prisma db push
```

You should see the four tables being created. Verify in the Neon console (Tables tab) that `Lead`, `NewsletterSubscriber`, `Post`, and `Setting` exist. Commit the schema change:

```bash
git add prisma/schema.prisma
git commit -m "Switch Prisma to Postgres for production"
git push
```

> ⚠️ If you skip this step and deploy first, the site will load but every API call will fail with "table does not exist" errors. Tables must exist in Neon before (or immediately after) the first deploy.

### Step 5 — Import the repo into Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub (the Hobby plan is the default free tier).
2. **Add New → Project** → select the `developers3` repo → **Import**.
3. Vercel auto-detects Next.js and Bun. **Leave Build Command, Output Directory, and Install Command at their defaults** — the project also sets `output: "standalone"` for self-hosting, which is harmless here. Don't change anything you don't understand.

### Step 6 — Set the environment variables

In the import screen (or later under Project → Settings → Environment Variables), add:

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Neon **pooled** string | The app's runtime DB connection |
| `DIRECT_URL` | Neon **direct** string | For future schema pushes/migrations |
| `ADMIN_PASSCODE` | long random string | Grants access to the `/#/admin` panel. The app refuses login without it (fail-closed) |
| `NEXT_PUBLIC_GA_ID` | e.g. `G-XXXXXXXXXX` | Optional. GA4 |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | e.g. `ca-pub-XXXXXXXX` | Optional. AdSense units |

Generate a strong passcode (never reuse a personal password):

```bash
openssl rand -base64 24
```

> ⚠️ `NEXT_PUBLIC_*` vars are baked into the JavaScript bundle **at build time**. Add them *before* the first deploy, or trigger a redeploy after adding them — changing them alone does nothing to a live site.

Click **Deploy**. First build takes a few minutes. You'll get a URL like `developers3.vercel.app`.

### Step 7 — Post-deploy checklist

Walk through this in order; it takes ~15 minutes and catches 99% of launch problems:

1. **Open the site** on the Vercel URL. Click through home, services, pricing, tools.
2. **Log into the admin panel** at `your-url.vercel.app/#/admin` with your `ADMIN_PASSCODE`. If login is rejected, the env var is missing or misspelled — check Vercel → Settings → Environment Variables, then redeploy.
3. **Set real content.** In the admin **Site Content** tab (visual editor), replace placeholder contact details, stats, and any demo copy. Values are stored in the Postgres `Setting` table and served site-wide.
4. **Add real social links** (footer) via the same content settings.
5. **Test the lead pipeline end-to-end:** submit a test message through the contact form → open admin **Leads** tab → confirm the row appears. Do the same with a test newsletter signup. Then **delete both test rows** from the admin panel so your client list starts clean.
6. **Check the blog:** publish a test post from the admin panel, view it on `/#/blog`, then delete or unpublish it.

### Step 8 — Custom domain

1. Buy the domain at any registrar (the domain itself is the one thing that's never free, typically ~$10/yr).
2. In Vercel: Project → Settings → Domains → add `yourdomain.com` and `www.yourdomain.com`.
3. **Copy the exact DNS records from the Vercel dashboard** (an A record for the apex domain, a CNAME for `www`). Vercel has changed its recommended records before, so never copy them from a blog post or from this guide — use what the dashboard shows you.
4. Wait for DNS propagation (minutes to a few hours). HTTPS certificates are issued automatically and renewed for free.

Then update the site URL constant: `src/lib/site.ts` has `url: 'https://developers3.com'` hardcoded. If your domain differs, have that one line changed (it drives `sitemap.xml` and social-share tags), commit, and push — Vercel redeploys automatically.

### Step 9 — Get indexed by Google

1. Go to [Google Search Console](https://search.google.com/search-console), add your **domain**, and verify via the DNS TXT record it shows you.
2. Submit the sitemap: `https://yourdomain.com/sitemap.xml` (the site generates it automatically — it lists the main pages, services, portfolio, blog, and all 100 tools).
3. Use "Request indexing" on the homepage. Indexing then takes days to a couple of weeks.

---

## 4. Database free-tier comparison

All verified against provider docs/pricing pages in 2025/2026 — **limits change; re-verify before deciding** (links in [section 9](#9-where-these-numbers-came-from)).

| Provider | Free storage | Other free limits | Serverless-friendly | Prisma support | The catch |
|---|---|---|---|---|---|
| **Neon** (recommended) | 0.5 GB per project | ~100 compute-hours/mo; point-in-time restore limited to a 6-hour window on free | **Yes** — scales to zero, built for serverless/edge | **Excellent** — first-class Postgres, documented pooled+direct setup | Compute hours burn fast if you crank autoscaling; ~0.5s cold start after 5 min idle |
| **Supabase** | 0.5 GB per project | 2 active projects; **pauses after 1 week of inactivity**; ~50k monthly active users | Yes (use the pooler port) | Excellent (real Postgres) | Inactivity pause can take your lead form down; reconnecting requires a dashboard visit |
| **Turso** | 5 GB total | ~100 databases; 500M row reads / 10M row writes per month; no SLA on free | **Yes** — SQLite-compatible, made for edge | Decent but different: needs the `@prisma/adapter-libsql` driver adapter | It's libSQL (SQLite-flavored), not Postgres — this app needs code changes beyond a provider swap |
| **MongoDB Atlas M0** | 512 MB | Shared cluster; 500 connections; 10 GB in + 10 GB out per rolling 7 days | Yes, with caveats (shared tier) | Supported (`provider = "mongodb"`) but a bigger migration than Postgres | Document store, not relational; 512 MB; shared CPU means noisy neighbors |
| **Aiven for PostgreSQL** | 1 GB (reduced from 5 GB in May 2025) | Single node, 1 vCPU / 1 GB RAM; free indefinitely, no time limit | Partially — always-on single node, no scale-to-zero or built-in pooler | Excellent (plain Postgres) | 1 GB disk ceiling; single node (no HA); may feel dated next to Neon |

**Verdict for this app:** Neon. It's Postgres (so the Prisma switch is one line), it's built for exactly the bursty-serverless shape Vercel gives you, and its free tier has no pause-after-inactivity behavior. Supabase is a close second (its dashboard and auth extras are nice) if you can live with the 1-week pause. Turso is great tech but would require code changes to this app.

## 5. Alternative free app hosts

If you'd rather not use Vercel, these are the honest options. **What must work:** the `/api/leads` and `/api/newsletter` endpoints (your contact form), the admin panel auth, and the DB connection.

### Netlify (free plan)
Works with Next.js via their adapter; API routes run as serverless functions, so **the admin panel and lead forms work**. Historically: 100 GB bandwidth, 300 build minutes, 125k function invocations per month. Netlify has reworked its plans toward a credits model since, so **verify current limits on netlify.com/pricing**. Catch: their Next.js support has historically trailed brand-new Next major versions — with Next 16, test the build carefully before committing.

### Cloudflare Pages + Workers
Technically impressive and generous, but for this app: the OpenNext adapter is required, the **Worker size limit is 3 MiB on the free plan** — this site ships 100 tools plus heavy UI libraries and will likely blow past it — and the database would need Turso or Cloudflare D1 with Prisma driver adapters. It's the most engineering-heavy option here. Not recommended for a free, low-maintenance deployment of this project.

### Render (free web service)
Runs a **real, long-lived Node process** — so the admin panel's in-memory sessions behave better than on serverless, and a standard Next.js standalone build works. Free tier: 750 instance-hours/month, but **spins down after 15 minutes without traffic**; the next visitor waits ~30–60 seconds for a cold start. Bigger problem: the free tier's disk is **ephemeral**, so a SQLite file still dies on every restart/redeploy. If you use Render, still pair it with Neon for the database. Treat Render free as a demo/testing host, not a home for live leads.

### Railway
**No permanent free tier.** A 30-day trial with a one-time $5 credit, then paid plans from ~$5/month. Good infrastructure; just not free. Skip unless you're already paying.

### Fly.io
**Removed its free tier for new organizations (mid-2024).** New accounts are pay-as-you-go. Not a free option anymore.

### GitHub Pages / any pure static host
**Will NOT work.** The admin panel, leads API, newsletter API, and the database-backed blog all need a running server. Deploying there silently breaks everything except the static pages and the 100 client-side tools.

---

## 6. Honest limits and the upgrade path

**Vercel Hobby is for non-commercial, personal use** — their Fair Use Guidelines say so explicitly. Free limits (as of 2025/2026): 100 GB bandwidth/month, ~1M serverless function invocations, ~4 hours of active function CPU. For a small agency site with modest traffic this is a lot of headroom, but be aware of what the policy means: a site collecting client leads for a business is, strictly read, commercial use. Options, cheapest first:

1. **Stay on Hobby** if the site is genuinely personal/non-commercial, or while traffic is trivial. Many small sites run here for years. This is your call to make, not mine — I'm just telling you what the policy says.
2. **Vercel Pro, $20/user/month** — 1 TB bandwidth, commercial use allowed, higher function limits. The boring, correct choice for a real business.
3. **Render or Netlify paid tiers** — similar money for a single app, and Render gives you a real Node process.

**What "running out" looks like:**

- **Vercel bandwidth exceeded:** they email you and can block further requests on that project until the cycle resets. The site effectively goes down; no surprise charges on Hobby (no card = no overage billing).
- **Neon compute-hours exhausted:** your compute is throttled to the minimum size (slow queries) until the month resets. Storage over 0.5 GB blocks further writes — realistically years away for this app's data volume.
- **Supabase:** project paused (either from inactivity or limits) until you log in and restore it.
- **Turso/Atlas:** queries start failing once quotas are hit — your contact form returns errors.

**Cheapest sane upgrade path** if the site grows: Vercel Pro ($20/mo) + stay on Neon free until storage/compute actually pinches, then Neon's first paid tier (historically ~$19/mo — verify current pricing). That's the whole escalation; there is no scenario where this app needs anything exotic.

## 7. Security and your data

- **`ADMIN_PASSCODE`:** make it long (24+ random characters, `openssl rand -base64 24`), never reuse it, and store it in a password manager. If it ever leaks, change the env var in Vercel **and redeploy** — a redeploy restarts the functions, which also wipes any live admin sessions (sessions are in-memory with an 8-hour TTL, so rotating the passcode alone doesn't kick out an existing session).
- **`DATABASE_URL` / `DIRECT_URL` are secrets.** They contain your database password. `.env` is already gitignored — never move those values into code or the README. Vercel stores them encrypted.
- **Backups on the Neon free plan:** point-in-time restore is available, but the free plan's restore window is limited (6 hours, up to 1 GB of change history). In other words: you can undo "I just deleted the wrong content" within a few hours, but that is not a backup strategy. For real backups, export periodically:

  ```bash
  # Inspect and edit data visually (runs locally, connects to prod if you pass its URL):
  DATABASE_URL="<neon-pooled-url>" bunx prisma studio

  # Proper dump (needs pg_dump installed locally):
  pg_dump "<neon-direct-url>" --no-owner --format=custom --file=backup-$(date +%F).dump
  ```

  A monthly `pg_dump` saved outside your laptop (cloud drive, another machine) is more protection than most small-business sites ever have.
- **Test data:** before going live, delete your test leads and newsletter signups from the admin panel (see Step 7.5).

## 8. FAQ

**Can I keep SQLite?**
On Vercel/Netlify/Cloudflare — no, genuinely not (see [section 2](#2-why-the-sqlite-file-cannot-come-with-you)). On a host with a real server and a persistent disk (a paid VPS, Render with a paid disk) it would work, but you'd be paying to avoid a one-line provider change. Switch to Postgres.

**Is it really free?**
Yes, for this scale. Neon and Vercel both have no-credit-card free tiers with no trial countdown. The honest asterisks: Vercel Hobby is non-commercial per policy, and every free tier has hard caps (sections 4 and 6). Nothing here silently starts billing you — the free plans simply stop or throttle.

**Will the admin panel work on Vercel?**
Yes. The login route and all admin APIs run as serverless functions. One quirk: admin sessions are held in memory, and serverless instances come and go — so occasionally, after a cold start, you'll be asked to log in again. That's cosmetic, not data loss: leads, posts, and content live in Postgres and are unaffected. For a single-admin site this is a non-issue.

**How do I use my own domain?**
Buy it anywhere, add it in Vercel → Settings → Domains, copy the exact DNS records the dashboard shows you, wait for propagation. SSL is automatic and free. Then update the `url` in `src/lib/site.ts` if the domain differs from the hardcoded one, and push.

**How do I get indexed by Google?**
Verify the domain in Google Search Console via DNS, submit `https://yourdomain.com/sitemap.xml`, request indexing for the homepage. The site already ships a proper sitemap (134 URLs including all tools) and `robots.txt`. Expect indexing within days to a couple of weeks.

**What happens if I exceed the free tier?**
Vercel: request blocking/possible project pause until reset (no surprise charges — Hobby has no card on file). Neon: throttled compute speed, and writes stop if you blow past 0.5 GB storage. Your data is not deleted while you're over a limit. Fix is cleanup, waiting for the reset, or upgrading.

**Do I need to change any code to deploy?**
One line: `provider = "sqlite"` → `provider = "postgresql"` (plus the `directUrl` line) in `prisma/schema.prisma`. Everything else — the hash-based routing, the 100 tools, the admin panel, the API routes — works on Vercel as-is.

## 9. Where these numbers came from

Verified via web search in 2025/2026. **Free tiers change — always re-verify on the provider's own pricing page before committing:**

- Vercel: [vercel.com/docs/plans/hobby](https://vercel.com/docs/plans/hobby) · [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) · [vercel.com/pricing](https://vercel.com/pricing)
- Neon: [neon.com/pricing](https://neon.com/pricing) · [Neon plans docs](https://neon.com/docs/introduction/plans) · [Prisma guide](https://neon.com/docs/guides/prisma)
- Supabase: [supabase.com/pricing](https://supabase.com/pricing) · [0.5 GB database-size changelog](https://supabase.com/changelog/33121-relaxing-database-size-limit-on-free-plan-0-5-gb-database-size-per-project)
- Turso: [turso.tech/pricing](https://turso.tech/pricing) · [Developer plan announcement](https://turso.tech/blog/turso-cloud-debuts-the-new-developer-plan)
- MongoDB Atlas: [M0 free-cluster limitations](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations) · [mongodb.com/pricing](https://www.mongodb.com/pricing)
- Aiven: [free PostgreSQL page](https://aiven.io/free-postgresql-database) · [storage-change changelog](https://aiven.io/changelog/6ad6c429-6c1c-4418-abfb-2ca82f927414)
- Render: [render.com/docs/free](https://render.com/docs/free)
- Netlify: [netlify.com/pricing](https://www.netlify.com/pricing) · [free-plan announcement](https://www.netlify.com/blog/introducing-netlify-free-plan)
- Railway: [railway.com/pricing](https://railway.com/pricing) · [free-trial docs](https://docs.railway.com/pricing/free-trial)
- Fly.io: [fly.io/docs/about/pricing](https://fly.io/docs/about/pricing) · [community: free-tier retirement](https://community.fly.io/t/free-tier-is-dead/20651)
- Cloudflare/OpenNext: [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare) · [Workers Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs)

*Not fully verified (sources disagreed or plans changed mid-2025/2026, so the guide hedges):* Neon's exact compute-hours allocation (sources say ~90–100 CU-hours/month), Neon's free project count, Netlify's post-revamp credit-based limits, Render's current RAM per free instance, and Railway's exact post-trial minimum. Check each provider's pricing page for the current numbers.
