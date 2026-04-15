import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verifica se os valores existem antes de tentar conectar
let supabase = null;
if (supabaseUrl && supabaseUrl !== 'COLOQUE_A_URL_DO_SUPABASE_AQUI' && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn("⚠️ SUPABASE NAO CADASTRADO NO .ENV. Modificações de Ficha não serão salvas!");
}

export async function salvarFicha(discordId, dadosFicha) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('fichas')
            .upsert({
                jogador_id: discordId,
                nome: dadosFicha.nome,
                resumo_dados: dadosFicha.dadosPessoais,
                aparencia: dadosFicha.aparencia,
                poder_desc: dadosFicha.poder,
                arma: dadosFicha.arma,
                criado_em: dadosFicha.criadoEm
            }, { onConflict: 'jogador_id' });

        if (error) {
            console.error("❌ Erro ao salvar ficha no Supabase:", error.message);
        } else {
            console.log(`✅ Ficha de ${dadosFicha.nome} (ID: ${discordId}) salva na Nuvem com sucesso!`);
        }
    } catch (err) {
        console.error("❌ Erro grave no Supabase:", err);
    }
}

export async function pegarFicha(discordId) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('fichas')
        .select('*')
        .eq('jogador_id', discordId)
        .single();
        
    if (error) {
        return null;
    }
    return data;
}
