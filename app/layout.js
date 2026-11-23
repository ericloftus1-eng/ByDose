import "./globals.css";

export const metadata = {
  title: "ByDose — A little intention. A world of possibility.",
  description: "Street roots. Open possibilities. Explore DOSE Art, make your mark, and help shape what ByDose becomes.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
