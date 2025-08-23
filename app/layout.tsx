import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Good Project Form",
  description: "Formulaire projet — ADDIE × Scrum × Kirkpatrick"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="border-b border-ink-800 bg-ink-900/50">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-accent-500" />
              <span className="font-semibold tracking-wide">GoodProj</span>
            </div>
            <nav className="text-sm text-ink-300">
              <a href="/" className="hover:opacity-80">Accueil</a>
              <span className="mx-2 opacity-40">•</span>
              <a href="/goodprojform" className="hover:opacity-80">Formulaire</a>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="container py-10 text-center text-sm text-ink-400">
          Conçu pour un portfolio sobre et accessible.
        </footer>
      </body>
    </html>
  );
}
