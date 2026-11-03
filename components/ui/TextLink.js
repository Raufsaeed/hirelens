import Link from "next/link";

// Text link with the underline that grows from the left on hover.
export const LINK_CLASSES =
  "rounded-[2px] pb-px font-bold text-primary no-underline " +
  "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0_1.5px] " +
  "transition-[background-size,color] duration-(--duration-base) ease-out " +
  "hover:bg-size-[100%_1.5px] hover:text-primary-hover focus-visible:shadow-focus focus-visible:outline-none";

export default function TextLink({ className = "", ...props }) {
  return <Link className={`${LINK_CLASSES} ${className}`} {...props} />;
}
