import { supabase } from '../lib/supabase';

async function rpc(name, params = {}) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data || [];
}

export const productivityService = {
  getOverview: async (dias = 7) => {
    const data = await rpc('get_productivity_overview', { p_dias: dias });
    return Array.isArray(data) ? data[0] : data;
  },

  getTecnicoRanking: (dias = 7) => rpc('get_tecnico_ranking', { p_dias: dias }),

  getDailyTrend: (dias = 30) => rpc('get_daily_trend', { p_dias: dias }),

  getLastActivity: async () => {
    const { data, error } = await supabase
      .from('service_history')
      .select('*, users(nome)')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) return null;
    return data?.[0] || null;
  },
};
