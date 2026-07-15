import { createBrowserRouter } from "react-router";
import HomeAta from "./pages/HomeAta";
import { AllAtasPage } from "./pages/AllAtasPage";
import {Contato} from "./pages/Contato";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminPanel } from "./pages/AdminPanel";
import { AdminAtas } from "./components/admin/AdminAtas";
import { AdminNovaAta } from "./components/admin/AdminNovaAta";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminCategories } from "./components/admin/AdminCategories";
import { AdminNovaCategoria } from "./components/admin/AdminNovaCategoria";
import { AdminCategoriasVitrine } from "./components/admin/AdminCategoriasVitrine";
import { AdminUsuarios } from "./components/admin/AdminUsuarios";
import { AdminLixeira } from "./components/admin/AdminLixeira";
import { AdminPermissoes } from "./components/admin/AdminPermissoes";
import { AdminRelatorios } from "./components/admin/AdminRelatorios";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthCallback } from "./components/AuthCallback";
import { RedefinirSenha } from "./pages/RedefinirSenha";
import { PerfilPage } from "./pages/PerfilAdmin";
import { ErrorBoundary } from "./pages/ErrorBoundary";


export const router = createBrowserRouter([
  { path: "/", Component: HomeAta, errorElement: <ErrorBoundary /> },
  { path: "/atas", Component: AllAtasPage, errorElement: <ErrorBoundary /> },
  { path: "/contato", Component: Contato, errorElement: <ErrorBoundary /> },
  { path: "/login", Component: AdminLogin, errorElement: <ErrorBoundary /> },
  { path: "/auth/callback", Component: AuthCallback, errorElement: <ErrorBoundary /> },
  { path: "/redefinir-senha", Component: RedefinirSenha, errorElement: <ErrorBoundary /> },

  {
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/admin",
        Component: AdminPanel,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "atas", Component: AdminAtas },
          { path: "atas/nova", Component: AdminNovaAta },
          { path: "categorias", Component: AdminCategories },
          { path: "categorias/nova", Component: AdminNovaCategoria },
          { path: "categorias/vitrine", Component: AdminCategoriasVitrine },
          { path: "lixeira", Component: AdminLixeira },
          { path: "usuarios", Component: AdminUsuarios },
          { path: "permissoes", Component: AdminPermissoes },
          { path: "relatorios", Component: AdminRelatorios },
          { path: "perfil", Component: PerfilPage }

        ],
      },
    ],
  },

  { path: "*", Component: HomeAta, errorElement: <ErrorBoundary /> },
]);