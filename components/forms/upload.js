"use client";

import { GENERIC_ERROR } from "@/lib/auth/validation";

// Sends a form with files using XMLHttpRequest, which (unlike fetch) reports upload progress (0-100).
// Resolves with the JSON the server answered, or { error } when the request fails.
export function uploadWithProgress(url, formData, onProgress) {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      try {
        resolve(JSON.parse(request.responseText));
      } catch {
        resolve({ error: GENERIC_ERROR });
      }
    };
    request.onerror = () => resolve({ error: GENERIC_ERROR });
    request.send(formData);
  });
}
