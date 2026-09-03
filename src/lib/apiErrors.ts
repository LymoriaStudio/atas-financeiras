// A API própria (.NET) devolve mensagens reais de erro (ex: "E-mail já cadastrado"),
// mas o fallback de httpClient.ts vira só "Erro 409" quando o corpo da resposta não
// tem detail/title. Esses helpers evitam esconder a mensagem real atrás de um
// genérico "tente novamente" quando ela já é informativa.

const GENERIC_HTTP_ERROR = /^Erro \d+$/;
const CONFLICT_WORDS = /(uso|cadastrad|existe|duplicad|conflit)/i;

// Mensagem a exibir pro usuário: a real da API quando ela for útil, senão o fallback.
export function apiErrorMessage(error: Error | null | undefined, fallback: string): string {
  const msg = error?.message ?? "";
  return msg && !GENERIC_HTTP_ERROR.test(msg) ? msg : fallback;
}

// Detecta se o erro é um conflito de valor duplicado sobre um campo específico
// (ex: subjectPattern = /e-?mail/i pra pegar "Este e-mail já está cadastrado").
export function isConflictFor(error: Error | null | undefined, subjectPattern: RegExp): boolean {
  const msg = error?.message ?? "";
  return subjectPattern.test(msg) && CONFLICT_WORDS.test(msg);
}
