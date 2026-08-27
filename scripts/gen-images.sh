#!/bin/bash
# Generates all imagery for the Developers3 website via z-ai CLI.
set -u
cd /home/z/my-project
mkdir -p public/images/portfolio public/images/team public/images/testimonials

gen() {
  local p="$1" o="$2" s="$3"
  if [ -s "$o" ]; then echo "SKIP $o (exists)"; return 0; fi
  for i in 1 2 3; do
    if timeout 150 z-ai image -p "$p" -o "$o" -s "$s"; then echo "OK $o"; return 0; fi
    echo "retry $i for $o"; sleep 3
  done
  echo "FAIL $o"
}

# Hero + OG
gen "Modern 3D abstract illustration of a website dashboard interface floating in dark emerald green space, glassmorphism panels showing charts and code windows, emerald green and teal color scheme with amber accents, soft glow, premium tech agency aesthetic, high quality, detailed" "public/images/hero-dashboard.png" "1344x768"
gen "Website banner for a software development agency, dark emerald green background with abstract geometric code bracket pattern, bold modern tech aesthetic, teal and amber accents, clean professional design, no text, high quality" "public/images/og-image.png" "1344x768"

# Portfolio covers
gen "Elegant fashion e-commerce website homepage mockup shown at a slight angle on a laptop, minimalist boutique clothing store with product grid of apparel, beige and cream tones, modern web design, professional, high quality" "public/images/portfolio/lumina-boutique.png" "1344x768"
gen "Sleek fintech payments dashboard UI mockup on a laptop screen, dark theme with green accent charts showing transaction analytics, modern financial software, professional product shot, high quality" "public/images/portfolio/northpay.png" "1344x768"
gen "Modern dental clinic website design mockup on a desktop screen, clean white and teal palette, dentist profile and appointment booking form, friendly healthcare web design, professional, high quality" "public/images/portfolio/meridian-dental.png" "1344x768"
gen "Luxury real estate website mockup with large property photography and map search interface, elegant modern layout, warm neutral tones, professional web design, high quality" "public/images/portfolio/vantage-realty.png" "1344x768"
gen "Logistics fleet management dashboard UI mockup, map with delivery routes, shipment tracking panels and KPI cards, teal and dark slate color scheme, enterprise software, professional, high quality" "public/images/portfolio/atlas-logistics.png" "1344x768"
gen "Fitness mobile app UI mockup on two smartphones, workout tracking screens with progress rings and statistics, vibrant coral and dark theme, modern app design, high quality" "public/images/portfolio/pulsefit.png" "1344x768"
gen "Coffee shop mobile ordering app UI mockup on a smartphone, warm brown and cream palette, menu screen with latte photos and loyalty card screen, modern app design, high quality" "public/images/portfolio/brewpoint.png" "1344x768"
gen "Online learning platform website mockup, course cards with progress bars and video lesson interface, amber and dark charcoal theme, modern edtech web design, professional, high quality" "public/images/portfolio/skillforge.png" "1344x768"
gen "Direct-to-consumer specialty coffee brand e-commerce website mockup, subscription coffee bags product page, kraft paper and earthy green tones, modern web design, professional, high quality" "public/images/portfolio/crema-coffee.png" "1344x768"
gen "Vibrant social media marketing campaign flat lay for a plant brand, smartphone showing instagram grid feed, lush green plants, bright cheerful aesthetic, modern marketing design, high quality" "public/images/portfolio/urban-bloom.png" "1344x768"

# Team portraits
gen "Professional corporate headshot portrait of a confident man in his early 40s wearing a dark blazer over a crew neck, studio lighting, neutral warm gray background, friendly smile, photorealistic, high quality" "public/images/team/alex-morgan.png" "864x1152"
gen "Professional corporate headshot portrait of a South Asian woman software engineer in her mid 30s wearing a smart teal blouse, studio lighting, neutral warm gray background, warm confident smile, photorealistic, high quality" "public/images/team/priya-sharma.png" "864x1152"
gen "Professional corporate headshot portrait of a creative man in his mid 30s with glasses and short beard wearing a casual charcoal shirt, studio lighting, neutral warm gray background, photorealistic, high quality" "public/images/team/daniel-reeves.png" "864x1152"
gen "Professional corporate headshot portrait of a Latina woman marketing director in her mid 30s wearing a smart blazer, studio lighting, neutral warm gray background, confident warm smile, photorealistic, high quality" "public/images/team/sofia-alvarez.png" "864x1152"

# Testimonial avatars
gen "Professional headshot portrait of a smiling blonde woman entrepreneur in her 30s, soft office background blurred, natural light, photorealistic, high quality" "public/images/testimonials/sarah-mitchell.png" "1024x1024"
gen "Professional headshot portrait of an East Asian man CEO in his 40s wearing glasses, modern office background blurred, natural light, photorealistic, high quality" "public/images/testimonials/david-chen.png" "1024x1024"
gen "Professional headshot portrait of a Black woman fitness entrepreneur in her 30s wearing athletic wear, bright gym background blurred, natural light, photorealistic, high quality" "public/images/testimonials/amara-okafor.png" "1024x1024"

echo "ALL IMAGES DONE"
