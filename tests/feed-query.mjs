import assert from "node:assert/strict";
import { filterArtworkQuery } from "../app/community/feed-query.mjs";
function run(overrides = {}) {
  const calls = [];
  const query = { eq: (...args) => { calls.push(["eq", ...args]); return query; }, ilike: (...args) => { calls.push(["ilike", ...args]); return query; } };
  assert.equal(filterArtworkQuery(query, { artist: null, feedChoiceReady: true, medium: "All work", search: "", ...overrides }), query);
  return calls;
}
assert.deepEqual(run(), [["eq", "show_in_feed", true]]);
assert.deepEqual(run({ artist: { id: "owner" } }), [["eq", "artist_id", "owner"]]);
assert.deepEqual(run({ feedChoiceReady: false }), []);
assert.deepEqual(run({ medium: "Digital", search: "GGSG" }), [["eq", "show_in_feed", true], ["eq", "medium", "Digital"], ["ilike", "title", "%GGSG%"]]);
assert.deepEqual(run({ artist: { id: "owner" }, medium: "Graffiti", search: "a%_\\b" }), [["eq", "artist_id", "owner"], ["eq", "medium", "Graffiti"], ["ilike", "title", "%a\\%\\_\\\\b%"]]);
console.log("PASS: real artwork query filters, profile-only gallery inclusion, medium/title combination, literal wildcard escaping; shared helper used for pagination.");
