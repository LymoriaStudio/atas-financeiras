// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function ProtectedRoute() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // pega a sessão atual (se já existir, ex: refresh da página)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    // escuta login/logout em tempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Verificando sessão...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}