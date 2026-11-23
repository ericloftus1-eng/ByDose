import Appearance from "../appearance/appearance";

export const metadata = {
  title: 'Suggest an idea — DOSE Art',
  description: 'Help shape DOSE Art. Suggest a design change, a feature, or a new direction.',
};

export default function Layout({ children }) { return <Appearance>{children}</Appearance>; }
