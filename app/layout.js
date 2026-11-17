import "./globals.css";

export const metadata = {
  title: "DOSE Art Collective",
  description: "Art, culture, and community. A creative collective for artists, makers, and the painted world.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
