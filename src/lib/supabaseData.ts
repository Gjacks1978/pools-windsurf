import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Position } from '../components/AddPositionModal';

// Funções para gerenciar posições no Supabase

/**
 * Busca todas as posições abertas do usuário
 */
export async function getPositions() {
  try {
    // Verifica se o Supabase está configurado antes de tentar fazer a consulta
    if (!isSupabaseConfigured()) {
      console.info('Supabase não configurado. Utilizando somente localStorage.');
      return [];
    }

    // Supabase query to fetch positions
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('is_closed', false)
      .order('created', { ascending: false });

    if (error) {
      console.warn('Aviso: Erro ao buscar posições do Supabase. Utilizando localStorage:', error);
      // Silencia o erro no console de erro para não assustar o usuário
      // mas mantém um aviso no console para fins de debugging
      return [];
    }

    if (!data) return [];

    // Converte o formato do banco para o formato da aplicação
    return data.map((item: {
      pool: string;
      invested: number;
      current: number;
      uncollected: number;
      collected: number;
      range_min: number;
      range_max: number;
      entry_price: number;
      current_price: number;
      network: string;
      dex: string;
      created: string;
      observacoes?: string;
      is_closed: boolean;
    }) => ({
      pool: item.pool,
      invested: item.invested,
      current: item.current,
      uncollected: item.uncollected,
      collected: item.collected,
      rangeMin: item.range_min,
      rangeMax: item.range_max,
      entryPrice: item.entry_price,
      currentPrice: item.current_price,
      network: item.network,
      dex: item.dex,
      created: item.created,
      observacoes: item.observacoes
    }));
  } catch (error) {
    console.warn('Aviso: Erro na comunicação com Supabase. Utilizando localStorage:', error);
    // Silencia o erro no console de erro
    return [];
  }
}

/**
 * Busca todas as posições fechadas do usuário
 */
export async function getClosedPositions() {
  try {
    // Verifica se o Supabase está configurado antes de tentar fazer a consulta
    if (!isSupabaseConfigured()) {
      console.info('Supabase não configurado. Utilizando somente localStorage.');
      return [];
    }

    // Supabase query to fetch closed positions
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('is_closed', true)
      .order('created', { ascending: false });

    if (error) {
      console.warn('Aviso: Erro ao buscar posições fechadas do Supabase. Utilizando localStorage:', error);
      // Silencia o erro no console de erro para não assustar o usuário
      return [];
    }

    if (!data) return [];

    // Converte o formato do banco para o formato da aplicação
    return data.map((item: {
      pool: string;
      invested: number;
      current: number;
      uncollected: number;
      collected: number;
      range_min: number;
      range_max: number;
      entry_price: number;
      current_price: number;
      network: string;
      dex: string;
      created: string;
      observacoes?: string;
      is_closed: boolean;
    }) => ({
      pool: item.pool,
      invested: item.invested,
      current: item.current,
      uncollected: item.uncollected,
      collected: item.collected,
      rangeMin: item.range_min,
      rangeMax: item.range_max,
      entryPrice: item.entry_price,
      currentPrice: item.current_price,
      network: item.network,
      dex: item.dex,
      created: item.created,
      observacoes: item.observacoes
    }));
  } catch (e) {
    console.error('Erro ao buscar posições fechadas:', e);
    return [];
  }
}

/**
 * Adiciona uma nova posição
 */
