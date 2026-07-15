import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
  className?: string;
  /** true (padrão): bloco centralizado com altura, pra substituir tabelas/listas inteiras.
   *  false: inline compacto, pra usar dentro de um card/valor pequeno. */
  block?: boolean;
}

// Spinner padrão usado em qualquer card/tabela enquanto dados da API carregam.
export function LoadingSpinner({ label = "Carregando...", size = 16, className = "", block = true }: LoadingSpinnerProps) {
  if (!block) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-gray-400 ${className}`}>
        <Loader2 size={size} className="animate-spin" />
        {label}
      </span>
    );
  }
  return (
    <div className={`py-16 flex items-center justify-center gap-2 text-gray-400 text-sm ${className}`}>
      <Loader2 size={size} className="animate-spin" />
      {label}
    </div>
  );
}
