import Appearance from "../appearance/appearance";

export const metadata = {
  title: 'DOSE Art — Make your mark.',
  description: 'Street roots. Every style welcome. Share your artwork and build your artist profile on DOSE Art.',
};

export default function Layout({ children }) { return <Appearance>{children}</Appearance>; }
