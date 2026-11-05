# Navigation

**HR sidebar** — fixed left column, `sidebar-width` 248px, full height, `nav-bg` deep purple. Top: HireLens brand in `nav-text`; a small `caption` label with the company name. Links (44px rows, 20px icons, 15/700): Dashboard `layout-dashboard`, My Jobs `briefcase`, Candidates `users` (with a count chip), Pipeline `kanban`, Interviews `calendar-clock`, Reports `bar-chart-3`. Resting labels `nav-text-muted` (7.3:1); hover `nav-hover` fill with `nav-text`; the active item is a `primary` pill with `on-primary` text and `aria-current="page"`. Bottom, above a `nav-line` divider: the user (avatar, name, role), Settings `settings`, Company settings `building-2`, Sign out `log-out`. Focus on the dark sidebar uses `shadow-focus-nav` (white), because `primary` is only 2.4:1 against `nav-bg`.

**HR content top bar** — `topbar-height` 64px on `surface-page` with a `border` line under it: candidate search on the left, notifications (`bell`) and primary "Post a job" on the right. Content sits in `hl-container` beside the sidebar.

**Candidate top bar** — slim `nav-height` 56px `nav-bg` bar across the top: brand, links Jobs `search`, Saved Jobs `bookmark`, My Applications `file-text`, My Profile `user` (same resting / hover / active colours as the sidebar), and the avatar menu with Settings and Sign out. Logged-out visitors see Log in and Sign up instead. Below it the page is `surface-page` lavender.

**Phones and tablets** — below `bp-md` (900px) the HR sidebar is replaced by the same slim deep purple bar with search and a 44px `menu` button. The menu opens as a `nav-bg` panel that slides down with a clip reveal (300ms) while the links stagger in; the button becomes `x` "Close menu" with `aria-expanded`. Esc closes it and returns focus to the button.

**Brand mark** — the owl logo (`public/logo-mark.svg`, 32px) beside "HireLens" in Manrope 800: "Hire" in `nav-text` on dark bars (`ink` on light pages) and "Lens" in the logo gradient. See the Logo section of `design-guidelines.md`. The preview still draws the old placeholder mark.
