import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="page">
      <div className="header">
        <div>
          <div className="logo">
            ASF <span>Codesearch</span>
          </div>
          <div className="subtle">Acces securise a la base produit partagee.</div>
        </div>
      </div>
      <div className="layout">
        <div className="panel">
          <div className="panel-title">Connexion</div>
          <AuthForm />
        </div>
        <div className="panel">
          <div className="panel-title">Ce que vous pouvez faire</div>
          <div className="stack">
            <div className="notice">
              Recherchez par EAN, GTIN, CIP, marque ou nom, puis enrichissez avec les sources gratuites.
            </div>
            <ul className="stack">
              <li>Import CSV direct avec vos colonnes existantes.</li>
              <li>Scan camera des codes-barres pour gagner du temps.</li>
              <li>Vue detaillee et edition rapide des informations produit.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
