// Guarda o anchor que deve ser scrollado ao montar a Home
let pendingScroll: string | null = null;

export const scrollIntent = {
  set: (anchor: string) => { pendingScroll = anchor; },
  consume: () => {
    const val = pendingScroll;
    pendingScroll = null; // limpa após ler
    return val;
  },
};