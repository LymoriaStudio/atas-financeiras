import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { SearchAndAtas } from "../components/SearchAndAtas";
import { Categories } from "../components/Categories";
import { Footer } from "../components/Footer";
import { CategoryPage } from "../components/CategoryPage";
import { AdminLogin } from "./AdminLogin";
import { AdminPanel } from "./AdminPanel";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { scrollIntent } from "../../utils/scrollIntent";

type Page = "home" | "category" | "admin-login" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
   const navigate = useNavigate();

   useEffect(() => {
  const anchor = scrollIntent.consume(); // lê e limpa
  if (!anchor) return;

  let attempts = 0;
  const tryScroll = () => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else if (attempts++ < 20) {
      setTimeout(tryScroll, 100);
    }
  };

  setTimeout(tryScroll, 50);
}, []);

  if (page === "admin-login") {
    return (
      <AdminLogin
        onLogin={() => setPage("admin")}
    
      />
    );
  }

  if (page === "admin") {
    return <AdminPanel onLogout={() => setPage("home")} />;
  }

  if (page === "category") {
    return <CategoryPage category={selectedCategory} onBack={() => setPage("home")} />;
  }

  return (
    <div className="min-h-screen w-full">
      <Navbar onAdminClick={() => navigate("/login")} />
      <Hero />
      <Features />
      <SearchAndAtas onVerTodas={() => navigate("/atas")} />
      <Categories onCategoryClick={(cat) => { setSelectedCategory(cat); setPage("category"); }} />
      <Footer />
    </div>
  );
}
