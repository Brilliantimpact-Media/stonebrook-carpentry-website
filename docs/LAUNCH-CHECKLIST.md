# StoneBrook Carpentry: launch checklist

Status as of October 27, 2026. ✅ done · 🟡 started, needs input · ⬜ not started

## Pages
- 🟡 **Privacy Policy:** `/privacy-policy/` exists and is linked in the footer. It's a clearly marked **draft placeholder** with headings only (no legal text), and it's hidden from search engines until approved. Needs real content from the business or their attorney, plus the name of the form service once chosen.
- 🟡 **Terms & Conditions:** `/terms/` exists and is linked in the footer. Same status as the privacy policy.
- ✅ **Custom 404 page:** `404.html`, with links to Home, Our Work and the free estimate page. GitHub Pages serves it automatically. It uses `BASE_PATH` in `tools/build.py`, which must be updated if the site moves to a new domain.
- ✅ **Project category pages:** All Projects plus five categories, each with its own URL, title, description, H1 and canonical tag.
- ✅ **Free estimate page:** `/free-estimate/`.

## Forms
- ⬜ **Connect the estimate form** to the client's form service. It currently only shows a thank-you message. This is one change in `assets/js/estimate.js`, and it applies to the homepage and `/free-estimate/` together.
- ⬜ Spam protection and the automatic "we got your request" email (part of the form service setup).
- ⬜ Test a real submission end to end on desktop and phone.

## Content waiting on the client
- ⬜ Gary's photo for "Hiring a contractor" (a placeholder card is live now).
- ⬜ Which email address to publish (none is shown yet).
- ⬜ Confirm "10+ years" and the 30-mile service radius / town list.
- ⬜ Revised copy and photos from Jonathan (sections listed in `docs/UPDATES-2026-10-27.md`).
- ⬜ Approve photo captions (materials such as "composite" and "cedar").
- ⬜ Approve reuse of the three testimonials from the current site.
- ⬜ Category page copy (100–200 words each), if wanted for SEO.
- See `docs/OPEN-QUESTIONS.md` for the full list of items waiting on Gary.

## Search and sharing
- ✅ Unique titles, descriptions, H1s and canonical tags on every public page.
- ✅ Breadcrumb structured data on project and estimate pages; business structured data on the homepage.
- ✅ Share image (1200×630) and share tags on every page.
- ⬜ `sitemap.xml` and `robots.txt`. Easy to generate from the build script, or handled by WordPress after the move.
- ⬜ Update `SITE` (and `BASE_PATH`) in `tools/build.py` to the real domain, then rebuild, so canonical and share links point to it.
- ⬜ Submit the site to Google Search Console once it's on the real domain.
- 🟡 Google rating strip: live, linked to the Business Profile. The review count is typed in by hand, so update it as reviews come in.

## Quality
- ✅ Skip link, visible keyboard focus, alt text on all project photos, accessible dropdown.
- ✅ Animations turn off for visitors with "reduce motion" on.
- ✅ Phone call bar, mobile menu and every page checked at phone and desktop sizes.
- ⬜ Favicon PNG / Apple touch icon (only an SVG icon exists now, which some phones don't use).
- ⬜ Analytics, if wanted. Adding it would also need a line in the privacy policy, and possibly a cookie notice.

## Platform
- ⬜ The contract specifies a WordPress site with 5–8 pages. This static build is the approved design; it still needs to be moved into WordPress.
