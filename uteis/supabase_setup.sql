-- Pode rodar esse bloco de código diretamente no "SQL Editor" lá do painel do Supabase!

CREATE TABLE IF NOT EXISTS public.fichas (
  jogador_id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  resumo_dados TEXT NOT NULL,
  aparencia TEXT NOT NULL,
  poder_desc TEXT NOT NULL,
  arma TEXT,
  criado_em TEXT
);

-- Ativa Segurança a Nível de Linha (apenas pro painel ficar feliz, nosso bot usa a key de admin/anon com bypass no server-side)
ALTER TABLE public.fichas ENABLE ROW LEVEL SECURITY;

-- O PC do bot terá total liberdade
CREATE POLICY "Permitir tudo pro bot" 
ON public.fichas 
FOR ALL USING (true);
