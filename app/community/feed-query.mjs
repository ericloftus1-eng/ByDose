// Apply identical server-side filters before either initial or paginated queries execute.
export function filterArtworkQuery(query, { artist, feedChoiceReady, medium, search }) {
  if (artist) query = query.eq("artist_id", artist.id);
  else if (feedChoiceReady) query = query.eq("show_in_feed", true);
  if (medium !== "All work") query = query.eq("medium", medium);
  if (search) query = query.ilike("title", `%${search.replace(/[\\%_]/g, "\\$&")}%`);
  return query;
}
