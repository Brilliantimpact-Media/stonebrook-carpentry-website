# StoneBrook Carpentry — Open Questions & Placeholders

## Round 2 (October 9, 2026)
Client feedback on round 1: "too feminine," wants a construction aesthetic, likes the hand-drawn circles and arrows on acarpenterssondesignco.com ("like writing on a construction pad"), likes the font on ebcogc.com, and liked the photos and the new logo.

What changed:
- Type: bold condensed **Barlow Condensed** for headings, **Barlow** for body text, and **Caveat** for handwritten marker notes. The logo lockup itself (Cinzel wordmark) was left as approved.
- Color: charcoal and steel with a lumber-tan "carpenter's marker" accent. Cream and brass are gone.
- Hand-drawn marker circles, underlines, arrows and check marks that draw themselves on scroll. Light sections sit on graph paper, and job photos are "taped" to the pad with handwritten captions.
- Real business details from stonebrookcarpentry.com: phone, Wilson WI, hours, licensed & insured, service-area towns, and three real customer reviews (Dave M., Wells L., Todd R.).

## Still open
- **ebcogc.com font**: the site blocks automated visits with a CAPTCHA, so we haven't been able to read its font yet. Headings use one CSS variable (`--display` in `assets/css/main.css`), so matching it is a one-line change once we know the name.
- **Email address**: none listed on the current site, so email isn't shown.
- **Estimate form**: no backend yet; it only shows a thank-you message. Connect it to the form service and the email sequence (guide pages 23–26).
- **Owner name / photo**: not on the current site or in the guide.
- **Review wording**: quotes are from the current site's testimonials page, lightly trimmed for length. Confirm with the client that they're fine reusing them.
- **Domain**: currently live on GitHub Pages for review.

## Logo
- New black-and-white mark (gable roofline, laid courses, brook line). The client approved it in round 1.
- Files: `assets/img/logo-mark.svg`, `logo-black.svg`, `logo-white.svg`. The lockups use web fonts; convert the text to outlines before print use.

## Photos
- 18 photos chosen from 359 in the "Work with Gary" album. The client approved the selection in round 1.
- `crew-door.jpg` shows a crew member. Confirm the client is fine with it being used.
