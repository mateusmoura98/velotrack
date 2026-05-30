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
      // Ignore test services in real KPIs
      if (s.is_test) return;

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
      if (s.is_test) return; // ignore test services
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

  getFinancialStats: async (filters = {}) => {
    const now = new Date();
    
    // 1. Core Source of Truth Queries (v_service_metrics and service_events)
    let metricsData = [];
    let queryError = null;

    try {
      const { data, error } = await supabase
        .from('v_service_metrics')
        .select('*');
      if (error) throw error;
      metricsData = data || [];
    } catch (err) {
      queryError = err;
      // Failover fallback with identical parsing rules if view is missing/migrating
      const { data } = await supabase
        .from('servicos')
        .select('*, users(nome)');
      metricsData = (data || []).map(s => {
        const meta = s.metadata || {};
        return {
          id: s.id,
          cliente: s.cliente,
          status: s.status,
          tipo: s.tipo,
          technician_id: s.technician_id || s.users?.id,
          technician_nome: s.users?.nome || 'Não definido',
          created_at: s.created_at,
          tempo_fim: s.tempo_fim,
          is_test: s.is_test || false,
          valor_servico: s.valor_servico || meta.billing?.valServico || '0,00',
          status_pagamento: s.status_pagamento || (meta.billing?.isPago ? 'pago' : 'pendente'),
          forma_pagamento: s.forma_pagamento || meta.billing?.formaPagamento || 'Pix',
          data_pagamento: s.data_pagamento || null
        };
      });
    }

    // Helper to parse decimal values safely
    const parseCurrency = (val) => {
      if (!val) return 0;
      const strVal = String(val).replace(/[^\d,.-]/g, '').replace(',', '.');
      const num = parseFloat(strVal);
      return isNaN(num) ? 0 : num;
    };

    // Calculate real values from raw repository for AUTOMATIC AUDIT comparison
    let rawDbSum = 0;
    try {
      const { data: rawServices } = await supabase
        .from('servicos')
        .select('status, is_test, valor_servico, metadata, status_pagamento');
      
      (rawServices || []).forEach(s => {
        if (s.is_test) return; // Ignore test OS
        if (s.status === 'concluido' && s.status_pagamento !== 'cancelado') {
          const val = s.valor_servico || s.metadata?.billing?.valServico || 0;
          rawDbSum += parseCurrency(val);
        }
      });
    } catch (e) {
      console.warn("Audit raw fetch warn:", e);
    }

    // Filters application
    const filteredMetrics = metricsData.filter(item => {
      // Exclude test OS from real KPIs
      if (item.is_test) return false;

      // Filter by period
      if (filters.periodo && filters.periodo !== 'todas') {
        const itemDate = new Date(item.created_at);
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
        if (filters.periodo === 'hoje') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (filters.periodo === '7d') {
          if (diffDays > 7) return false;
        } else if (filters.periodo === 'mes') {
          if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      // Filter by technician
      if (filters.tecnico && filters.tecnico !== 'todos' && String(item.technician_id) !== String(filters.tecnico)) {
        return false;
      }

      // Filter by main status
      if (filters.status && filters.status !== 'todos' && item.status !== filters.status) {
        return false;
      }

      // Filter by service type
      if (filters.tipo_servico && filters.tipo_servico !== 'todos' && item.tipo !== filters.tipo_servico) {
        return false;
      }

      // Filter by payment method
      if (filters.forma_pagamento && filters.forma_pagamento !== 'todos' && item.forma_pagamento !== filters.forma_pagamento) {
        return false;
      }

      return true;
    });

    let receitaTotal = 0;
    let receitaMensal = 0;
    let receitaSemanal = 0;
    
    let receitaMesPassado = 0;

    let totalConcluidosCount = 0;
    let servicosPagosCount = 0;
    let servicosPendentesCount = 0;

    const techMap = {};
    const typeMap = {};

    filteredMetrics.forEach(item => {
      const val = parseCurrency(item.valor_servico);
      const isConcluidoAndNotCanceled = item.status === 'concluido' && item.status_pagamento !== 'cancelado';

      if (isConcluidoAndNotCanceled) {
        receitaTotal += val;
        totalConcluidosCount++;

        // Monthly / Weekly splits
        const fd = item.tempo_fim ? new Date(item.tempo_fim) : new Date(item.created_at);
        const diffDays = (now - fd) / (1000 * 60 * 60 * 24);

        if (fd.getMonth() === now.getMonth() && fd.getFullYear() === now.getFullYear()) {
          receitaMensal += val;
        }

        // Compare last month for Growth calculation
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYr = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (fd.getMonth() === lastMonth && fd.getFullYear() === lastMonthYr) {
          receitaMesPassado += val;
        }

        if (diffDays <= 7) {
          receitaSemanal += val;
        }

        // Tech distribution
        const tId = item.technician_id || 'unassigned';
        const tName = item.technician_nome || 'Sem Técnico';
        if (!techMap[tId]) techMap[tId] = { nome: tName, valor: 0 };
        techMap[tId].valor += val;

        // Type distribution
        const sType = item.tipo || 'Instalação';
        if (!typeMap[sType]) typeMap[sType] = { tipo: sType, valor: 0 };
        typeMap[sType].valor += val;
      }

      // Counts by payment status
      if (item.status_pagamento === 'pago') {
        servicosPagosCount++;
      } else if (item.status_pagamento === 'pendente' || item.status_pagamento === 'parcial') {
        servicosPendentesCount++;
      }
    });

    const ticketMedio = totalConcluidosCount > 0 ? (receitaTotal / totalConcluidosCount) : 0;
    
    // Percentage growth calculation
    let crescimentoPercentual = 0;
    if (receitaMesPassado > 0) {
      crescimentoPercentual = ((receitaMensal - receitaMesPassado) / receitaMesPassado) * 100;
    } else if (receitaMensal > 0) {
      crescimentoPercentual = 100; // base growth from zero
    }

    // Check automatic audit divergence
    const autoAuditDivergente = Math.abs(receitaTotal - rawDbSum) > 0.1 && (filters.periodo === 'todas' || !filters.periodo) && (filters.tecnico === 'todos' || !filters.tecnico);

    return {
      receitaTotal,
      receitaMensal,
      receitaSemanal,
      ticketMedio,
      growth_percentage: crescimentoPercentual,
      servicosPagos: servicosPagosCount,
      servicosPendentes: servicosPendentesCount,
      receitaPorTecnico: Object.values(techMap).sort((a,b) => b.valor - a.valor),
      receitaPorTipo: Object.values(typeMap).sort((a,b) => b.valor - a.valor),
      divergenciaDetectada: autoAuditDivergente,
      auditLocal: rawDbSum,
      auditSaaS: receitaTotal
    };
  },

  restartTestEnvironment: async () => {
    // Admin action: deletes test OS, clear test metrics, clear test agenda. 
    // DOES NOT delete users, authentication, or event sourcing structure.
    const { error: delError } = await supabase
      .from('servicos')
      .delete()
      .eq('is_test', true);

    if (delError) throw delError;
    return { success: true };
  }
};
