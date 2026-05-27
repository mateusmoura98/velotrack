import { supabase } from '../lib/supabase';

export const suporteService = {
  listAll: async () => {
    const { data, error } = await supabase
      .from('mensagens_de_suporte')
      .select('*, users(nome)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  listByUser: async (userId) => {
    const { data, error } = await supabase
      .from('mensagens_de_suporte')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  send: async (userId, message) => {
    const { error } = await supabase
      .from('mensagens_de_suporte')
      .insert({ user_id: userId, mensagem: message.trim() });
    if (error) throw error;
  },
};
