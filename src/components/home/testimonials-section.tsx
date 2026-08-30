import Image from 'next/image';
import { Star } from 'lucide-react';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Sticker } from '@/components/common/sticker';
import { JsonLd } from '@/components/common/json-ld';
import { getTestimonials } from '@/data';
import { homeTestimonialIds } from '@/data/home-content';
import { buildReviewSchema } from '@/lib/schema';
import type { Testimonial } from '@/lib/types';

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="size-4 fill-gray-400 text-gray-400" aria-hidden="true" />
      ))}
    </div>
  );
}

function TestimonialFooter({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="mt-auto flex items-center gap-3 pt-6">
      {testimonial.avatar ? (
        <Image
          src={testimonial.avatar}
          alt={`${testimonial.name}, ${testimonial.role} at ${testimonial.company}`}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-400 text-sm font-bold text-white"
        >
          {testimonial.initials}
        </span>
      )}
      <div>
        <p className="font-bold text-[#0a0a0a]">{testimonial.name}</p>
        <p className="text-sm text-gray-500">
          {testimonial.role}, {testimonial.company}
        </p>
      </div>
    </div>
  );
}

/**
 * TESTIMONIALS — white section, three quote cards; the middle one is
 * gradient-bordered, elevated, and sticker-tagged as featured.
 */
export function TestimonialsSection() {
  const items = getTestimonials(homeTestimonialIds);

  return (
    <section id="testimonials" className="section-white py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="TESTIMONIALS"
          title="Clients **Love Us**"
          description="Real words from real founders we've partnered with — unedited, on the record."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((testimonial, i) => {
            const card = (
              <article className="card-soft flex h-full flex-col p-8">
                <Stars rating={testimonial.rating} />
                <p className="mt-4 line-clamp-6 text-[#4b5563] leading-relaxed">
                  “{testimonial.quote}”
                </p>
                <TestimonialFooter testimonial={testimonial} />
              </article>
            );

            if (i === 1) {
              return (
                <Reveal key={testimonial.id} delay={i * 90} className="h-full">
                  <div className="gradient-border relative h-full p-1 lg:-translate-y-3">
                    <Sticker rotate={6} className="absolute -top-4 right-6">
                      ⭐ Featured
                    </Sticker>
                    {card}
                  </div>
                </Reveal>
              );
            }

            return (
              <Reveal key={testimonial.id} delay={i * 90} className="h-full">
                {card}
              </Reveal>
            );
          })}
        </div>

        <JsonLd data={items.map((t) => buildReviewSchema(t))} />
      </div>
    </section>
  );
}
