import { createBrowserRouter } from "react-router";
import HomeAta from "./pages/HomeAta";
import {Contato} from "./pages/Contato";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminPanel } from "./pages/AdminPanel";
import { AdminAtas } from "./components/admin/AdminAtas";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminCategories } from "./components/admin/AdminCategories";
import { AdminUsuarios } from "./components/admin/AdminUsuarios";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthCallback } from "./components/AuthCallback";
import { RedefinirSenha } from "./pages/RedefinirSenha";
import { PerfilPage } from "./pages/PerfilAdmin";


export const router = createBrowserRouter([
  { path: "/", Component: HomeAta },
  { path: "/contato", Component: Contato },
  { path: "/login", Component: AdminLogin },
  { path: "/auth/callback", Component: AuthCallback },
  { path: "/redefinir-senha", Component: RedefinirSenha },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        Component: AdminPanel,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "atas", Component: AdminAtas },
          { path: "categorias", Component: AdminCategories },
          { path: "usuarios", Component: AdminUsuarios },
          { path: "perfil", Component: PerfilPage }

        ],
      },
    ],
  },

  { path: "*", Component: HomeAta },
]);