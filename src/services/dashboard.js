import { supabase } from '../lib/supabase';

export const dashboardService = {
  getStats: async () => {
    const { data, error } = await supabase
      .rpc('get_dashboard_metrics', { p_dias: 30 });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;

    const stats = {
      total: row?.total_os || 0,
      pendentes: Math.max(0, (row?.total_os || 0) - (row?.concluidas || 0) - (row?.em_andamento || 0)),
      emAndamento: row?.em_andamento || 0,
      finalizados: row?.concluidas || 0,
    };

    const monthCompleted = row?.concluidas || 0;

    const { data: trend } = await supabase
      .rpc('get_daily_trend', { p_dias: 180 });

    const monthsData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('pt-BR', { month: 'short' }).substring(0, 3);
      monthsData[`${d.getFullYear()}-${d.getMonth()}`] = { label: label.toUpperCase(), value: 0 };
    }

    (trend || []).forEach(t => {
      if (!t.data) return;
      const d = new Date(t.data + 'T00:00:00');
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthsData[key]) monthsData[key].value += Number(t.concluidas);
    });

    return { stats, monthCompleted, chartData: Object.values(monthsData) };
  },

  getMeta: async () => {
    const { data } = await supabase
      .from('configuracoes')
      .select('meta_mensal')
      .maybeSingle();
    return data?.meta_mensal || 100;
  },

  getRanking: async (limit = 5) => {
    const { data, error } = await supabase
      .rpc('get_tecnico_ranking', { p_dias: 30 });

    if (error) throw error;

    return (data || [])
      .slice(0, limit)
      .map(t => ({ nome: t.nome, total: Number(t.concluidas) }));
  },
};
