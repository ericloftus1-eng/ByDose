import "./globals.css";

export const metadata = {
  title: "DOSE",
  description: "Art by DOSE. Coming soon.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
