import { ArrowRight, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { FloatingShapesDark } from '@/components/common/floating-shapes';
import { ToolCard } from '@/components/tools/tool-card';
import { getToolMeta } from '@/data/tools/registry';
import type { ToolMeta } from '@/data/tools/types';

/**
 * The six tools our users open the most — a mix of evergreen utilities
 * (QR codes, passwords) and current favorites (WebP, thumbnails, invoices).
 * Metadata comes straight from the tools registry; cards link into the
 * /#/tools portal where all 100 live.
 */
const TRENDING_TOOL_SLUGS = [
  'qr-code-generator',
  'password-generator',
  'invoice-generator',
  'youtube-thumbnail-downloader',
  'webp-image-converter',
  'fancy-font-generator',
] as const;

/**
 * TRENDING TOOLS — black band between Stats and Testimonials.
 * White tool cards pop against the dark background and mirror the
 * Work section's look, keeping the page rhythm cream → black → white.
 */
export function TrendingToolsSection() {
  const tools = TRENDING_TOOL_SLUGS.map((slug) => getToolMeta(slug)).filter(
    (tool): tool is ToolMeta => Boolean(tool)
  );

  return (
    <section id="free-tools" className="section-black relative overflow-hidden py-20 md:py-24">
      <FloatingShapesDark />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="Tools Mania — Free Forever"
          title="The **Free Tools** People Keep Coming Back To"
          description="We built these for our own projects, then figured — why keep them to ourselves? They run right in your browser, nothing gets uploaded, and there are 94 more where these came from."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <Reveal key={tool.slug} delay={i * 60} className="h-full">
              <ToolCard meta={tool} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <Link href="/tools" className="btn-primary-pill">
              <Sparkles className="size-4" aria-hidden="true" />
              Browse All 100 Tools
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <p className="text-xs font-medium text-white/40">
              No signup. No watermarks. No &ldquo;free trial&rdquo; that expires in 7 days.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
