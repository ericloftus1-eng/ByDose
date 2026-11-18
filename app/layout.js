import "./globals.css";

export const metadata = {
  title: "DOSE — Art is a social thing",
  description: "A first look at the DOSE art community. Share what you make, discover original voices, and find your creative people.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
