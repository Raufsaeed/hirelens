"use client";

import Button from "@/components/ui/Button";

// Submit button for interactive forms. It doesn't take focus on mouse down: otherwise the last
// field blurs, its error message appears, the button moves down and the click misses.
// The form's submit check still runs and shows every error.
export default function SubmitButton(props) {
  return <Button type="submit" onMouseDown={(event) => event.preventDefault()} {...props} />;
}