export async function addPosition(position: Position) {
  // Se o Supabase não estiver configurado, falha silenciosamente
  if (!isSupabaseConfigured()) {
    console.error('Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('positions')
      .insert({
        pool: position.pool,
        invested: position.invested,
        current: position.current,
        uncollected: position.uncollected,
        collected: position.collected,
        range_min: position.rangeMin,
        range_max: position.rangeMax,
        entry_price: position.entryPrice,
        current_price: position.currentPrice,
        network: position.network,
        dex: position.dex,
        created: position.created,
        observacoes: position.observacoes,
        is_closed: false
      });
    
    if (error) {
      console.error('Erro ao adicionar posição:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Erro ao adicionar posição:', e);
    return false;
  }
}

/**
 * Atualiza uma posição existente (usando a data de criação como identificador)
 */
export async function updatePosition(position: Position) {
  // Se o Supabase não estiver configurado, falha silenciosamente
  if (!isSupabaseConfigured()) {
    console.error('Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('positions')
      .update({
        pool: position.pool,
        invested: position.invested,
        current: position.current,
        uncollected: position.uncollected,
        collected: position.collected,
        range_min: position.rangeMin,
        range_max: position.rangeMax,
        entry_price: position.entryPrice,
        current_price: position.currentPrice,
        network: position.network,
        dex: position.dex,
        observacoes: position.observacoes
      })
      .eq('created', position.created);
    
    if (error) {
      console.error('Erro ao atualizar posição:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Erro ao atualizar posição:', e);
    return false;
  }
}

/**
 * Remove uma posição
 */
export async function removePosition(created: string) {
  // Se o Supabase não estiver configurado, falha silenciosamente
  if (!isSupabaseConfigured()) {
    console.error('Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('created', created);
    
    if (error) {
      console.error('Erro ao remover posição:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Erro ao remover posição:', e);
    return false;
  }
}

/**
 * Fecha uma posição (move para fechadas)
 */
export async function closePosition(created: string) {
  // Se o Supabase não estiver configurado, falha silenciosamente
  if (!isSupabaseConfigured()) {
    console.error('Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('positions')
      .update({ is_closed: true })
      .eq('created', created);
    
    if (error) {
      console.error('Erro ao fechar posição:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Erro ao fechar posição:', e);
    return false;
  }
}

/**
 * Restaura uma posição fechada (move para abertas)
 */
export async function restorePosition(created: string) {
  // Se o Supabase não estiver configurado, falha silenciosamente
  if (!isSupabaseConfigured()) {
    console.error('Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('positions')
      .update({ is_closed: false })
      .eq('created', created);
    
    if (error) {
      console.error('Erro ao restaurar posição:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Erro ao restaurar posição:', e);
    return false;
  }
}

/**
 * Importa posições de backup (apaga todas e reimporta)
 */
/**
 * Converte uma posição do formato da aplicação para o formato do banco
 */
function convertToDbFormat(position: Position, isClosed: boolean) {
  return {
    pool: position.pool,
    invested: position.invested,
    current: position.current,
    uncollected: position.uncollected,
    collected: position.collected,
    range_min: position.rangeMin,
    range_max: position.rangeMax,
    entry_price: position.entryPrice,
    current_price: position.currentPrice,
    network: position.network,
    dex: position.dex,
    created: position.created,
    observacoes: position.observacoes,
    is_closed: isClosed
  };
}

/**
 * Deleta todas as posições do usuário
 */
async function deleteAllPositions() {
  // Se o Supabase não estiver configurado, falha silenciosamente
  if (!isSupabaseConfigured()) {
    console.error('Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('positions')
      .delete()
      .neq('id', 0); // Deleta todas
    
    if (error) {
      console.error('Erro ao limpar posições existentes:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Erro ao limpar posições existentes:', e);
    return false;
  }
}

/**
 * Importa posições de backup (apaga todas e reimporta)
 */
export const importPositions = async (positions: Position[], closedPositions: Position[]) => {
  try {
    // Primeiro deletamos todas as posições existentes para o usuário
    await deleteAllPositions();
    
    // Convertemos todos para o formato do banco e inserimos
    const allPositions = [
      ...positions.map((p) => convertToDbFormat(p, false)),
      ...closedPositions.map((p) => convertToDbFormat(p, true))
    ];
    
    if (allPositions.length > 0) {
      const { error: insertError } = await supabase
        .from('positions')
        .insert(allPositions);
      
      if (insertError) {
        console.error('Erro ao importar posições:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
    console.error('Erro ao importar posições:', errorMessage);
    return false;
  }
};
