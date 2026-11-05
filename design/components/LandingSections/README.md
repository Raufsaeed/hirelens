# Landing page sections

The public front door. The only place, with the auth pages, where the animated purple background appears.

**Sections, in order**
1. **Hero** — `primary-deep` base with the gradient mesh (`hl-mesh`: four blurred `primary` / `primary-hover` / `primary-soft` / `primary-faint` shapes drifting on 18–24s loops, plus a faint dot grid). Transparent nav on top. Owl logo in the nav (inline brand, `tone="gradient"`). Headline in `display`: line 1 "Hire faster." stays; line 2 rotates every 2.5s, sliding up, through "Hire fairly.", "Hire smarter." and "Hire with evidence." The line box keeps the height of the longest phrase, so nothing jumps; screen readers read one static sentence. Lead in `body-lg` `primary-faint`, two CTAs: light "I'm hiring" (`--on-dark`) and outline "I'm looking for a job" (`--outline-dark`). On load the headline, lead, buttons and visual fade up 18px with a 90ms stagger.
   **Hero visual (right)** — built in code from the app's own components, never stock photos, with dummy data (Ayesha Malik, Junior Web Developer): a candidate card with a ScoreRing of 88, a MatchBar at 80% and a "Shortlisted" status badge, and a small evidence card "AI found React in the CV" with a teal check. The cards overlap at slight angles (−3° and 2°) and float 8–10px up and down at different speeds (6s and 4.5s). Behind them, the owl mark large at 8% opacity. The visual is decorative (`aria-hidden`).
2. **How it works** — four steps with 24px icons in tinted circles: Post a job `briefcase`, Share the link `link`, AI checks every CV `sparkles`, You decide `badge-check`.
3. **Features** — six cards: AI CV screening, Ranked candidates, Hiring pipeline, Interviews, AI job descriptions, Reports.
4. **Fair and private** — product facts that count up when visible (100-point score, 6 criteria, ~30s per CV — real product facts, never invented customer numbers) and a `shield-check` checklist.
5. **CTA band** — mesh background in a 24px-radius band: "Post your first job in under two minutes".
6. **Footer** — brand, one-line description, Product / Company / Trust links, © line.

**Scroll reveal** — sections and cards fade up 18px when 15% visible, 80ms apart (`data-reveal`). Reduced motion: no mesh movement, no floating cards, no reveals, and the headline shows only "Hire fairly."; everything simply visible.

**Under 1024px** — the hero visual moves below the text, the two cards stack with a small overlap, and the visual gets smaller. **Phone** — single column; no horizontal scroll at 360px; steps and features stack; 16px gutters; display drops to `display-sm`.
