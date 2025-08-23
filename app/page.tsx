export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-3 text-3xl font-semibold">Bienvenue 👋</h1>
      <p className="mb-6 text-ink-200">
        Cette mini-app Next.js héberge un premier formulaire « Good Project Form » basé sur la fiche
        ADDIE × Scrum × Kirkpatrick.
      </p>
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-2">Démarrer</h2>
        <p className="text-ink-200 mb-4">
          Remplis le formulaire pour générer un JSON réutilisable (démo, export, stockage ultérieur).
        </p>
        <a className="btn btn-primary" href="/goodprojform">Accéder au formulaire</a>
      </div>
    </section>
  );
}
