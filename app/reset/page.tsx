import ResetPasswordForm from "@/components/ResetPasswordForm";

type Props = {
  searchParams?: { token?: string };
};

export default function ResetPage({ searchParams }: Props) {
  const token = typeof searchParams?.token === "string" ? searchParams.token : "";

  return (
    <main className="page">
      <div className="header">
        <div>
          <div className="logo">
            ASF <span>Codesearch</span>
          </div>
          <div className="subtle">Reinitialiser votre mot de passe.</div>
        </div>
      </div>
      <div className="layout">
        <div className="panel">
          <div className="panel-title">Reinitialisation</div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </main>
  );
}
