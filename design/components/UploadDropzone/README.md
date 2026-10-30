# Upload dropzone

The only way to attach a CV: one PDF, up to 5 MB. Used on the Apply form and My Profile.

**States**
- Empty — dashed `border-control` box on `surface`, `upload-cloud` in a tinted circle, "Drag your CV here or browse", hint "PDF only · up to 5 MB". The whole box is a `role="button"`, keyboard focusable, and opens the file picker.
- Dragging — `primary-tint` fill, marching `primary` dashed border, icon bobs, "Drop to upload".
- File selected — file row: `file-text` tile, name (ellipsis), size · PDF, ghost "Remove".
- Uploading — progress bar (`hl-progress`, `role="progressbar"`) with percentage; Submit stays disabled.
- Error — `danger-bg` box, `alert-circle`, exact copy: "Only PDF files are accepted" or "File must be under 5 MB", one line saying what to do, "Choose another file". The file is never uploaded.
- Success — file row tinted `success-bg` icon with "CV uploaded".
- Default CV choice — two radio cards: "Use my default CV (ali-cv.pdf)" and "Upload a different CV"; the dropzone appears only for the second.

**Do** check type and size in the browser before uploading and again on the server. **Don't** accept .docx or images, or show raw error codes.
