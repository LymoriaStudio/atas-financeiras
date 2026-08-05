import { useEffect } from "react";
import { useNavigate } from "react-router";

// Essa página só era alcançada via /auth/callback (fluxo de convite por e-mail do
// Supabase). Nossa API própria não tem esse fluxo — trocar senha agora é feito
// autenticado, em /admin/perfil (que já pede a senha atual antes de trocar).
export function RedefinirSenha() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Redirecionando...</p>
    </div>
  );
}
