import { supabase } from '../lib/supabase';

export const dashboardService = {
  getStats: async () => {
    const { data, error } = await supabase
      .from('servicos')
      .select('status, tempo_fim, created_at', { count: 'exact' });

    if (error) throw error;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const services = data || [];

    const stats = { total: services.length, pendentes: 0, emAndamento: 0, finalizados: 0 };
    let monthCompleted = 0;

    const monthsData = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const label = d.toLocaleString('pt-BR', { month: 'short' }).substring(0, 3);
      monthsData[`${d.getFullYear()}-${d.getMonth()}`] = { label: label.toUpperCase(), value: 0 };
    }

    services.forEach(s => {
      if (s.status === 'pendente') stats.pendentes++;
      else if (s.status === 'em_andamento') stats.emAndamento++;
      else if (s.status === 'concluido') {
        stats.finalizados++;
        if (s.tempo_fim) {
          const fd = new Date(s.tempo_fim);
          if (fd.getMonth() === currentMonth && fd.getFullYear() === currentYear) monthCompleted++;
          const key = `${fd.getFullYear()}-${fd.getMonth()}`;
          if (monthsData[key]) monthsData[key].value++;
        }
      }
    });

    return {
      stats,
      monthCompleted,
      chartData: Object.values(monthsData),
    };
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
      .from('servicos')
      .select('technician_id, users!inner(nome)')
      .eq('status', 'concluido');

    if (error) throw error;

    const counts = {};
    (data || []).forEach(s => {
      if (!s.technician_id) return;
      if (!counts[s.technician_id]) {
        counts[s.technician_id] = { nome: s.users?.nome || 'Desconhecido', total: 0 };
      }
      counts[s.technician_id].total++;
    });

    return Object.values(counts)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  },
};
