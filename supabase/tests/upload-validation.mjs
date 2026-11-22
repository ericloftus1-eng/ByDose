import assert from "node:assert/strict";
import { validateImage } from "../../app/community/client.js";

for (const type of ["image/jpeg", "image/png", "image/webp"]) {
  assert.doesNotThrow(() => validateImage({ size: 5 * 1024 * 1024, type }));
  assert.throws(
    () => validateImage({ size: 5 * 1024 * 1024 + 1, type }),
    /5 MB/,
  );
}
for (const type of [
  "image/svg+xml",
  "image/gif",
  "text/html",
  "application/javascript",
  "",
]) {
  assert.throws(() => validateImage({ size: 100, type }), /JPEG/);
}
assert.throws(() => validateImage(null), /Choose an image/);
assert.throws(
  () => validateImage({ size: 0, type: "image/jpeg" }),
  /Choose an image/,
);
console.log(
  "PASS: client upload types, missing/empty files, 5 MB boundary. Hosted bucket enforcement requires live verification.",
);
