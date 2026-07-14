import { useNavigate } from "react-router";
import { AllAtas } from "../components/AllAtas";

export function AllAtasPage() {
  const navigate = useNavigate();
  return <AllAtas onBack={() => navigate("/")} />;
}
