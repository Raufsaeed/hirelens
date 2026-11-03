import Alert from "@/components/ui/Alert";
import TextLink from "@/components/ui/TextLink";

// Shown when a reset link is too old, already used or broken.
export default function ExpiredLinkNotice() {
  return (
    <Alert tone="error">
      This link has expired, <TextLink href="/forgot-password">request a new one</TextLink>
    </Alert>
  );
}
