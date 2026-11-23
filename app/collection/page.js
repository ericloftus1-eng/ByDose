import Art from "../art";
import s from "../social.module.css";

export const metadata = { title: "The Secret Nine — DOSE" };

export default function Collection() {
  return <main className={`${s.social} ${s.collection}`}><a href="/hub">← Back to ByDose</a><Art /></main>;
}
