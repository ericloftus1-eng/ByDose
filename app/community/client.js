"use client";

import { createClient } from "@supabase/supabase-js";

let client;
export function getCommunityClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  });
  return client;
}

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export function validateImage(file) {
  if (!file || !file.size) throw new Error("Choose an image first.");
  if (!extensions[file.type])
    throw new Error(
      "Choose a JPEG, PNG, or WebP image. SVG and GIF are not supported.",
    );
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Images must be 5 MB or smaller.");
}

export async function uploadImage(supabase, userId, bucket, file) {
  validateImage(file);
  // Decode before uploading; no external image URLs or active SVG content.
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This file could not be read as an image.");
  });
  const pixels = bitmap.width * bitmap.height;
  bitmap.close();
  if (pixels > 40000000)
    throw new Error("Choose an image smaller than 40 megapixels.");
  const path = `${userId}/${crypto.randomUUID()}.${extensions[file.type]}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });
  if (error)
    throw new Error(
      "Upload failed. Check your connection and try again. Only JPEG, PNG, or WebP up to 5 MB is supported.",
    );
  return path;
}

export function mediaUrl(supabase, bucket, path) {
  return path
    ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
    : null;
}
