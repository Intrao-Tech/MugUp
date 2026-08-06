import "./globals.css";

// Pass-through root layout: <html>/<body> live in src/app/[locale]/layout.tsx
// so each locale gets its own lang attribute. The global not-found renders its
// own document shell (see src/app/not-found.tsx).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
