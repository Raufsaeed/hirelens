# Landing page sections

The public front door. The only place, with the auth pages, where the animated purple background appears.

**Sections, in order**
1. **Hero** — `primary-deep` base with the gradient mesh (`hl-mesh`: four blurred `primary` / `primary-hover` / `primary-soft` / `primary-faint` shapes drifting on 18–24s loops, plus a faint dot grid). Transparent nav on top. Headline in `display` ("Hire faster. Hire fairly."), lead in `body-lg` `primary-faint`, two CTAs: light "I'm hiring" (`--on-dark`) and outline "I'm looking for a job" (`--outline-dark`). On load the pill, headline, lead and buttons fade up 18px with a 90ms stagger. Right: a floating sample result card (Ali, 74, Good, 80% match, tags) that bobs 10px on a 6s loop; its ring draws and tags pop in.
2. **How it works** — four steps with 24px icons in tinted circles: Post a job `briefcase`, Share the link `link`, AI checks every CV `sparkles`, You decide `badge-check`.
3. **Features** — six cards: AI CV screening, Ranked candidates, Hiring pipeline, Interviews, AI job descriptions, Reports.
4. **Fair and private** — product facts that count up when visible (100-point score, 6 criteria, ~30s per CV — real product facts, never invented customer numbers) and a `shield-check` checklist.
5. **CTA band** — mesh background in a 24px-radius band: "Post your first job in under two minutes".
6. **Footer** — brand, one-line description, Product / Company / Trust links, © line.

**Scroll reveal** — sections and cards fade up 18px when 15% visible, 80ms apart (`data-reveal`). Reduced motion: no mesh movement, no bob, no reveals; everything simply visible.

**Phone** — single column; hero card drops under the buttons; steps and features stack; 16px gutters; display drops to `display-sm`.
