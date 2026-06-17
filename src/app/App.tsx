import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { SearchAndAtas } from "./components/SearchAndAtas";
import { Categories } from "./components/Categories";
import { Footer } from "./components/Footer";
import { AllAtas } from "./components/AllAtas";
import { CategoryPage } from "./components/CategoryPage";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminPanel } from "./components/admin/AdminPanel";

type Page = "home" | "all-atas" | "category" | "admin-login" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  if (page === "admin-login") {
    return (
      <AdminLogin
        onLogin={() => setPage("admin")}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "admin") {
    return <AdminPanel onLogout={() => setPage("home")} />;
  }

  if (page === "all-atas") {
    return <AllAtas onBack={() => setPage("home")} />;
  }

  if (page === "category") {
    return <CategoryPage category={selectedCategory} onBack={() => setPage("home")} />;
  }

  return (
    <div className="min-h-screen w-full">
      <Navbar onAdminClick={() => setPage("admin-login")} />
      <Hero />
      <Features />
      <SearchAndAtas onVerTodas={() => setPage("all-atas")} />
      <Categories onCategoryClick={(cat) => { setSelectedCategory(cat); setPage("category"); }} />
      <Footer />
    </div>
  );
}
