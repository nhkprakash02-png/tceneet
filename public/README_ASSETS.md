This NEET template ships with NO logo, banner, or instructor photos on purpose — add your
own here in `public/` before deploying:

- logo.png              — your institute logo. Used as the PWA icon, the exam-screen watermark
                           image, and the splash-screen logo (see src/app/layout.js). If it's
                           missing, the splash logo simply hides itself (already wired up) and
                           the exam watermark falls back to a plain "TCE" text mark (see
                           .watermark-wrap.wm-fallback in src/styles/index.css) — nothing breaks
                           either way, this is just the designated slot to drop your real logo in.
- seo-banner.png         — 1200x630 social-share preview image (Open Graph / Twitter card),
                           referenced from src/app/layout.js. Put your NEET course banner here.

Faculty/mentor photos are NOT static files anymore — add mentors (with an optional photo
upload) from the live site's Admin Panel → "Mentors / Faculty" tab. Photos are compressed to
Base64 and stored directly in Firestore, so there's nothing to manually place in this folder
for that — see src/components/admin/MentorsManager.jsx. If a mentor has no photo, the UI shows
a gold initial-letter avatar automatically.

Also update the placeholder domain in public/sitemap.xml, public/robots.txt, and the `SITE`
constant in src/app/layout.js once your real domain is live.
