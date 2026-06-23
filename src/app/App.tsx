import { createBrowserRouter } from "react-router";
import HomeAta from "./pages/HomeAta";
import {Contato} from "./pages/Contato";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminPanel } from "./pages/AdminPanel";
import { AdminAtas } from "./components/admin/AdminAtas";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminCategories } from "./components/admin/AdminDepartaments";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", Component: HomeAta },
  { path: "/contato", Component: Contato },
  { path: "/login", Component: AdminLogin },

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
        ],
      },
    ],
  },

  { path: "*", Component: HomeAta },
]);