import Art from "../art";
import s from "../social.module.css";

export const metadata = { title: "The Secret Nine — DOSE" };

export default function Collection() {
  return <main className={`${s.social} ${s.collection}`}><a href="/">← Back to the community</a><Art /></main>;
}
