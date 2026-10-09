# StoneBrook Carpentry — Notes & Open Items

## Round 3 (October 9, 2026)
Client direction: use A Carpenter's Son's layout and styling with more animations, add pencil marks "like a contractor was there," leave out the pointed section transitions, use EBCO's font, and modernize StoneBrook's **existing** logo instead of a new one.

What changed:
- **Logo**: rebuilt from the original (three stacked rooflines plus the wall post) as clean black-and-white line work with a Barlow Condensed wordmark. Text is converted to outlines, so the files work anywhere.
  - `assets/img/logo-horizontal-white.svg` / `-black.svg`: header and footer
  - `assets/img/logo-stacked-white.svg` / `-black.svg`: closest to the original layout
  - `assets/img/logo-mark.svg`: rooflines only (favicon, social icon)
  - `design/original-logo.png`: the original, for reference
- **Layout (A Carpenter's Son)**: solid nav bar; full-width hero with a centered headline; split text/photo rows; a centered section with a pencil drawing; a service list that swaps the photo on hover; a tan "story" band with hand-drawn 1-2-3 numerals; case-study style project cards; a "Ready to get started?" closing section. No pointed or wavy dividers.
- **Font (EBCO)**: Barlow Condensed bold for headings, Barlow Semi Condensed for sub-heads and buttons, Barlow for body text.
- **Pencil marks**: circles, underlines, arrows, a crow's-foot cut mark, a dimension line ("32' - 0"), handwritten notes, and a job-site punch list with checks that tick off one at a time. Each mark draws itself on as you scroll.
- **More animation**:
  - a tape-measure scroll progress bar
  - slow zoom on the hero image
  - staggered headline entrance
  - photo wipe reveals
  - count-up stats
  - a pencil sketch that becomes the finished porch photo as you scroll (it can also be dragged)
  - service photo swap
  - lifting cards
  - a lightbox for project photos
- **Owner**: Gary Accola (from the signed contract), now named in the copy.

## Round 4 (October 9, 2026)
- Tape-measure progress bar now has a tape case at the left with the blade pulling out of it, hook on the end.
- Graph paper is back behind the "Built to last" and "What to expect" sections.
- Sketch slider is pinned: the photo stays centered and the slider only moves while it's on screen.
- "A peek behind the walls" uses stacking cards: step 2 slides up over step 1, then step 3 over step 2. (On phones the steps simply stack.)
- Punch list uses bullet points instead of check marks, on a plain white clipboard sheet.
- Project gallery with 23 photos, filterable by project type (the messaging guide says to organize project photos by type and "show comparable finished projects"). Includes a lightbox with previous/next.
- Estimate section restored to the round 2 layout (dark band, contact details, form card). The bathroom sketch is gone.
- Hero subline moved up closer to the headline.
- Removed every hand-drawn arrow (hero, "hiring a contractor," "scroll to build it," "cut here," estimate). Waiting on Alexia's arrow graphics to add arrows back where they make sense.

## Open (Alexia handling with the client)
- **Arrow graphics**: Alexia is sending arrow artwork; place it where an arrow points at something meaningful.
- **Email address**: to confirm. The contract was signed from gary@stonebrookcarpentry.com, but it isn't on the site until the client confirms which address to publish.
- **Estimate form**: waiting on the client's form service; the form currently only shows a thank-you message.
- **Contract scope**: the contract specifies a WordPress site with 5–8 pages. This is a one-page static design for review; it will need to move into WordPress and expand to the agreed pages.
- **Review wording**: quotes come from the current site's testimonials page, lightly trimmed. Confirm the client is fine reusing them.
- **Photo release**: `crew-door.jpg` shows a crew member. Confirm it's OK to use.
