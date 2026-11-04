"use client";

import { useState } from "react";

// Field errors for a form: checked on blur and on submit (never on the first keystroke).
// `validate(values)` returns { field: message } or null. Server errors show until the user edits that field.
export function useFieldErrors(validate, serverErrors) {
  const [localErrors, setLocalErrors] = useState({});

  function errorFor(field) {
    if (field in localErrors) return localErrors[field];
    return serverErrors?.[field] || null;
  }

  // On blur: only check fields the user has typed in.
  function checkField(field, values) {
    if (!values[field]) return;
    const message = validate(values)?.[field] || null;
    setLocalErrors((current) => ({ ...current, [field]: message }));
  }

  // While typing: hide that field's old message.
  function clearField(field) {
    setLocalErrors((current) => (current[field] ? { ...current, [field]: null } : current));
  }

  // On submit: returns true when the form can be sent to the server.
  // `validateNow` lets a form check with different rules (for example Save as draft vs Publish).
  function checkAll(values, validateNow = validate) {
    const errors = validateNow(values);
    if (errors) {
      // Show the new problems and hide older messages on the fields that are now fine.
      setLocalErrors(
        Object.fromEntries(Object.keys(values).map((field) => [field, errors[field] || null]))
      );
      return false;
    }
    setLocalErrors({});
    return true;
  }

  return { errorFor, checkField, clearField, checkAll };
}
