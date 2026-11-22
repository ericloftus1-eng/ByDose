// Executes the actual migration against an embedded PostgreSQL engine.
// The auth/storage schemas below model provider-owned objects; hosted Storage
// MIME enforcement, Auth emails, JWT verification and HTTP uploads need a live test.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const image = `${A}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg`;
const avatar = `${A}/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png`;
let post;

async function as(role, id, sql) {
  await db.exec(
    `set role ${role}; select set_config('request.jwt.claim.sub', '${id || ""}', false);`,
  );
  try {
    return await db.query(sql);
  } finally {
    await db.exec("reset role");
  }
}
async function denied(role, id, sql) {
  await assert.rejects(as(role, id, sql));
}
try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text references storage.buckets(id), name text, owner_id text, unique(bucket_id, name));
    create function storage.foldername(text) returns text[] language sql immutable as $$
      select string_to_array($1, '/')
    $$;
    grant usage on schema public, auth, storage to anon, authenticated;
    grant select on storage.objects to anon, authenticated;
    grant insert, delete on storage.objects to authenticated;
    alter table storage.objects enable row level security;
  `);
  await db.exec(
    await readFile(
      new URL("../migrations/202611180001_community.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(await readFile(new URL("../migrations/202611220001_bydose_ideas.sql", import.meta.url), "utf8"));
  await db.exec(
    `insert into auth.users values ('${A}', 'a@example.invalid'), ('${B}', 'b@example.invalid')`,
  );
  const profiles = await as("anon", null, "select * from public.profiles");
  assert.equal(profiles.rows.length, 2);
  assert.equal(Object.hasOwn(profiles.rows[0], "email"), false);
  await denied(
    "anon",
    null,
    `update public.profiles set display_name='hacked' where id='${A}'`,
  );
  await denied(
    "authenticated",
    A,
    `insert into public.profiles(id,username,display_name) values ('${A}','spoof','Spoof')`,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        A,
        `update public.profiles set display_name='Artist A', username='artist_a' where id='${A}' returning id`,
      )
    ).rows.length,
    1,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        B,
        `update public.profiles set display_name='hacked' where id='${A}' returning id`,
      )
    ).rows.length,
    0,
  );
  await denied(
    "authenticated",
    A,
    `update public.profiles set username='bad user' where id='${A}'`,
  );
  await denied(
    "authenticated",
    B,
    `update public.profiles set username='artist_a' where id='${B}'`,
  );
  await denied(
    "authenticated",
    B,
    `update public.profiles set avatar_path='${avatar}' where id='${B}'`,
  );
  await denied(
    "anon",
    null,
    `insert into storage.objects(bucket_id,name,owner_id) values ('dose-artwork','${image}','${A}')`,
  );
  await denied(
    "authenticated",
    B,
    `insert into storage.objects(bucket_id,name,owner_id) values ('dose-artwork','${image}','${B}')`,
  );
  await denied(
    "authenticated",
    A,
    `insert into storage.objects(bucket_id,name,owner_id) values ('dose-artwork','${image}','${B}')`,
  );
  await denied(
    "authenticated",
    A,
    `insert into storage.objects(bucket_id,name,owner_id) values ('dose-artwork','${A}/malicious.svg','${A}')`,
  );
  await as(
    "authenticated",
    A,
    `insert into storage.objects(bucket_id,name,owner_id) values ('dose-artwork','${image}','${A}'), ('dose-avatars','${avatar}','${A}')`,
  );
  await as(
    "authenticated",
    A,
    `update public.profiles set avatar_path='${avatar}' where id='${A}'`,
  );
  const insertPost = (owner, path, title = "Original work") =>
    `insert into public.posts(artist_id,title,caption,medium,alt_text,image_path) values ('${owner}','${title}','A study','Graffiti','A color study','${path}')`;
  await denied("anon", null, insertPost(A, image));
  await denied("authenticated", B, insertPost(A, image));
  await denied("authenticated", B, insertPost(B, image));
  await denied(
    "authenticated",
    A,
    insertPost(A, `${A}/cccccccc-cccc-4ccc-8ccc-cccccccccccc.jpg`),
  );
  await denied("authenticated", A, insertPost(A, image, "   "));
  post = (await as("authenticated", A, insertPost(A, image) + " returning id"))
    .rows[0].id;
  assert.equal(
    (await as("anon", null, "select title from public.posts")).rows[0].title,
    "Original work",
  );
  await denied(
    "authenticated",
    A,
    `update public.posts set title='changed' where id='${post}'`,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        B,
        `delete from public.posts where id='${post}' returning id`,
      )
    ).rows.length,
    0,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        B,
        `delete from storage.objects where name='${image}' returning id`,
      )
    ).rows.length,
    0,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        A,
        `delete from storage.objects where name in ('${image}','${avatar}') returning id`,
      )
    ).rows.length,
    0,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        A,
        `delete from public.posts where id='${post}' returning id`,
      )
    ).rows.length,
    1,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        A,
        `delete from storage.objects where name='${image}' returning id`,
      )
    ).rows.length,
    1,
  );
  await as(
    "authenticated",
    A,
    `update public.profiles set avatar_path=null where id='${A}'`,
  );
  assert.equal(
    (
      await as(
        "authenticated",
        A,
        `delete from storage.objects where name='${avatar}' returning id`,
      )
    ).rows.length,
    1,
  );
  const buckets = await db.query("select * from storage.buckets");
  assert.equal(buckets.rows.length, 2);
  for (const bucket of buckets.rows) {
    assert.equal(bucket.public, true);
    assert.equal(Number(bucket.file_size_limit), 5242880);
    assert.deepEqual(bucket.allowed_mime_types, [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  }
  const idea = (owner, title = "A better header") => `insert into public.site_suggestions(author_id,title,details,category) values ('${owner}','${title}','Make navigation clearer','Site design')`;
  await denied("anon", null, idea(A));
  await denied("authenticated", B, idea(A));
  await denied("authenticated", A, idea(A, "   "));
  await denied("authenticated", A, `insert into public.site_suggestions(author_id,title,details,category,status) values ('${A}','Spoof','Status spoof','Feature','Shipped')`);
  const suggestion = (await as("authenticated", A, idea(A) + " returning id,status")).rows[0];
  assert.equal(suggestion.status, "Suggested");
  assert.equal((await as("authenticated", A, "select * from public.site_suggestions")).rows.length, 1);
  assert.equal((await as("authenticated", B, "select * from public.site_suggestions")).rows.length, 0);
  await denied("anon", null, "select * from public.site_suggestions");
  await denied("authenticated", A, `update public.site_suggestions set status='Shipped' where id='${suggestion.id}'`);
  await denied("authenticated", B, `delete from public.site_suggestions where id='${suggestion.id}'`);
  for (let n = 0; n < 4; n++) await as("authenticated", A, idea(A));
  await denied("authenticated", A, idea(A));
  await as("authenticated", B, idea(B));
  await db.exec(`update public.site_suggestions set created_at=now()-interval '25 hours' where author_id='${A}'`);
  await as("authenticated", A, idea(A));
  assert.equal((await as("authenticated", A, "select * from public.site_suggestions")).rows.length, 6);
  console.log("PASS: private suggestion insert/read ownership, anonymous/cross-user/spoofed-status denials, blank titles, five-per-day limit, independent user limits, and rolling expiry.");
  console.log(
    "PASS: migration, public reads, automatic private-email-free profiles, self-only edits/uploads/posts/deletes, immutable assets, linked-asset deletion guards, bucket configuration.",
  );
} finally {
  await db.close();
}
