import { useEffect } from "react";
import { useNavigate } from "react-router";

// Essa rota só existia pro fluxo de "magic link" de convite por e-mail do Supabase.
// Nossa API própria não manda convite por e-mail (o admin já define a senha na criação
// do usuário em /admin/usuarios), então essa rota não é mais alcançada por nada — só
// redireciona pro login pra não quebrar caso algum link antigo ainda aponte pra cá.
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Carregando...</p>
    </div>
  );
}