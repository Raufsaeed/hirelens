// Shared classes for links on the deep purple navigation (design/components/Navigation).

// 44px rows in the HR sidebar and the phone menus.
export const SIDE_LINK =
  "flex min-h-touch w-full items-center gap-3 rounded-control border-0 bg-transparent px-3 text-left text-[15px] font-bold text-nav-text-muted no-underline cursor-pointer " +
  "transition-colors duration-(--duration-fast) ease-out hover:bg-nav-hover hover:text-nav-text " +
  "focus-visible:shadow-focus-nav focus-visible:outline-none " +
  "aria-[current=page]:bg-primary aria-[current=page]:text-on-primary aria-[current=page]:shadow-[0_6px_16px_-6px_var(--nav-bg)]";

// Links in the slim candidate top bar.
export const TOP_LINK =
  "inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-control px-3 text-sm font-bold text-nav-text-muted no-underline " +
  "transition-colors duration-(--duration-fast) ease-out hover:bg-nav-hover hover:text-nav-text " +
  "focus-visible:shadow-focus-nav focus-visible:outline-none aria-[current=page]:bg-primary aria-[current=page]:text-on-primary";
